const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getDefaultModel, getModelIds, getRuntime } = require('./runtimes');

const STORE_FILE = 'workspaces.json';
const SCHEMA_FIELDS = ['id', 'name', 'path', 'runtime', 'model', 'lastAccess'];

function resolveAppDataPath(options = {}) {
  if (options.appDataPath) {
    return path.resolve(options.appDataPath);
  }

  if (options.app && typeof options.app.getPath === 'function') {
    return options.app.getPath('userData');
  }

  if (process.env.APPDATA) {
    return path.join(process.env.APPDATA, 'swarm');
  }

  return path.join(os.homedir(), 'AppData', 'Roaming', 'swarm');
}

function getStorePath(options = {}) {
  return path.join(resolveAppDataPath(options), STORE_FILE);
}

function ensureStore(options = {}) {
  const appDataPath = resolveAppDataPath(options);
  fs.mkdirSync(appDataPath, { recursive: true });

  const storePath = path.join(appDataPath, STORE_FILE);
  if (!fs.existsSync(storePath)) {
    writeStore({ workspaces: [] }, options);
  }

  return storePath;
}

function readStore(options = {}) {
  const storePath = getStorePath(options);
  if (!fs.existsSync(storePath)) {
    return { workspaces: [] };
  }

  const raw = fs.readFileSync(storePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.workspaces)) {
    throw new Error('Invalid workspaces store: expected { workspaces: [] }');
  }

  return {
    workspaces: parsed.workspaces.map(normalizeWorkspaceRecord)
  };
}

function writeStore(store, options = {}) {
  const appDataPath = resolveAppDataPath(options);
  fs.mkdirSync(appDataPath, { recursive: true });

  const cleanStore = {
    workspaces: Array.isArray(store.workspaces)
      ? store.workspaces.map(normalizeWorkspaceRecord)
      : []
  };

  fs.writeFileSync(
    path.join(appDataPath, STORE_FILE),
    `${JSON.stringify(cleanStore, null, 2)}\n`,
    'utf8'
  );
}

function listWorkspaces(options = {}) {
  return readStore(options).workspaces.sort((a, b) => {
    return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime();
  });
}

function createWorkspace(input = {}) {
  const runtime = getRuntime(input.runtime);
  const workspacePath = resolveWorkspacePath(input.path);
  const now = new Date().toISOString();
  const workspace = normalizeWorkspaceRecord({
    id: createId(),
    name: path.basename(workspacePath),
    path: workspacePath,
    runtime: runtime.id,
    model: resolveModel(runtime, input.model),
    lastAccess: now
  });

  const storeOptions = getStoreOptions(input);
  const store = readStore(storeOptions);
  const existingIndex = store.workspaces.findIndex((item) => item.path === workspace.path);
  let savedWorkspace = workspace;

  if (existingIndex >= 0) {
    savedWorkspace = {
      ...store.workspaces[existingIndex],
      runtime: workspace.runtime,
      model: workspace.model,
      lastAccess: now
    };
    store.workspaces[existingIndex] = savedWorkspace;
  } else {
    store.workspaces.push(workspace);
  }

  const bootstrap = bootstrapWorkspace({
    workspacePath,
    runtime: runtime.id
  });

  writeStore(store, storeOptions);

  return {
    workspace: savedWorkspace,
    bootstrap,
    workspaces: listWorkspaces(storeOptions)
  };
}

function updateWorkspaceRuntime(input = {}) {
  const runtime = getRuntime(input.runtime);
  const storeOptions = getStoreOptions(input);
  const store = readStore(storeOptions);
  const index = findWorkspaceIndex(store, input.id);
  const workspace = store.workspaces[index];

  workspace.runtime = runtime.id;
  workspace.model = resolveModel(runtime, input.model);
  workspace.lastAccess = new Date().toISOString();

  const bootstrap = bootstrapWorkspace({
    workspacePath: workspace.path,
    runtime: runtime.id
  });

  writeStore(store, storeOptions);

  return {
    workspace: normalizeWorkspaceRecord(workspace),
    bootstrap,
    workspaces: listWorkspaces(storeOptions)
  };
}

function updateWorkspaceModel(input = {}) {
  const storeOptions = getStoreOptions(input);
  const store = readStore(storeOptions);
  const index = findWorkspaceIndex(store, input.id);
  const workspace = store.workspaces[index];
  const runtime = getRuntime(workspace.runtime);

  workspace.model = resolveModel(runtime, input.model);
  workspace.lastAccess = new Date().toISOString();
  writeStore(store, storeOptions);

  return {
    workspace: normalizeWorkspaceRecord(workspace),
    workspaces: listWorkspaces(storeOptions)
  };
}

function touchWorkspace(input = {}) {
  const storeOptions = getStoreOptions(input);
  const store = readStore(storeOptions);
  const index = findWorkspaceIndex(store, input.id);
  const workspace = store.workspaces[index];

  workspace.lastAccess = new Date().toISOString();
  writeStore(store, storeOptions);

  return {
    workspace: normalizeWorkspaceRecord(workspace),
    workspaces: listWorkspaces(storeOptions)
  };
}

function bootstrapWorkspace(input = {}) {
  const runtime = getRuntime(input.runtime);
  const workspacePath = resolveWorkspacePath(input.workspacePath);
  const created = [];
  const preserved = [];

  const brainPath = path.join(workspacePath, 'brain.json');
  if (fs.existsSync(brainPath)) {
    preserved.push('brain.json');
  } else {
    fs.writeFileSync(brainPath, `${JSON.stringify(createBrain(), null, 2)}\n`, 'utf8');
    created.push('brain.json');
  }

  const rulesPath = path.join(workspacePath, runtime.rulesFile);
  if (fs.existsSync(rulesPath)) {
    preserved.push(runtime.rulesFile);
  } else {
    fs.writeFileSync(rulesPath, readRulesTemplate(runtime.rulesFile), 'utf8');
    created.push(runtime.rulesFile);
  }

  return { created, preserved };
}

function resolveWorkspacePath(workspacePath) {
  if (!workspacePath || typeof workspacePath !== 'string') {
    throw new Error('Workspace path is required');
  }

  const resolved = path.resolve(workspacePath);
  const stat = fs.existsSync(resolved) ? fs.statSync(resolved) : null;
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Workspace path must be an existing directory: ${resolved}`);
  }

  return resolved;
}

function getStoreOptions(input = {}) {
  return {
    app: input.app,
    appDataPath: input.appDataPath
  };
}

function normalizeWorkspaceRecord(record) {
  const normalized = {};
  for (const field of SCHEMA_FIELDS) {
    normalized[field] = record[field];
  }

  if (!normalized.id) {
    normalized.id = createId();
  }
  if (!normalized.path || typeof normalized.path !== 'string') {
    throw new Error('Workspace record path is required');
  }
  if (!normalized.name) {
    normalized.name = path.basename(normalized.path);
  }

  const runtime = getRuntime(normalized.runtime);
  normalized.runtime = runtime.id;
  normalized.model = resolveModel(runtime, normalized.model);
  normalized.path = path.resolve(normalized.path);
  normalized.lastAccess = normalized.lastAccess || new Date().toISOString();

  return normalized;
}

function resolveModel(runtime, model) {
  if (!model) {
    return getDefaultModel(runtime);
  }

  if (!getModelIds(runtime).includes(model)) {
    return getDefaultModel(runtime);
  }

  return model;
}

function findWorkspaceIndex(store, workspaceId) {
  const index = store.workspaces.findIndex((workspace) => workspace.id === workspaceId);
  if (index === -1) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return index;
}

function createId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
}

function createBrain() {
  return {
    project: {
      name: '',
      summary: ''
    },
    sessions: [],
    updatedAt: new Date().toISOString()
  };
}

function readRulesTemplate(rulesFile) {
  const templatePath = path.join(process.cwd(), rulesFile);
  if (fs.existsSync(templatePath)) {
    const content = fs.readFileSync(templatePath, 'utf8');
    return content.endsWith('\n') ? content : `${content}\n`;
  }

  return `# ${rulesFile} - Regras do Projeto AVANT IA\n\n- JavaScript puro, sem TypeScript.\n- Credenciais sempre em .env e nunca commitadas.\n`;
}

module.exports = {
  STORE_FILE,
  resolveAppDataPath,
  getStorePath,
  ensureStore,
  readStore,
  writeStore,
  listWorkspaces,
  createWorkspace,
  updateWorkspaceRuntime,
  updateWorkspaceModel,
  touchWorkspace,
  bootstrapWorkspace
};

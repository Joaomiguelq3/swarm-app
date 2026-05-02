const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  createWorkspace,
  getStorePath,
  listWorkspaces,
  readStore,
  updateWorkspaceRuntime
} = require('../src/workspaces');

function makeTempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `swarm-${name}-`));
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  const appDataPath = makeTempDir('appdata');
  const workspacePath = makeTempDir('workspace');

  const result = createWorkspace({
    path: workspacePath,
    runtime: 'codex',
    appDataPath
  });

  assert.ok(result.workspace.id, 'workspace id should exist');
  assert.strictEqual(result.workspace.name, path.basename(workspacePath));
  assert.strictEqual(result.workspace.path, workspacePath);
  assert.strictEqual(result.workspace.runtime, 'codex');
  assert.strictEqual(result.workspace.model, 'gpt-5.5');
  assert.ok(result.workspace.lastAccess, 'lastAccess should exist');

  assert.ok(fs.existsSync(getStorePath({ appDataPath })), 'workspaces.json should exist');
  assert.ok(fs.existsSync(path.join(workspacePath, 'brain.json')), 'brain.json should exist');
  assert.ok(fs.existsSync(path.join(workspacePath, 'AGENTS.md')), 'AGENTS.md should exist');
  assert.ok(!fs.existsSync(path.join(workspacePath, 'CLAUDE.md')), 'CLAUDE.md should not be created yet');

  const originalBrain = JSON.stringify({ keep: true }, null, 2);
  const originalAgents = '# custom agents\n';
  fs.writeFileSync(path.join(workspacePath, 'brain.json'), originalBrain, 'utf8');
  fs.writeFileSync(path.join(workspacePath, 'AGENTS.md'), originalAgents, 'utf8');

  const switched = updateWorkspaceRuntime({
    id: result.workspace.id,
    runtime: 'claude',
    appDataPath
  });

  assert.strictEqual(switched.workspace.runtime, 'claude');
  assert.strictEqual(switched.workspace.model, 'claude-sonnet-4-6');
  assert.ok(fs.existsSync(path.join(workspacePath, 'CLAUDE.md')), 'CLAUDE.md should exist after switch');
  assert.strictEqual(read(path.join(workspacePath, 'brain.json')), originalBrain);
  assert.strictEqual(read(path.join(workspacePath, 'AGENTS.md')), originalAgents);

  const store = readStore({ appDataPath });
  assert.strictEqual(store.workspaces.length, 1);
  const listed = listWorkspaces({ appDataPath });
  assert.strictEqual(listed.length, 1);
  assert.deepStrictEqual(Object.keys(listed[0]), ['id', 'name', 'path', 'runtime', 'model', 'lastAccess']);

  assert.throws(() => {
    createWorkspace({
      path: workspacePath,
      runtime: 'missing-runtime',
      appDataPath
    });
  }, /Unknown runtime/);

  console.log('smoke-workspaces ok');
}

main();

const RUNTIME_VIEW = {
  claude: {
    id: 'claude',
    label: 'CLAUDE CODE',
    badgeClass: 'badge-claude',
    models: [],
    defaultModel: ''
  },
  codex: {
    id: 'codex',
    label: 'CODEX',
    badgeClass: 'badge-codex',
    models: [],
    defaultModel: ''
  }
};

const PANE_STATUSES = ['IDLE', 'THINKING', 'WRITING', 'DONE', 'ERROR'];

const state = {
  workspaces: [],
  runtimes: {},
  loading: true,
  activeWorkspace: null,
  panes: createDefaultPanes(),
  feed: [],
  missionActive: false,
  launchInProgress: false,
  runtimeStatus: null,
  runtimeStatusLoading: false,
  swarmUnsubscribe: null,
  updateUnsubscribe: null,
  updateStatus: {
    kind: 'current',
    label: 'atualizado',
    action: 'check'
  },
  overlayTimer: null
};

const terminalInstances = new Map();

function getElement(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
}

function setHidden(id, hidden) {
  const element = getElement(id);
  if (element) {
    element.hidden = hidden;
  }
}

function clearChildren(id) {
  const element = getElement(id);
  if (element) {
    element.replaceChildren();
  }
  return element;
}

function getXtermCtor() {
  if (window.Terminal) {
    return window.Terminal;
  }
  if (window.XTerm && window.XTerm.Terminal) {
    return window.XTerm.Terminal;
  }
  return null;
}

function disposePaneTerminal(paneId) {
  const current = terminalInstances.get(Number(paneId));
  if (current && current.terminal && typeof current.terminal.dispose === 'function') {
    current.terminal.dispose();
  }
  terminalInstances.delete(Number(paneId));
}

function disposeAllTerminals() {
  for (const paneId of terminalInstances.keys()) {
    disposePaneTerminal(paneId);
  }
}

function mountPaneTerminal(pane, mount) {
  if (!mount) {
    return;
  }

  disposePaneTerminal(pane.id);
  const TerminalCtor = getXtermCtor();
  if (!TerminalCtor) {
    mount.textContent = 'xterm indisponivel';
    return;
  }

  const terminal = new TerminalCtor({
    convertEol: true,
    cursorBlink: true,
    disableStdin: false,
    fontFamily: 'Consolas, "Cascadia Mono", monospace',
    fontSize: 12,
    rows: 30,
    cols: 120,
    theme: {
      background: '#050505',
      foreground: '#d7ffd7',
      cursor: '#00ff88',
      selectionBackground: '#00ff8844',
      black: '#050505',
      red: '#ff4444',
      green: '#00ff88',
      yellow: '#ffaa00',
      blue: '#4488ff',
      magenta: '#aa66ff',
      cyan: '#00d7ff',
      white: '#f0f0f0'
    }
  });

  terminal.open(mount);
  terminal.onData((data) => {
    if (
      window.swarm &&
      window.swarm.orchestration &&
      typeof window.swarm.orchestration.input === 'function'
    ) {
      window.swarm.orchestration.input(pane.id, data);
    }
  });

  terminalInstances.set(Number(pane.id), { terminal });

  if (Array.isArray(pane.output) && pane.output.length > 0) {
    terminal.write(pane.output.join(''));
  } else {
    terminal.writeln('Codex aguardando inicio do novo projeto...');
  }
}

function writePaneTerminal(paneId, output) {
  const current = terminalInstances.get(Number(paneId));
  if (current && current.terminal) {
    current.terminal.write(String(output || ''));
  }
}

function setPaneStatusDom(paneId, status) {
  const article = document.querySelector(`.terminal-pane[data-pane-id="${paneId}"]`);
  if (!article) {
    return;
  }
  for (const item of PANE_STATUSES) {
    article.classList.remove(`status-${item.toLowerCase()}`);
  }
  article.classList.add(`status-${normalizeStatus(status).toLowerCase()}`);

  const dot = article.querySelector('.pane-status-dot');
  if (dot) {
    dot.className = `pane-status-dot status-${normalizeStatus(status).toLowerCase()}`;
  }

  const label = article.querySelector('.pane-status-label');
  if (label) {
    label.textContent = normalizeStatus(status);
  }
}

function buildNewProjectPrompt(description) {
  return `$gsd-new-project ${String(description || '').trim()}`;
}

function getRuntimeView(runtimeId) {
  const runtime = state.runtimes[runtimeId];
  if (runtime) {
    return {
      id: runtime.id || runtimeId,
      label: runtime.label || String(runtimeId).toUpperCase(),
      badgeClass: runtime.badge?.className || RUNTIME_VIEW[runtimeId]?.badgeClass || 'runtime-badge',
      models: Array.isArray(runtime.models) ? runtime.models : [],
      defaultModel: runtime.defaultModel || getModelId(runtime.models?.[0]) || ''
    };
  }

  return RUNTIME_VIEW[runtimeId] || {
    id: runtimeId || 'unknown',
    label: String(runtimeId || 'RUNTIME').toUpperCase(),
    badgeClass: 'runtime-badge',
    models: [],
    defaultModel: ''
  };
}

function getModelId(model) {
  return typeof model === 'string' ? model : model?.id || '';
}

function getModelLabel(model) {
  if (!model || typeof model === 'string') {
    return String(model || 'default');
  }
  return model.desc ? `${model.label || model.id} - ${model.desc}` : model.label || model.id;
}

function getModelIds(models) {
  return Array.isArray(models) ? models.map(getModelId).filter(Boolean) : [];
}

function createDefaultPanes() {
  return [1, 2, 3].map((index) => ({
    id: index,
    status: 'IDLE',
    output: [],
    taskTitle: ''
  }));
}

function setBridgeStatus(status, className) {
  const statusText = getElement('shell-status');
  const wrapper = statusText ? statusText.closest('.bridge-status') : null;
  if (statusText) {
    statusText.textContent = status;
  }
  if (wrapper) {
    wrapper.classList.remove('ready', 'error');
    if (className) {
      wrapper.classList.add(className);
    }
  }
}

function bindUpdateStatusButton() {
  const button = getElement('app-update-status');
  if (button) {
    button.addEventListener('click', handleUpdateStatusClick);
  }
  renderUpdateStatus();
}

function setUpdateStatus(kind, label, action) {
  state.updateStatus = {
    kind,
    label,
    action
  };
  renderUpdateStatus();
}

function renderUpdateStatus() {
  const button = getElement('app-update-status');
  const label = getElement('app-update-label');
  if (!button || !label) {
    return;
  }

  const status = state.updateStatus || {};
  button.classList.remove(
    'update-current',
    'update-stale',
    'update-checking',
    'update-downloading',
    'update-ready',
    'update-error',
    'update-installing'
  );
  button.classList.add(`update-${status.kind || 'current'}`);
  label.textContent = status.label || 'atualizado';

  const clickable = status.action === 'download' || status.action === 'install' || status.action === 'retry';
  button.disabled = status.action === 'wait';
  button.setAttribute('aria-disabled', String(button.disabled));
  button.title = clickable
    ? 'Clique para atualizar o AVANT IA'
    : 'AVANT IA atualizado';
}

async function handleUpdateStatusClick() {
  const status = state.updateStatus || {};
  if (status.action === 'download' || status.action === 'install' || status.action === 'retry') {
    await installDownloadedUpdate();
    return;
  }

  if (status.action === 'check') {
    await checkForUpdates(true);
  }
}

function initTypingLogo() {
  const target = getElement('typing-logo');
  if (!target) {
    return;
  }

  const word = 'AVANT IA';
  let index = 0;
  target.textContent = '';

  const timer = window.setInterval(() => {
    index += 1;
    target.textContent = word.slice(0, index);
    if (index >= word.length) {
      window.clearInterval(timer);
    }
  }, 90);
}

function initMatrixCanvas() {
  const canvas = getElement('matrix-canvas');
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const glyphs = '01{}[]<>/\\$#@AVANTIA';
  const fontSize = 16;
  let columns = 0;
  let drops = [];
  let lastFrame = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Math.ceil(window.innerWidth / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * window.innerHeight);
  }

  function draw(timestamp) {
    if (timestamp - lastFrame > 70) {
      context.fillStyle = 'rgba(10, 10, 10, 0.22)';
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = '#00ff88';
      context.font = `${fontSize}px Cascadia Code, Consolas, monospace`;

      for (let column = 0; column < columns; column += 1) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = column * fontSize;
        const y = drops[column];
        context.fillText(char, x, y);
        drops[column] = y > window.innerHeight + Math.random() * 900 ? 0 : y + fontSize;
      }

      lastFrame = timestamp;
    }

    window.requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  window.requestAnimationFrame(draw);
}

async function initBridgeStatus() {
  if (!window.swarm || typeof window.swarm.getAppInfo !== 'function') {
    setBridgeStatus('bridge missing', 'error');
    return;
  }

  try {
    const info = await window.swarm.getAppInfo();
    setBridgeStatus(info.status || 'ready', 'ready');
  } catch (error) {
    setBridgeStatus('bridge error', 'error');
  }
}

async function loadWorkspaces() {
  showLoading();

  if (!hasWorkspaceBridge('list')) {
    showError('workspace bridge missing');
    return;
  }

  try {
    state.workspaces = await window.swarm.workspaces.list();
    renderWorkspaces();
  } catch (error) {
    showError(error.message || 'erro ao carregar workspaces');
  }
}

function hasWorkspaceBridge(method) {
  return Boolean(
    window.swarm &&
    window.swarm.workspaces &&
    typeof window.swarm.workspaces[method] === 'function'
  );
}

async function loadRuntimeCatalog() {
  if (!hasRuntimeBridge('list')) {
    state.runtimes = {};
    return;
  }

  try {
    state.runtimes = await window.swarm.runtimes.list();
  } catch (error) {
    state.runtimes = {};
    addFeedEvent('error', error.message || 'erro ao carregar runtimes');
  }
}

function showLoading() {
  state.loading = true;
  setHidden('loading-state', false);
  setHidden('error-state', true);
  setHidden('empty-state', true);
}

function showError(message) {
  state.loading = false;
  setHidden('loading-state', true);
  setHidden('empty-state', true);
  const error = getElement('error-state');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function renderWorkspaces() {
  const grid = getElement('workspace-grid');
  if (!grid) {
    return;
  }

  state.loading = false;
  setHidden('loading-state', true);
  setHidden('error-state', true);
  setText('workspace-count', String(state.workspaces.length));
  grid.replaceChildren();

  if (state.workspaces.length === 0) {
    setHidden('empty-state', false);
    return;
  }

  setHidden('empty-state', true);
  for (const workspace of state.workspaces) {
    grid.appendChild(createWorkspaceCard(workspace));
  }
}

function createWorkspaceCard(workspace) {
  const runtime = getRuntimeView(workspace.runtime);
  const card = document.createElement('article');
  card.className = 'workspace-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir workspace ${workspace.name || 'workspace'}`);
  card.addEventListener('click', () => openWorkspace(workspace.id));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWorkspace(workspace.id);
    }
  });

  const header = document.createElement('div');
  header.className = 'workspace-card-header';

  const title = document.createElement('h3');
  title.className = 'workspace-name';
  title.textContent = workspace.name || 'workspace';

  const badge = createRuntimeBadge(runtime);
  header.append(title, badge);

  const workspacePath = document.createElement('p');
  workspacePath.className = 'workspace-path';
  workspacePath.textContent = workspace.path || '';

  const footer = document.createElement('div');
  footer.className = 'workspace-card-footer';

  const model = document.createElement('p');
  model.className = 'workspace-meta';
  model.textContent = `modelo: ${workspace.model || 'default'}`;

  const lastAccess = document.createElement('p');
  lastAccess.className = 'workspace-meta';
  lastAccess.textContent = formatDate(workspace.lastAccess);

  footer.append(model, lastAccess);
  card.append(header, workspacePath, footer);
  return card;
}

function createRuntimeBadge(runtime) {
  const badge = document.createElement('span');
  badge.className = `runtime-badge ${runtime.badgeClass}`;
  badge.dataset.runtime = runtime.id || '';
  badge.textContent = runtime.label;
  return badge;
}

function openWorkspace(workspaceId) {
  if (!workspaceId) {
    return;
  }
  window.location.href = `./workspace.html?id=${encodeURIComponent(workspaceId)}`;
}

function formatDate(value) {
  if (!value) {
    return 'sem data';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'sem data';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function openModal() {
  setHidden('workspace-modal', false);
  setHidden('form-error', true);
  const pathInput = getElement('workspace-path');
  if (pathInput) {
    pathInput.focus();
  }
}

function closeModal() {
  setHidden('workspace-modal', true);
  const form = getElement('workspace-form');
  if (form) {
    form.reset();
  }
}

function bindModalEvents() {
  const openButtons = document.querySelectorAll('[data-open-workspace-modal], #new-workspace-button');
  for (const button of openButtons) {
    button.addEventListener('click', openModal);
  }

  const closeButtons = document.querySelectorAll('[data-close-workspace-modal], #close-workspace-modal');
  for (const button of closeButtons) {
    button.addEventListener('click', closeModal);
  }

  const backdrop = getElement('workspace-modal');
  if (backdrop) {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });
  }

  const form = getElement('workspace-form');
  if (form) {
    form.addEventListener('submit', createWorkspace);
  }

  const folderButton = getElement('select-workspace-folder');
  if (folderButton) {
    folderButton.addEventListener('click', selectWorkspaceFolder);
  }
}

async function selectWorkspaceFolder() {
  if (!hasWorkspaceBridge('selectDirectory')) {
    showFormError('seletor de pasta indisponivel');
    return;
  }

  const button = getElement('select-workspace-folder');
  const input = getElement('workspace-path');

  if (button) {
    button.disabled = true;
    button.textContent = 'abrindo...';
  }

  try {
    const result = await window.swarm.workspaces.selectDirectory();
    if (result && !result.canceled && result.path && input) {
      input.value = result.path;
      input.focus();
      setHidden('form-error', true);
    }
  } catch (error) {
    showFormError(error.message || 'erro ao selecionar pasta');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'escolher';
    }
  }
}

async function createWorkspace(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formError = getElement('form-error');
  const submit = getElement('create-workspace-button');
  const formData = new FormData(form);
  const workspacePath = String(formData.get('path') || '').trim();
  const runtime = String(formData.get('runtime') || 'codex');

  if (!workspacePath) {
    showFormError('Informe o path da pasta.');
    return;
  }

  if (!hasWorkspaceBridge('create')) {
    showFormError('workspace bridge missing');
    return;
  }

  if (submit) {
    submit.disabled = true;
    submit.textContent = 'criando...';
  }
  if (formError) {
    formError.hidden = true;
  }

  try {
    await window.swarm.workspaces.create({ path: workspacePath, runtime });
    closeModal();
    await loadWorkspaces();
  } catch (error) {
    showFormError(error.message || 'erro ao criar workspace');
  } finally {
    if (submit) {
      submit.disabled = false;
      submit.textContent = 'criar';
    }
  }
}

function showFormError(message) {
  const formError = getElement('form-error');
  if (formError) {
    formError.textContent = message;
    formError.hidden = false;
  }
}

function initHome() {
  initTypingLogo();
  initMatrixCanvas();
  bindModalEvents();
  bindUpdateStatusButton();
  subscribeToUpdates();
  initBridgeStatus();
  checkForUpdates(false);
  loadWorkspaces();
}

async function initWorkspace() {
  showWorkspaceLoading();
  bindWorkspaceEvents();
  bindUpdateStatusButton();
  subscribeToOrchestration();
  subscribeToUpdates();
  checkForUpdates(false);
  await loadRuntimeCatalog();

  if (!hasWorkspaceBridge('list')) {
    showWorkspaceError('workspace bridge missing');
    return;
  }

  const workspaceId = getWorkspaceIdFromUrl();
  if (!workspaceId) {
    showWorkspaceError('workspace id ausente');
    return;
  }

  try {
    state.workspaces = await window.swarm.workspaces.list();
    const activeWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId);
    if (!activeWorkspace) {
      showWorkspaceError(`workspace nao encontrado: ${workspaceId}`);
      return;
    }

    state.activeWorkspace = activeWorkspace;
    if (hasWorkspaceBridge('touch')) {
      const result = await window.swarm.workspaces.touch(workspaceId);
      applyWorkspaceResult(result);
    }

    showWorkspaceContent();
    addFeedEvent('workspace', `workspace carregado: ${state.activeWorkspace.name}`);
    renderWorkspace();
    refreshRuntimeStatus(false);
  } catch (error) {
    showWorkspaceError(error.message || 'erro ao abrir workspace');
  }
}

function getWorkspaceIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function showWorkspaceLoading() {
  setHidden('workspace-loading', false);
  setHidden('workspace-error', true);
  setHidden('workspace-content', true);
}

function showWorkspaceContent() {
  setHidden('workspace-loading', true);
  setHidden('workspace-error', true);
  setHidden('workspace-content', false);
}

function showWorkspaceError(message) {
  setHidden('workspace-loading', true);
  setHidden('workspace-content', true);
  const error = getElement('workspace-error');
  if (error) {
    error.hidden = false;
    const messageNode = getElement('workspace-error-message');
    if (messageNode) {
      messageNode.textContent = message;
    } else {
      error.textContent = message;
    }
  }
}

function bindWorkspaceEvents() {
  const runtimeSelect = getElement('runtime-select');
  if (runtimeSelect) {
    runtimeSelect.addEventListener('change', handleRuntimeChange);
  }

  const modelSelect = getElement('model-select');
  if (modelSelect) {
    modelSelect.addEventListener('change', handleModelChange);
  }

  const launchButton = getElement('launch-swarm-button');
  if (launchButton) {
    launchButton.addEventListener('click', handleLaunch);
  }

  const stopButton = getElement('stop-swarm-button');
  if (stopButton) {
    stopButton.addEventListener('click', handleStopSwarm);
  }

  const loginButton = getElement('runtime-login-button');
  if (loginButton) {
    loginButton.addEventListener('click', handleRuntimeLogin);
  }

  const checkButton = getElement('runtime-check-button');
  if (checkButton) {
    checkButton.addEventListener('click', () => refreshRuntimeStatus(true));
  }
}

function hasOrchestrationBridge(method) {
  return Boolean(
    window.swarm &&
    window.swarm.orchestration &&
    typeof window.swarm.orchestration[method] === 'function'
  );
}

function subscribeToOrchestration() {
  if (state.swarmUnsubscribe) {
    state.swarmUnsubscribe();
    state.swarmUnsubscribe = null;
  }

  if (!hasOrchestrationBridge('onEvent')) {
    return;
  }

  state.swarmUnsubscribe = window.swarm.orchestration.onEvent(handleSwarmEvent);
}

function hasUpdateBridge(method) {
  return Boolean(
    window.swarm &&
    window.swarm.updates &&
    typeof window.swarm.updates[method] === 'function'
  );
}

function subscribeToUpdates() {
  if (state.updateUnsubscribe) {
    state.updateUnsubscribe();
    state.updateUnsubscribe = null;
  }

  if (!hasUpdateBridge('onEvent')) {
    return;
  }

  state.updateUnsubscribe = window.swarm.updates.onEvent(handleUpdateEvent);
}

async function checkForUpdates(reportSkipped) {
  if (!hasUpdateBridge('check')) {
    return;
  }

  try {
    setUpdateStatus('checking', 'verificando...', 'wait');
    const result = await window.swarm.updates.check();
    if (result && result.skipped && reportSkipped) {
      addFeedEvent('runtime', result.message);
    }
    if (result && result.skipped) {
      setUpdateStatus('current', 'atualizado', 'check');
    }
  } catch (error) {
    setUpdateStatus('error', 'desatualizado', 'retry');
    addFeedEvent('error', error.message || 'erro ao verificar atualizacao');
  }
}

async function installDownloadedUpdate() {
  if (!hasUpdateBridge('install')) {
    return;
  }

  try {
    setUpdateStatus('downloading', 'atualizando...', 'wait');
    const result = await window.swarm.updates.install();
    if (result && result.action === 'installing') {
      setUpdateStatus('installing', 'instalando...', 'wait');
      addFeedEvent('runtime', result.message || 'instalando atualizacao');
    }
    if (result && result.action === 'downloading') {
      setUpdateStatus('downloading', 'baixando...', 'wait');
    }
  } catch (error) {
    setUpdateStatus('error', 'desatualizado', 'retry');
    addFeedEvent('error', error.message || 'erro ao instalar atualizacao');
  }
}

function handleUpdateEvent(event = {}) {
  if (event.type === 'checking') {
    setUpdateStatus('checking', 'verificando...', 'wait');
    addFeedEvent('runtime', 'verificando atualizacoes do AVANT IA');
    return;
  }
  if (event.type === 'available') {
    setUpdateStatus('stale', 'desatualizado', 'download');
    addFeedEvent('runtime', `atualizacao disponivel: ${event.version}`);
    return;
  }
  if (event.type === 'not-available') {
    setUpdateStatus('current', 'atualizado', 'check');
    addFeedEvent('runtime', 'AVANT IA ja esta atualizado');
    return;
  }
  if (event.type === 'download-progress') {
    setUpdateStatus('downloading', `baixando ${event.percent}%`, 'wait');
    addFeedEvent('runtime', `baixando atualizacao: ${event.percent}%`);
    return;
  }
  if (event.type === 'downloaded') {
    setUpdateStatus('ready', 'instalar', 'install');
    addFeedEvent('runtime', `atualizacao ${event.version} baixada`);
    addFeedEvent('runtime', 'clique em instalar para fechar e aplicar a atualizacao');
    return;
  }
  if (event.type === 'installing') {
    setUpdateStatus('installing', 'instalando...', 'wait');
    addFeedEvent('runtime', event.message || 'instalando atualizacao');
    return;
  }
  if (event.type === 'error') {
    setUpdateStatus('error', 'desatualizado', 'retry');
    addFeedEvent('error', event.message || 'erro no auto-update');
  }
}

function renderWorkspace() {
  if (!state.activeWorkspace) {
    return;
  }

  renderWorkspaceHeader();
  renderWorkspaceTabs();
  renderPanes();
  renderRuntimeControls();
  renderNodePanel();
  renderRuntimeAccount();
  renderFeed();
  updateStopButtonState();
}

function renderWorkspaceHeader() {
  const workspace = state.activeWorkspace;
  const runtime = getRuntimeView(workspace.runtime);
  setText('active-workspace-name', workspace.name || 'AVANT IA');
  setText('active-workspace-path', workspace.path || '');
  setText('active-workspace-model', workspace.model || 'default');

  const badgeSlot = clearChildren('active-runtime-badge');
  if (badgeSlot) {
    badgeSlot.appendChild(createRuntimeBadge(runtime));
  }
}

function renderWorkspaceTabs() {
  const tabList = clearChildren('workspace-tabs');
  if (!tabList) {
    return;
  }

  for (const workspace of state.workspaces) {
    const runtime = getRuntimeView(workspace.runtime);
    const tab = document.createElement('button');
    tab.className = 'workspace-tab';
    tab.type = 'button';
    tab.dataset.workspaceId = workspace.id;
    tab.setAttribute('aria-selected', String(workspace.id === state.activeWorkspace.id));
    tab.addEventListener('click', () => openWorkspace(workspace.id));

    const label = document.createElement('span');
    label.className = 'workspace-tab-name';
    label.textContent = workspace.name || 'workspace';

    const badge = document.createElement('span');
    badge.className = `workspace-tab-badge ${runtime.badgeClass}`;
    badge.textContent = runtime.label;
    tab.append(label, badge);
    tabList.appendChild(tab);
  }

  const add = document.createElement('button');
  add.className = 'workspace-tab add-tab';
  add.type = 'button';
  add.textContent = '+';
  add.setAttribute('aria-label', 'Adicionar workspace');
  add.addEventListener('click', () => {
    window.location.href = './home.html';
  });
  tabList.appendChild(add);
}

function renderPanes() {
  const grid = clearChildren('pane-grid');
  if (!grid || !state.activeWorkspace) {
    return;
  }

  const runtime = getRuntimeView(state.activeWorkspace.runtime);
  for (const pane of state.panes) {
    const status = normalizeStatus(pane.status);
    const article = document.createElement('article');
    article.className = `terminal-pane status-${status.toLowerCase()}`;
    article.dataset.paneId = String(pane.id);

    const header = document.createElement('div');
    header.className = 'pane-header';

    const title = document.createElement('div');
    title.className = 'pane-title';
    title.textContent = `PANE ${String(pane.id).padStart(2, '0')}`;

    const meta = document.createElement('div');
    meta.className = 'pane-meta';

    const dot = document.createElement('span');
    dot.className = `pane-status-dot status-${status.toLowerCase()}`;
    dot.setAttribute('aria-hidden', 'true');

    const runtimeBadge = document.createElement('span');
    runtimeBadge.className = `pane-runtime ${runtime.badgeClass}`;
    runtimeBadge.textContent = runtime.label;

    const statusLabel = document.createElement('span');
    statusLabel.className = 'pane-status-label';
    statusLabel.textContent = status;

    meta.append(dot, runtimeBadge, statusLabel);
    header.append(title, meta);

    const body = document.createElement('div');
    body.className = 'terminal-surface';
    body.dataset.terminalMount = String(pane.id);

    if (pane.taskTitle) {
      const task = document.createElement('p');
      task.className = 'terminal-task';
      task.textContent = pane.taskTitle;
      body.appendChild(task);
    }

    const terminalMount = document.createElement('div');
    terminalMount.className = 'xterm-mount';
    terminalMount.dataset.paneTerminal = String(pane.id);
    body.appendChild(terminalMount);

    article.append(header, body);
    grid.appendChild(article);
    mountPaneTerminal(pane, terminalMount);
  }
}

function normalizeStatus(status) {
  return PANE_STATUSES.includes(status) ? status : 'IDLE';
}

function renderRuntimeControls() {
  const workspace = state.activeWorkspace;
  if (!workspace) {
    return;
  }

  const runtimeSelect = getElement('runtime-select');
  if (runtimeSelect) {
    runtimeSelect.replaceChildren();
    const runtimes = Object.keys(state.runtimes).length > 0
      ? Object.values(state.runtimes)
      : Object.values(RUNTIME_VIEW);
    for (const runtime of runtimes) {
      const runtimeView = getRuntimeView(runtime.id);
      const option = document.createElement('option');
      option.value = runtimeView.id;
      option.textContent = runtimeView.label;
      option.selected = runtimeView.id === workspace.runtime;
      runtimeSelect.appendChild(option);
    }
  }

  renderModelOptions(workspace.runtime, workspace.model);
}

function renderModelOptions(runtimeId, selectedModel) {
  const modelSelect = getElement('model-select');
  const runtime = getRuntimeView(runtimeId);
  if (!modelSelect) {
    return;
  }

  const models = runtime.models.length > 0 ? runtime.models : [{ id: selectedModel || 'default' }];
  const modelIds = getModelIds(models);
  const nextModel = modelIds.includes(selectedModel) ? selectedModel : runtime.defaultModel || modelIds[0];
  modelSelect.replaceChildren();

  for (const model of models) {
    const modelId = getModelId(model);
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = getModelLabel(model);
    option.selected = modelId === nextModel;
    modelSelect.appendChild(option);
  }
}

function renderNodePanel() {
  const workspace = state.activeWorkspace;
  if (!workspace) {
    return;
  }

  const runtime = getRuntimeView(workspace.runtime);
  setText('node-workspace-name', workspace.name || 'workspace');
  setText('node-workspace-path', workspace.path || '');
  setText('node-model-value', workspace.model || 'default');
  setText('node-danger-state', 'DANGER OFF');
  const activeCount = state.panes.filter((pane) => ['THINKING', 'WRITING'].includes(pane.status)).length;
  setText('node-process-state', `processos ativos: ${activeCount}`);

  const badgeSlot = clearChildren('node-runtime-badge');
  if (badgeSlot) {
    badgeSlot.appendChild(createRuntimeBadge(runtime));
  }
}

function hasRuntimeBridge(method) {
  return Boolean(
    window.swarm &&
    window.swarm.runtimes &&
    typeof window.swarm.runtimes[method] === 'function'
  );
}

function renderRuntimeAccount() {
  const workspace = state.activeWorkspace;
  if (!workspace) {
    return;
  }

  const runtime = getRuntimeView(workspace.runtime);
  const status = state.runtimeStatus && state.runtimeStatus.runtime === workspace.runtime
    ? state.runtimeStatus
    : null;
  const statusKind = state.runtimeStatusLoading ? 'unknown' : status?.status || 'unknown';

  setText('runtime-account-title', runtime.label);
  setText('runtime-account-status', getRuntimeStatusText(runtime, status, state.runtimeStatusLoading));

  const dot = getElement('runtime-account-dot');
  if (dot) {
    dot.className = `account-dot account-${statusKind}`;
  }

  const loginButton = getElement('runtime-login-button');
  if (loginButton) {
    loginButton.textContent = `login ${runtime.label}`;
    loginButton.disabled = state.runtimeStatusLoading;
  }

  const checkButton = getElement('runtime-check-button');
  if (checkButton) {
    checkButton.disabled = state.runtimeStatusLoading;
    checkButton.textContent = state.runtimeStatusLoading ? 'verificando...' : 'verificar';
  }
}

function getRuntimeStatusText(runtime, status, loading) {
  if (loading) {
    return `verificando CLI ${runtime.label} no PATH...`;
  }
  if (!hasRuntimeBridge('status')) {
    return 'bridge de runtime indisponivel';
  }
  if (!status || status.runtime !== runtime.id) {
    return `clique em verificar para validar ${runtime.label}`;
  }
  if (status.status === 'available') {
    return `${runtime.label} disponivel: ${status.message}`;
  }
  if (status.status === 'missing') {
    return `${runtime.label} nao encontrado. Clique em login depois confirme se o CLI esta instalado no PATH.`;
  }
  return `${runtime.label}: ${status.message || 'erro ao verificar runtime'}`;
}

async function refreshRuntimeStatus(reportToFeed = false) {
  const workspace = state.activeWorkspace;
  if (!workspace || !hasRuntimeBridge('status')) {
    return;
  }

  state.runtimeStatusLoading = true;
  renderRuntimeAccount();

  try {
    const result = await window.swarm.runtimes.status(workspace.runtime);
    state.runtimeStatus = result;
    if (reportToFeed) {
      addFeedEvent(result.status === 'available' ? 'runtime' : 'error', result.message);
    }
  } catch (error) {
    state.runtimeStatus = {
      runtime: workspace.runtime,
      status: 'error',
      message: error.message || 'erro ao verificar runtime'
    };
    if (reportToFeed) {
      addFeedEvent('error', state.runtimeStatus.message);
    }
  } finally {
    state.runtimeStatusLoading = false;
    renderRuntimeAccount();
  }
}

async function handleRuntimeLogin() {
  const workspace = state.activeWorkspace;
  if (!workspace || !hasRuntimeBridge('login')) {
    addFeedEvent('error', 'login de runtime indisponivel');
    return;
  }

  const loginButton = getElement('runtime-login-button');
  const runtime = getRuntimeView(workspace.runtime);
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.textContent = 'abrindo terminal...';
  }
  addFeedEvent('runtime', `abrindo terminal de login para ${runtime.label}`);

  try {
    const result = await window.swarm.runtimes.login(workspace.runtime);
    if (result && result.ok) {
      addFeedEvent('runtime', result.message || `terminal aberto para ${result.label || runtime.label}`);
      addFeedEvent('runtime', 'depois de autenticar no browser, clique em verificar');
    } else {
      addFeedEvent('error', result?.error || 'erro ao abrir login do runtime');
    }
    renderRuntimeAccount();
  } catch (error) {
    addFeedEvent('error', error.message || 'erro ao abrir login do runtime');
  } finally {
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.textContent = `login ${runtime.label}`;
    }
  }
}

function renderFeed() {
  const feed = clearChildren('activity-feed');
  if (!feed) {
    return;
  }

  const entries = state.feed.slice(0, 8);
  if (entries.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'feed-entry muted';
    empty.textContent = 'feed aguardando eventos locais';
    feed.appendChild(empty);
    return;
  }

  for (const event of entries) {
    const item = document.createElement('li');
    item.className = `feed-entry feed-${event.type}`;
    const time = document.createElement('span');
    time.className = 'feed-time';
    time.textContent = event.time;
    const message = document.createElement('span');
    message.textContent = event.message;
    item.append(time, message);
    feed.appendChild(item);
  }
}

function addFeedEvent(type, message) {
  const now = new Date();
  state.feed.unshift({
    type,
    message: sanitizeVisibleText(message),
    time: now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  });
  renderFeed();
}

async function handleRuntimeChange(event) {
  const nextRuntime = event.currentTarget.value;
  const workspace = state.activeWorkspace;
  if (!workspace || nextRuntime === workspace.runtime) {
    return;
  }

  const nextModel = resolveModelForRuntime(nextRuntime);
  setWorkspaceControlsDisabled(true);

  try {
    await stopActiveProcesses('runtime-switch');
    const result = await window.swarm.workspaces.updateRuntime(workspace.id, nextRuntime, nextModel);
    applyWorkspaceResult(result);
    state.runtimeStatus = null;
    addFeedEvent('runtime', `runtime alterado para ${getRuntimeView(nextRuntime).label}`);
    renderWorkspace();
    refreshRuntimeStatus(false);
  } catch (error) {
    addFeedEvent('error', error.message || 'erro ao trocar runtime');
    renderWorkspace();
  } finally {
    setWorkspaceControlsDisabled(false);
  }
}

async function handleModelChange(event) {
  const nextModel = event.currentTarget.value;
  const workspace = state.activeWorkspace;
  if (!workspace || nextModel === workspace.model) {
    return;
  }

  setWorkspaceControlsDisabled(true);
  try {
    const result = await window.swarm.workspaces.updateModel(workspace.id, nextModel);
    applyWorkspaceResult(result);
    addFeedEvent('model', `modelo alterado para ${nextModel}`);
    renderWorkspace();
  } catch (error) {
    addFeedEvent('error', error.message || 'erro ao trocar modelo');
    renderWorkspace();
  } finally {
    setWorkspaceControlsDisabled(false);
  }
}

function resolveModelForRuntime(runtimeId) {
  const runtime = getRuntimeView(runtimeId);
  const modelSelect = getElement('model-select');
  const modelIds = getModelIds(runtime.models);
  if (modelSelect && modelIds.includes(modelSelect.value)) {
    return modelSelect.value;
  }
  return runtime.defaultModel || modelIds[0] || 'default';
}

async function stopActiveProcesses(reason) {
  if (hasOrchestrationBridge('stop')) {
    try {
      await window.swarm.orchestration.stop(reason);
    } catch (error) {
      addFeedEvent('error', error.message || 'erro ao parar orquestracao');
    }
  }

  state.missionActive = false;
  state.launchInProgress = false;
  disposeAllTerminals();
  state.panes = state.panes.map((pane) => ({
    ...pane,
    status: 'IDLE',
    taskTitle: ''
  }));
  hideLaunchOverlay();
  addFeedEvent('process', `terminais parados: ${reason}`);
  renderPanes();
  renderNodePanel();
  updateStopButtonState();
}

async function handleStopSwarm() {
  await stopActiveProcesses('user-stop');
}

async function handleLaunch() {
  const workspace = state.activeWorkspace;
  const missionInput = getElement('mission-input');
  const agentInput = getElement('agent-count');
  const projectPrompt = missionInput ? missionInput.value.trim() : '';
  const agentCount = agentInput ? Number.parseInt(agentInput.value, 10) : 3;
  const launchRuntime = 'codex';

  if (!workspace) {
    addFeedEvent('error', 'workspace ativo ausente');
    return;
  }
  if (!projectPrompt) {
    addFeedEvent('error', 'informe o prompt do novo projeto antes de iniciar os terminais');
    return;
  }
  if (!hasOrchestrationBridge('launch')) {
    addFeedEvent('error', 'orchestration bridge missing');
    return;
  }

  if (workspace.runtime !== launchRuntime && window.swarm?.workspaces?.updateRuntime) {
    const nextModel = resolveModelForRuntime(launchRuntime);
    const result = await window.swarm.workspaces.updateRuntime(workspace.id, launchRuntime, nextModel);
    applyWorkspaceResult(result);
    addFeedEvent('runtime', 'runtime alterado para CODEX para iniciar novo projeto');
  }

  if (hasRuntimeBridge('status')) {
    await refreshRuntimeStatus(false);
    if (!state.runtimeStatus || state.runtimeStatus.runtime !== launchRuntime || state.runtimeStatus.status !== 'available') {
      addFeedEvent('error', `verifique se o CLI ${getRuntimeView(launchRuntime).label} esta disponivel antes de iniciar`);
      return;
    }
  }

  const mission = buildNewProjectPrompt(projectPrompt);
  state.launchInProgress = true;
  setWorkspaceControlsDisabled(true);
  updateStopButtonState();
  addFeedEvent('mission', `terminal 1 inicia o novo projeto; ${Math.max(0, agentCount - 1)} terminal(is) ficam livres no mesmo projeto`);

  try {
    const activeWorkspace = state.activeWorkspace || workspace;
    const result = await window.swarm.orchestration.launch({
      mission,
      agentCount,
      workspace: activeWorkspace,
      workspacePath: activeWorkspace.path,
      runtime: launchRuntime,
      model: activeWorkspace.model
    });
    if (result && Array.isArray(result.tasks)) {
      showLaunchOverlay(result.tasks, launchRuntime);
    }
  } catch (error) {
    state.launchInProgress = false;
    state.missionActive = false;
    hideLaunchOverlay();
    addFeedEvent('error', error.message || 'erro ao iniciar swarm');
    setWorkspaceControlsDisabled(false);
    updateStopButtonState();
  }
}

function handleSwarmEvent(event) {
  if (!event || !event.type) {
    return;
  }

  if (event.type === 'mission:start') {
    state.missionActive = true;
    state.launchInProgress = false;
    const tasks = Array.isArray(event.tasks) ? event.tasks : [];
    state.panes = createPanesForTasks(tasks);
    addFeedEvent('mission', event.message || 'terminais iniciados');
    showLaunchOverlay(tasks, event.runtime || state.activeWorkspace?.runtime);
    renderWorkspace();
    updateStopButtonState();
    return;
  }

  if (event.type === 'agent:start') {
    updatePane(event.paneId, {
      status: event.status || 'THINKING',
      taskTitle: event.task?.title || event.message || ''
    });
    addFeedEvent('agent', event.message || `terminal ${event.paneId} iniciado`);
    fadeLaunchOverlaySoon();
    return;
  }

  if (event.type === 'agent:output') {
    appendPaneOutput(event.paneId, event.output || '');
    updatePane(event.paneId, { status: event.status || 'WRITING' }, false);
    writePaneTerminal(event.paneId, event.output || '');
    setPaneStatusDom(event.paneId, event.status || 'WRITING');
    renderNodePanel();
    return;
  }

  if (event.type === 'agent:exit') {
    updatePane(event.paneId, { status: event.status || 'DONE' }, false);
    setPaneStatusDom(event.paneId, event.status || 'DONE');
    addFeedEvent(event.status === 'ERROR' ? 'error' : 'agent', event.message || `terminal ${event.paneId} finalizado`);
    renderNodePanel();
    return;
  }

  if (event.type === 'agent:error') {
    updatePane(event.paneId, {
      status: 'ERROR',
      output: [`${sanitizeVisibleText(event.message || event.error || 'erro no terminal')}\n`]
    });
    addFeedEvent('error', event.message || event.error || 'erro no terminal');
    hideLaunchOverlay();
    return;
  }

  if (event.type === 'file:event') {
    addFeedEvent('file', event.message || `${event.file?.arquivo || 'arquivo'} ${event.file?.acao || ''}`);
    const activePane = state.panes.find((pane) => ['THINKING', 'WRITING'].includes(pane.status));
    if (activePane) {
      updatePane(activePane.id, { status: 'WRITING' });
    }
    return;
  }

  if (event.type === 'mission:done') {
    state.missionActive = false;
    state.launchInProgress = false;
    hideLaunchOverlay();
    addFeedEvent(event.status === 'ERROR' ? 'error' : 'mission', event.message || 'terminais concluidos');
    setWorkspaceControlsDisabled(false);
    renderNodePanel();
    updateStopButtonState();
    return;
  }

  if (event.type === 'mission:error') {
    state.missionActive = false;
    state.launchInProgress = false;
    hideLaunchOverlay();
    addFeedEvent('error', event.message || 'erro nos terminais');
    setWorkspaceControlsDisabled(false);
    updateStopButtonState();
    return;
  }

  if (event.type === 'mission:stop') {
    state.missionActive = false;
    state.launchInProgress = false;
    hideLaunchOverlay();
    addFeedEvent('process', event.message || 'terminais parados');
    setWorkspaceControlsDisabled(false);
    updateStopButtonState();
    return;
  }

  if (event.type === 'tts:warning' || event.type === 'file:error' || event.type === 'cleanup:warning') {
    addFeedEvent(event.type === 'file:error' ? 'error' : 'process', event.message);
  }
}

function sanitizeVisibleText(value) {
  const text = String(value || '');
  return text
    .replace(/(api[_-]?key|token|password|secret)(=|:)\S+/gi, '$1=[redacted]')
    .replace(/OPENAI_API_KEY=\S+/gi, 'OPENAI_API_KEY=[redacted]')
    .replace(/ANTHROPIC_API_KEY=\S+/gi, 'ANTHROPIC_API_KEY=[redacted]')
    .slice(0, 360);
}

function isSwarmActive() {
  return state.missionActive || state.panes.some((pane) => ['THINKING', 'WRITING'].includes(pane.status));
}

function createPanesForTasks(tasks) {
  const count = Math.max(3, tasks.length);
  return Array.from({ length: count }, (_, index) => {
    const paneId = index + 1;
    const task = tasks.find((item) => item.paneId === paneId);
    return {
      id: paneId,
      status: task ? 'THINKING' : 'IDLE',
      output: [],
      taskTitle: task ? task.title : ''
    };
  });
}

function updatePane(paneId, patch, shouldRender = true) {
  const id = Number(paneId);
  state.panes = state.panes.map((pane) => {
    if (pane.id !== id) {
      return pane;
    }
    return {
      ...pane,
      ...patch,
      status: normalizeStatus(patch.status || pane.status)
    };
  });
  if (shouldRender) {
    renderPanes();
    renderNodePanel();
  }
}

function appendPaneOutput(paneId, output) {
  const id = Number(paneId);
  state.panes = state.panes.map((pane) => {
    if (pane.id !== id) {
      return pane;
    }
    const nextOutput = [...(pane.output || []), String(output)].slice(-80);
    return {
      ...pane,
      output: nextOutput
    };
  });
}

function showLaunchOverlay(tasks, runtimeId) {
  const overlay = getElement('launch-overlay');
  const runtimeSlot = clearChildren('launch-overlay-runtime');
  const taskList = clearChildren('launch-overlay-tasks');
  const paneGrid = getElement('pane-grid');

  if (!overlay) {
    return;
  }

  const runtime = getRuntimeView(runtimeId);
  if (runtimeSlot) {
    runtimeSlot.appendChild(createRuntimeBadge(runtime));
  }

  if (taskList) {
    tasks.forEach((task, index) => {
      const item = document.createElement('li');
      item.className = 'launch-task';
      item.style.animationDelay = `${index * 90}ms`;
      item.textContent = task.title || `Terminal ${index + 1}`;
      taskList.appendChild(item);
    });
  }

  overlay.hidden = false;
  overlay.classList.remove('fade-out');
  if (paneGrid) {
    paneGrid.classList.add('launching');
  }
  fadeLaunchOverlaySoon();
}

function fadeLaunchOverlaySoon() {
  if (state.overlayTimer) {
    window.clearTimeout(state.overlayTimer);
  }
  state.overlayTimer = window.setTimeout(() => {
    const overlay = getElement('launch-overlay');
    if (overlay && !overlay.hidden) {
      overlay.classList.add('fade-out');
    }
    state.overlayTimer = window.setTimeout(hideLaunchOverlay, 520);
  }, 900);
}

function hideLaunchOverlay() {
  const overlay = getElement('launch-overlay');
  const paneGrid = getElement('pane-grid');
  if (state.overlayTimer) {
    window.clearTimeout(state.overlayTimer);
    state.overlayTimer = null;
  }
  if (overlay) {
    overlay.hidden = true;
    overlay.classList.remove('fade-out');
  }
  if (paneGrid) {
    paneGrid.classList.remove('launching');
  }
}

function setWorkspaceControlsDisabled(disabled) {
  for (const id of ['runtime-select', 'model-select', 'launch-swarm-button', 'runtime-login-button', 'runtime-check-button']) {
    const control = getElement(id);
    if (control) {
      control.disabled = disabled;
    }
  }
  const launchButton = getElement('launch-swarm-button');
  if (launchButton) {
    launchButton.textContent = disabled ? 'TERMINAIS ATIVOS' : 'INICIAR TERMINAIS';
  }
  updateStopButtonState();
}

function updateStopButtonState() {
  const stopButton = getElement('stop-swarm-button');
  if (!stopButton) {
    return;
  }
  const active = isSwarmActive();
  stopButton.disabled = !active;
  stopButton.setAttribute('aria-disabled', String(!active));
}

function applyWorkspaceResult(result) {
  if (!result) {
    return;
  }

  if (Array.isArray(result.workspaces)) {
    state.workspaces = result.workspaces;
  }

  if (result.workspace) {
    state.activeWorkspace = result.workspace;
    return;
  }

  if (state.activeWorkspace) {
    const refreshed = state.workspaces.find((workspace) => workspace.id === state.activeWorkspace.id);
    if (refreshed) {
      state.activeWorkspace = refreshed;
    }
  }
}

function init() {
  const route = document.body.dataset.route || 'home';
  if (route === 'workspace') {
    initWorkspace();
    return;
  }
  initHome();
}

window.addEventListener('DOMContentLoaded', init);

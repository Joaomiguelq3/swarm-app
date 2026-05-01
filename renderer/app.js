const RUNTIME_VIEW = {
  claude: {
    id: 'claude',
    label: 'CLAUDE CODE',
    badgeClass: 'badge-claude',
    models: ['opus-4', 'sonnet-4', 'haiku']
  },
  codex: {
    id: 'codex',
    label: 'CODEX',
    badgeClass: 'badge-codex',
    models: ['gpt-4o', 'gpt-4.1', 'o3', 'o4-mini']
  }
};

const PANE_STATUSES = ['IDLE', 'THINKING', 'WRITING', 'DONE', 'ERROR'];

const state = {
  workspaces: [],
  loading: true,
  activeWorkspace: null,
  panes: createDefaultPanes(),
  feed: []
};

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

function getRuntimeView(runtimeId) {
  return RUNTIME_VIEW[runtimeId] || {
    id: runtimeId || 'unknown',
    label: String(runtimeId || 'RUNTIME').toUpperCase(),
    badgeClass: 'runtime-badge',
    models: []
  };
}

function createDefaultPanes() {
  return [1, 2, 3].map((index) => ({
    id: index,
    status: 'IDLE'
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

function initTypingLogo() {
  const target = getElement('typing-logo');
  if (!target) {
    return;
  }

  const word = 'SWARM';
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
  const glyphs = '01{}[]<>/\\$#@SWARM';
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
  initBridgeStatus();
  loadWorkspaces();
}

async function initWorkspace() {
  showWorkspaceLoading();
  bindWorkspaceEvents();

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
    launchButton.addEventListener('click', handleLaunchPlaceholder);
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
  renderFeed();
}

function renderWorkspaceHeader() {
  const workspace = state.activeWorkspace;
  const runtime = getRuntimeView(workspace.runtime);
  setText('active-workspace-name', workspace.name || 'workspace');
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

    const prompt = document.createElement('p');
    prompt.className = 'terminal-placeholder';
    prompt.textContent = 'terminal aguardando orquestracao';
    body.appendChild(prompt);

    article.append(header, body);
    grid.appendChild(article);
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
    for (const runtime of Object.values(RUNTIME_VIEW)) {
      const option = document.createElement('option');
      option.value = runtime.id;
      option.textContent = runtime.label;
      option.selected = runtime.id === workspace.runtime;
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

  const models = runtime.models.length > 0 ? runtime.models : [selectedModel || 'default'];
  const nextModel = models.includes(selectedModel) ? selectedModel : models[0];
  modelSelect.replaceChildren();

  for (const model of models) {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    option.selected = model === nextModel;
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
  setText('node-process-state', 'processos ativos: 0');

  const badgeSlot = clearChildren('node-runtime-badge');
  if (badgeSlot) {
    badgeSlot.appendChild(createRuntimeBadge(runtime));
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
    message,
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
    addFeedEvent('runtime', `runtime alterado para ${getRuntimeView(nextRuntime).label}`);
    renderWorkspace();
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
  if (modelSelect && runtime.models.includes(modelSelect.value)) {
    return modelSelect.value;
  }
  return runtime.models[0];
}

async function stopActiveProcesses(reason) {
  state.panes = state.panes.map((pane) => ({
    ...pane,
    status: 'IDLE'
  }));
  addFeedEvent('process', `stopActiveProcesses: panes resetados antes de ${reason}`);
  renderPanes();
}

function handleLaunchPlaceholder() {
  addFeedEvent('mission', 'launch pendente: orquestracao entra na fase 6');
}

function setWorkspaceControlsDisabled(disabled) {
  for (const id of ['runtime-select', 'model-select', 'launch-swarm-button']) {
    const control = getElement(id);
    if (control) {
      control.disabled = disabled;
    }
  }
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

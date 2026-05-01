const RUNTIME_VIEW = {
  claude: {
    label: 'CLAUDE CODE',
    badgeClass: 'badge-claude'
  },
  codex: {
    label: 'CODEX',
    badgeClass: 'badge-codex'
  }
};

const state = {
  workspaces: [],
  loading: true
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

  if (!window.swarm || !window.swarm.workspaces || typeof window.swarm.workspaces.list !== 'function') {
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
  const runtime = RUNTIME_VIEW[workspace.runtime] || {
    label: String(workspace.runtime || 'RUNTIME').toUpperCase(),
    badgeClass: 'runtime-badge'
  };

  const card = document.createElement('article');
  card.className = 'workspace-card';

  const header = document.createElement('div');
  header.className = 'workspace-card-header';

  const title = document.createElement('h3');
  title.className = 'workspace-name';
  title.textContent = workspace.name || 'workspace';

  const badge = document.createElement('span');
  badge.className = `runtime-badge ${runtime.badgeClass}`;
  badge.textContent = runtime.label;

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

  if (!window.swarm || !window.swarm.workspaces || typeof window.swarm.workspaces.create !== 'function') {
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

function init() {
  initTypingLogo();
  initMatrixCanvas();
  bindModalEvents();
  initBridgeStatus();
  loadWorkspaces();
}

window.addEventListener('DOMContentLoaded', init);

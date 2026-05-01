const assert = require('assert');
const fs = require('fs');
const path = require('path');

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function includes(content, marker, label) {
  assert.ok(content.includes(marker), `Missing ${label}: ${marker}`);
}

function main() {
  const html = read('renderer/home.html');
  const css = read('renderer/style.css');
  const js = read('renderer/app.js');

  includes(html, 'id="matrix-canvas"', 'Matrix canvas hook');
  includes(html, 'id="typing-logo"', 'typing logo hook');
  includes(html, 'id="workspace-grid"', 'workspace grid hook');
  includes(html, 'id="loading-state"', 'loading state hook');
  includes(html, 'id="empty-state"', 'empty state hook');
  includes(html, 'id="error-state"', 'error state hook');
  includes(html, 'id="workspace-modal"', 'workspace modal hook');
  includes(html, 'id="workspace-form"', 'workspace form hook');

  includes(css, '--bg:', 'dark theme background variable');
  includes(css, '--green:', 'dark theme green variable');
  includes(css, '--purple:', 'Claude purple variable');
  includes(css, '.matrix-canvas', 'Matrix canvas class');
  includes(css, '.workspace-grid', 'workspace grid class');
  includes(css, '.workspace-card', 'workspace card class');
  includes(css, '.badge-claude', 'Claude badge class');
  includes(css, '.badge-codex', 'Codex badge class');
  includes(css, '@media', 'responsive rule');

  includes(js, 'window.swarm.workspaces.list', 'workspace list bridge usage');
  includes(js, 'window.swarm.workspaces.create', 'workspace create bridge usage');
  includes(js, 'initTypingLogo', 'typing logo initialization');
  includes(js, 'initMatrixCanvas', 'Matrix canvas initialization');
  includes(js, 'createWorkspaceCard', 'workspace card renderer');
  includes(js, 'textContent', 'safe text rendering');

  assert.ok(!js.includes('require('), 'renderer app must not use require()');
  assert.ok(!js.includes('ipcRenderer'), 'renderer app must not use ipcRenderer directly');

  console.log('smoke-home-ui ok');
}

main();

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
  const home = read('renderer/home.html');
  const workspace = read('renderer/workspace.html');
  const css = read('renderer/style.css');
  const js = read('renderer/app.js');

  includes(home, 'data-route="home"', 'Home route marker');
  includes(js, './workspace.html?id=', 'Home card workspace navigation');
  includes(js, 'openWorkspace', 'workspace navigation helper');
  includes(js, 'tabIndex = 0', 'keyboard-accessible workspace cards');

  includes(workspace, 'data-route="workspace"', 'Workspace route marker');
  includes(workspace, '<script src="./app.js"></script>', 'Workspace app script');
  includes(workspace, 'id="workspace-tabs"', 'workspace tabs hook');
  includes(workspace, 'id="workspace-loading"', 'workspace loading state');
  includes(workspace, 'id="workspace-error"', 'workspace error state');
  includes(workspace, 'id="workspace-content"', 'workspace content state');
  includes(workspace, 'id="active-runtime-badge"', 'active runtime badge hook');
  includes(workspace, 'id="pane-grid"', 'pane grid hook');
  includes(workspace, 'id="mission-input"', 'mission input hook');
  includes(workspace, 'Novo projeto', 'new project field label');
  includes(workspace, 'Terminal 1', 'new project owner hint');
  includes(workspace, 'id="agent-count"', 'agent count hook');
  includes(workspace, 'id="launch-swarm-button"', 'launch placeholder hook');
  includes(workspace, 'id="activity-feed"', 'activity feed hook');
  includes(workspace, 'class="map-panel"', 'map/files panel');
  includes(workspace, 'class="node-panel"', 'node panel');
  includes(workspace, 'id="runtime-select"', 'runtime select hook');
  includes(workspace, 'id="model-select"', 'model select hook');

  includes(css, '.workspace-shell', 'workspace shell CSS');
  includes(css, '.workspace-tabs', 'workspace tabs CSS');
  includes(css, '.pane-grid', 'pane grid CSS');
  includes(css, '.terminal-pane', 'terminal pane CSS');
  includes(css, '.xterm-mount', 'xterm mount CSS');
  includes(css, '.pane-status-dot.status-thinking', 'thinking status CSS');
  includes(css, '.pane-status-dot.status-writing', 'writing status CSS');
  includes(css, '.pane-status-dot.status-done', 'done status CSS');
  includes(css, '.pane-status-dot.status-error', 'error status CSS');
  includes(css, '.mission-bar', 'mission bar CSS');
  includes(css, '.activity-feed', 'feed CSS');
  includes(css, '.node-panel', 'node panel CSS');
  includes(css, '@media (max-width: 1060px)', 'workspace responsive CSS');

  includes(js, 'initWorkspace', 'workspace route initializer');
  includes(js, 'window.swarm.workspaces.list', 'workspace list bridge usage');
  includes(js, 'window.swarm.workspaces.touch', 'workspace touch bridge usage');
  includes(js, 'window.swarm.workspaces.updateRuntime', 'runtime update bridge usage');
  includes(js, 'window.swarm.workspaces.updateModel', 'model update bridge usage');
  includes(js, 'window.swarm.runtimes.list', 'runtime catalog bridge usage');
  includes(js, 'window.swarm.runtimes.login', 'runtime login bridge usage');
  includes(js, 'stopActiveProcesses', 'stop hook');
  includes(js, "await stopActiveProcesses('runtime-switch')", 'stop before runtime persistence');
  includes(js, 'renderModelOptions', 'runtime model option renderer');
  includes(js, 'getModelLabel', 'model metadata label renderer');
  includes(js, 'handleLaunch', 'real launch handler');
  includes(js, 'buildNewProjectPrompt', 'new project prompt builder');
  includes(js, "const launchRuntime = 'codex'", 'Codex launch runtime');

  for (const oldModel of ['gpt-4o', 'gpt-5.2', 'claude-3-', 'latest']) {
    assert.ok(!js.includes(oldModel), `renderer should not hardcode old model marker: ${oldModel}`);
  }

  for (const status of ['IDLE', 'THINKING', 'WRITING', 'DONE', 'ERROR']) {
    includes(js, status, `pane status ${status}`);
  }

  assert.ok(!js.includes('require('), 'renderer app must not use require()');
  assert.ok(!js.includes('ipcRenderer'), 'renderer app must not use ipcRenderer directly');

  console.log('smoke-workspace-ui ok');
}

main();

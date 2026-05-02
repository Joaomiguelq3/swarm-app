const assert = require('assert');
const fs = require('fs');

const app = fs.readFileSync('renderer/app.js', 'utf8');
const html = fs.readFileSync('renderer/workspace.html', 'utf8');
const css = fs.readFileSync('renderer/style.css', 'utf8');
const ipc = fs.readFileSync('src/swarm-ipc.js', 'utf8');

assert(html.includes('id="launch-overlay"'), 'launch overlay DOM missing');
assert(html.includes('id="launch-overlay-runtime"'), 'runtime badge hook missing');
assert(html.includes('id="launch-overlay-tasks"'), 'task list hook missing');
assert(css.includes('.launch-overlay'), 'overlay styles missing');
assert(css.includes('.pane-grid.launching'), 'pane glow styles missing');
assert(css.includes('.launch-overlay.fade-out'), 'fade-out styles missing');
assert(app.includes('showLaunchOverlay'), 'overlay show function missing');
assert(app.includes('fadeLaunchOverlaySoon'), 'overlay fade driver missing');
assert(app.includes('hideLaunchOverlay'), 'overlay cleanup missing');
assert(app.includes('createRuntimeBadge(runtime)'), 'overlay must render runtime badge');
assert(ipc.includes('AVANT IA iniciado com'), 'start TTS message missing');
assert(ipc.includes('Terminal') && ipc.includes('concluido'), 'terminal completion TTS missing');
assert(ipc.includes('Terminais concluidos'), 'terminal completion TTS missing');

console.log('smoke-launch-overlay ok');

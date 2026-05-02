const assert = require('assert');
const fs = require('fs');

const app = fs.readFileSync('renderer/app.js', 'utf8');
const html = fs.readFileSync('renderer/workspace.html', 'utf8');

assert(app.includes('window.swarm.orchestration.launch'), 'renderer must call orchestration launch');
assert(app.includes('window.swarm.orchestration.stop'), 'renderer must call orchestration stop');
assert(app.includes('window.swarm.orchestration.onEvent'), 'renderer must subscribe to orchestration events');
assert(app.includes('handleSwarmEvent'), 'event handler missing');
assert(app.includes("event.type === 'file:event'"), 'file events must feed renderer state');
assert(app.includes("event.type === 'agent:output'"), 'agent output handling missing');
assert(app.includes('appendPaneOutput'), 'pane output append missing');
assert(app.includes('writePaneTerminal'), 'xterm output writer missing');
assert(app.includes('window.swarm.orchestration.input'), 'terminal input bridge missing');
assert(html.includes('@xterm/xterm'), 'xterm assets missing');
assert(!app.includes('handleLaunchPlaceholder'), 'phase 5 placeholder launch must be removed');
assert(html.includes('activity-feed'), 'activity feed hook missing');

console.log('smoke-workspace-orchestration ok');

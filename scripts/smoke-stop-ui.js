const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('renderer/workspace.html', 'utf8');
const js = fs.readFileSync('renderer/app.js', 'utf8');
const css = fs.readFileSync('renderer/style.css', 'utf8');

assert(html.includes('id="stop-swarm-button"'), 'STOP SWARM button missing');
assert(html.includes('STOP SWARM'), 'STOP SWARM label missing');
assert(css.includes('.button-danger'), 'danger button style missing');
assert(css.includes('grid-template-columns: minmax(0, 1fr) 110px auto auto'), 'mission bar stop layout missing');
assert(js.includes('handleStopSwarm'), 'stop handler missing');
assert(js.includes("stopActiveProcesses('user-stop')"), 'user-stop reason missing');
assert(js.includes('window.swarm.orchestration.stop'), 'stop must use preload orchestration bridge');
assert(js.includes('updateStopButtonState'), 'stop button state updater missing');
assert(js.includes('isSwarmActive'), 'active mission detector missing');
assert(js.includes('sanitizeVisibleText'), 'visible error sanitizer missing');
assert(js.includes('OPENAI_API_KEY=[redacted]'), 'OpenAI key redaction marker missing');
assert(js.includes('ANTHROPIC_API_KEY=[redacted]'), 'Anthropic key redaction marker missing');
assert(js.includes("event.type === 'cleanup:warning'"), 'cleanup warning display missing');
assert(js.includes('hideLaunchOverlay'), 'stop/error paths must clear overlay');
assert(!js.includes('handleLaunchPlaceholder'), 'placeholder launch should not return');

console.log('smoke-stop-ui ok');

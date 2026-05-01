const assert = require('assert');
const os = require('os');
const pty = require('node-pty');

const marker = 'SWARM_PTY_OK';
const shell = process.platform === 'win32' ? 'powershell.exe' : 'sh';
const args = process.platform === 'win32'
  ? ['-NoProfile', '-Command', `Write-Output ${marker}`]
  : ['-lc', `printf "${marker}\\n"`];

let output = '';
let settled = false;

const term = pty.spawn(shell, args, {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  cwd: process.cwd(),
  env: process.env
});

const timer = setTimeout(() => {
  if (settled) {
    return;
  }
  settled = true;
  term.kill();
  console.error('pty smoke timed out');
  process.exit(1);
}, 8000);

term.onData((data) => {
  output += data;
});

term.onExit(({ exitCode }) => {
  if (settled) {
    return;
  }
  settled = true;
  clearTimeout(timer);
  try {
    assert.strictEqual(exitCode, 0, `pty process exited with ${exitCode}`);
    assert.ok(output.includes(marker), `missing marker in output: ${output}`);
    console.log(`pty ok: ${marker}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

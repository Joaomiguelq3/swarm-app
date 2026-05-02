const { spawnSync } = require('child_process');
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const checkScript = packageJson.scripts.check || '';
if (checkScript.includes('demo:preflight') || checkScript.includes('demo-preflight.js')) {
  throw new Error('check must not depend on real-runtime demo preflight');
}

const commands = [
  ['smoke:shutdown-lifecycle', ['run', 'smoke:shutdown-lifecycle']],
  ['smoke:stop-ui', ['run', 'smoke:stop-ui']],
  ['check', ['run', 'check']]
];

function run(label, args) {
  console.log(`\n[phase7] ${label}`);
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm.cmd ${args.join(' ')}`]
    : args;
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with status ${result.status}`);
  }
}

function main() {
  for (const [label, args] of commands) {
    run(label, args);
  }

  console.log('\nsmoke-phase7 ok');
}

main();

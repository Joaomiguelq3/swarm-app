const { spawnSync } = require('child_process');

const commands = [
  ['smoke:workspaces', ['run', 'smoke:workspaces']],
  ['smoke:workspace-ipc', ['run', 'smoke:workspace-ipc']],
  ['check', ['run', 'check']]
];

function run(label, args) {
  console.log(`\n[phase3] ${label}`);
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

  console.log('\nsmoke-phase3 ok');
}

main();

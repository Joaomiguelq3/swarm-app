const { spawnSync } = require('child_process');

const commands = [
  ['smoke:swarm-core', ['run', 'smoke:swarm-core']],
  ['smoke:swarm-ipc', ['run', 'smoke:swarm-ipc']],
  ['smoke:workspace-orchestration', ['run', 'smoke:workspace-orchestration']],
  ['smoke:launch-overlay', ['run', 'smoke:launch-overlay']],
  ['check', ['run', 'check']]
];

function run(label, args) {
  console.log(`\n[phase6] ${label}`);
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

  console.log('\nsmoke-phase6 ok');
}

main();

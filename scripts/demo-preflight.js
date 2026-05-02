const { spawnSync } = require('child_process');
const { RUNTIMES } = require('../src/runtimes');

function getCommandCandidates(runtime) {
  const candidates = [runtime.cmd];
  if (process.platform === 'win32') {
    const base = runtime.cmd.replace(/\.cmd$/i, '');
    candidates.push(`${base}.cmd`);
    candidates.push(base);
  }
  return [...new Set(candidates)];
}

function spawnCommand(command, args) {
  const isWindowsCmd = process.platform === 'win32' && /\.cmd$/i.test(command);
  const executable = isWindowsCmd ? 'cmd.exe' : command;
  const commandArgs = isWindowsCmd ? ['/d', '/s', '/c', command, ...args] : args;

  return spawnSync(executable, commandArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
    windowsHide: true
  });
}

function runVersion(runtime) {
  const errors = [];

  for (const command of getCommandCandidates(runtime)) {
    const result = spawnCommand(command, ['--version']);

    if (result.error) {
      errors.push(`${command}: ${result.error.code || result.error.message}`);
      continue;
    }

    const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
    if (result.status === 0) {
      return {
        ok: true,
        output: output || `${command} --version ok`
      };
    }

    errors.push(`${command}: ${output || `exited with ${result.status}`}`);
  }

  if (errors.length === 0) {
    return {
      ok: false,
      output: `${runtime.cmd} not found on PATH`
    };
  }

  return {
    ok: false,
    output: errors.every((error) => error.includes('ENOENT'))
      ? `${runtime.cmd} not found on PATH`
      : errors.join('; ')
  };
}

function main() {
  let failed = false;

  for (const runtimeId of ['claude', 'codex']) {
    const runtime = RUNTIMES[runtimeId];
    const result = runVersion(runtime);
    const label = runtime.label || runtimeId;
    if (result.ok) {
      console.log(`[ok] ${label}: ${result.output}`);
    } else {
      failed = true;
      console.log(`[missing] ${label}: ${result.output}`);
    }
  }

  if (failed) {
    console.log('Demo preflight failed. Install/configure the missing runtime before live rehearsal.');
    process.exit(1);
  }

  console.log('Demo preflight ok');
}

main();

const { spawnSync } = require('child_process');
const { RUNTIMES } = require('../src/runtimes');

function runVersion(runtime) {
  const result = spawnSync(runtime.cmd, ['--version'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
    windowsHide: true
  });

  if (result.error) {
    return {
      ok: false,
      output: result.error.code === 'ENOENT'
        ? `${runtime.cmd} not found on PATH`
        : result.error.message
    };
  }

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  return {
    ok: result.status === 0,
    output: output || `${runtime.cmd} exited with ${result.status}`
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

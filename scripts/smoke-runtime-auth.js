const assert = require('assert');
const { checkRuntime, openRuntimeLogin } = require('../src/runtime-auth');
const { RUNTIMES } = require('../src/runtimes');

function main() {
  if (process.platform === 'win32') {
    assert.strictEqual(RUNTIMES.codex.cmd, 'codex.cmd');
  }

  const codex = checkRuntime('codex');
  assert.strictEqual(codex.runtime, 'codex');
  assert.strictEqual(codex.label, 'CODEX');
  assert.ok(['ready', 'missing', 'error'].includes(codex.status));

  if (process.platform === 'win32') {
    assert.notStrictEqual(codex.message, 'codex nao encontrado no PATH');
    assert.deepStrictEqual(RUNTIMES.codex.authArgs, ['app']);
  }

  const unknown = openRuntimeLogin('missing-runtime');
  assert.strictEqual(unknown.ok, false);

  console.log('smoke-runtime-auth ok');
}

main();

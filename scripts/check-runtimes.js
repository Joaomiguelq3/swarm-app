const assert = require('assert');
const { RUNTIMES, getRuntime, listRuntimes } = require('../src/runtimes');

const required = ['label', 'cmd', 'args', 'rulesFile', 'skillsDir', 'models', 'badge'];

for (const runtimeId of ['claude', 'codex']) {
  const runtime = getRuntime(runtimeId);
  for (const field of required) {
    assert.ok(runtime[field], `${runtimeId} missing ${field}`);
  }
  assert.ok(Array.isArray(runtime.args), `${runtimeId} args must be an array`);
  assert.ok(Array.isArray(runtime.models), `${runtimeId} models must be an array`);
  assert.ok(runtime.models.length > 0, `${runtimeId} must expose models`);
}

assert.deepStrictEqual(RUNTIMES.claude.args, ['--dangerously-skip-permissions']);
assert.strictEqual(RUNTIMES.claude.rulesFile, 'CLAUDE.md');
assert.strictEqual(RUNTIMES.claude.skillsDir, '.claude/skills/');

assert.deepStrictEqual(RUNTIMES.codex.args, ['--approval-mode', 'full-auto']);
assert.strictEqual(RUNTIMES.codex.rulesFile, 'AGENTS.md');
assert.strictEqual(RUNTIMES.codex.skillsDir, '.codex/skills/');

assert.strictEqual(listRuntimes().length, 2);

console.log('runtimes ok');

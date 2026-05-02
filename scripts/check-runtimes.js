const assert = require('assert');
const { RUNTIMES, getDefaultModel, getModelIds, getRuntime, listRuntimes } = require('../src/runtimes');

const required = [
  'label',
  'cmd',
  'args',
  'authArgs',
  'rulesFile',
  'skillsDir',
  'models',
  'defaultModel',
  'decompositionModel',
  'badge'
];
const banned = [
  'claude-opus-4-1-20250805',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-5-haiku-latest',
  'gpt-5.2-codex',
  'gpt-5.2',
  'gpt-5.2-pro',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4o',
  'gpt-4o-mini'
];

for (const runtimeId of ['claude', 'codex']) {
  const runtime = getRuntime(runtimeId);
  for (const field of required) {
    assert.ok(runtime[field], `${runtimeId} missing ${field}`);
  }
  assert.ok(Array.isArray(runtime.args), `${runtimeId} args must be an array`);
  assert.ok(Array.isArray(runtime.authArgs), `${runtimeId} authArgs must be an array`);
  assert.ok(Array.isArray(runtime.models), `${runtimeId} models must be an array`);
  assert.ok(runtime.models.length > 0, `${runtimeId} must expose models`);
  for (const model of runtime.models) {
    assert.ok(model.id, `${runtimeId} model missing id`);
    assert.ok(model.label, `${runtimeId} model missing label`);
    assert.ok(model.desc, `${runtimeId} model missing desc`);
    assert.ok(model.tier, `${runtimeId} model missing tier`);
  }
  const modelIds = getModelIds(runtime);
  assert.ok(modelIds.includes(runtime.defaultModel), `${runtimeId} default model must exist`);
  assert.ok(modelIds.includes(runtime.decompositionModel), `${runtimeId} decomposition model must exist`);
}

assert.deepStrictEqual(RUNTIMES.claude.args, ['--dangerously-skip-permissions']);
assert.deepStrictEqual(RUNTIMES.claude.authArgs, []);
assert.deepStrictEqual(getModelIds(RUNTIMES.claude), [
  'claude-opus-4-7',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001'
]);
assert.strictEqual(getDefaultModel(RUNTIMES.claude), 'claude-sonnet-4-6');
assert.strictEqual(RUNTIMES.claude.decompositionModel, 'claude-haiku-4-5-20251001');
assert.strictEqual(RUNTIMES.claude.rulesFile, 'CLAUDE.md');
assert.strictEqual(RUNTIMES.claude.skillsDir, '.claude/skills/');

if (process.platform === 'win32') {
  assert.strictEqual(RUNTIMES.codex.cmd, 'codex.cmd');
  assert.deepStrictEqual(RUNTIMES.codex.args, [
    '--dangerously-bypass-approvals-and-sandbox',
    '--no-alt-screen'
  ]);
} else {
  assert.deepStrictEqual(RUNTIMES.codex.args, ['--approval-mode', 'full-auto']);
}
assert.deepStrictEqual(RUNTIMES.codex.authArgs, ['app']);
assert.deepStrictEqual(getModelIds(RUNTIMES.codex), [
  'gpt-5.5',
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.3-codex'
]);
assert.strictEqual(getDefaultModel(RUNTIMES.codex), 'gpt-5.5');
assert.strictEqual(RUNTIMES.codex.decompositionModel, 'gpt-5.4-mini');
assert.strictEqual(RUNTIMES.codex.rulesFile, 'AGENTS.md');
assert.strictEqual(RUNTIMES.codex.skillsDir, '.codex/skills/');

assert.strictEqual(listRuntimes().length, 2);
for (const oldModel of banned) {
  assert.ok(!JSON.stringify(RUNTIMES).includes(oldModel), `banned model remained: ${oldModel}`);
}
assert.ok(!JSON.stringify(RUNTIMES.claude.models).includes('latest'), 'Claude models must not use latest aliases');
assert.ok(!JSON.stringify(RUNTIMES.claude.models).includes('claude-3-'), 'Claude 3 models must not be exposed');

console.log('runtimes ok');

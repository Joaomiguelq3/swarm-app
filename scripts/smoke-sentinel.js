const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createSentinel } = require('../src/sentinel');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) {
      return;
    }
    await wait(100);
  }
  throw new Error('Timed out waiting for sentinel events');
}

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swarm-sentinel-'));
  const targetFile = path.join(tempDir, 'event.txt');
  const events = [];
  const sentinel = createSentinel(tempDir, {
    onEvent: (event) => events.push(event)
  });

  sentinel.start();
  await wait(300);

  fs.writeFileSync(targetFile, 'first');
  await waitFor(() => events.some((event) => event.acao === 'criado'));

  fs.appendFileSync(targetFile, '\nsecond');
  await waitFor(() => events.some((event) => event.acao === 'modificado'));

  fs.unlinkSync(targetFile);
  await waitFor(() => events.some((event) => event.acao === 'removido'));

  await sentinel.stop();
  fs.rmSync(tempDir, { recursive: true, force: true });

  for (const acao of ['criado', 'modificado', 'removido']) {
    assert.ok(events.some((event) => event.acao === acao), `missing ${acao}`);
  }
  assert.ok(events.every((event) => event.arquivo === 'event.txt'), 'event path should be relative');
  assert.ok(events.every((event) => event.timestamp), 'timestamp required');

  console.log(`sentinel ok: ${events.map((event) => event.acao).join(', ')}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

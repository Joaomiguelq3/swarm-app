const assert = require('assert');
const { EventEmitter } = require('events');
const { createSwarm, decomposeMission } = require('../src/swarm');

function waitFor(events, type) {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const found = events.find((event) => event.type === type);
      if (found) {
        clearInterval(timer);
        resolve(found);
      }
    }, 5);
  });
}

function createFakeSpawn() {
  const writes = [];

  function spawnAdapter({ task }) {
    const emitter = new EventEmitter();
    return {
      write(data) {
        writes.push(data);
        setTimeout(() => emitter.emit('data', `output from ${task.id}`), 5);
        setTimeout(() => emitter.emit('exit', { exitCode: 0 }), 10);
      },
      kill() {
        emitter.emit('exit', { exitCode: 143 });
      },
      onData(listener) {
        emitter.on('data', listener);
      },
      onExit(listener) {
        emitter.on('exit', listener);
      }
    };
  }

  return { spawnAdapter, writes };
}

async function main() {
  const tasks = decomposeMission({
    mission: 'criar login',
    agentCount: 10,
    runtime: 'fake',
    model: 'test',
    scoutContext: 'package.json'
  });
  assert.strictEqual(tasks.length, 6, 'agent count must clamp to six');
  assert.match(tasks[0].prompt, /criar login/, 'task prompt must include mission');

  const fake = createFakeSpawn();
  const events = [];
  const swarm = createSwarm({
    runtime: {
      id: 'fake',
      label: 'FAKE',
      cmd: 'fake',
      args: [],
      models: ['test']
    },
    scout: () => ({ context: 'fake scout context' }),
    spawnAdapter: fake.spawnAdapter,
    now: () => '2026-05-01T00:00:00.000Z'
  });

  swarm.onEvent((event) => events.push(event));
  const result = swarm.launch({
    mission: 'implementar dashboard',
    workspacePath: process.cwd(),
    runtime: 'fake',
    model: 'test',
    agentCount: 2
  });

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.tasks.length, 2);
  const inputResult = swarm.writeToPane(1, 'usuario digitou');
  assert.strictEqual(inputResult.ok, true, 'pane input must write to active process');
  await waitFor(events, 'mission:done');

  assert(events.some((event) => event.type === 'mission:start'), 'mission start event missing');
  assert(events.some((event) => event.type === 'agent:start'), 'agent start event missing');
  assert(events.some((event) => event.type === 'agent:output'), 'agent output event missing');
  assert(events.some((event) => event.type === 'agent:exit' && event.status === 'DONE'), 'done exit missing');
  assert.strictEqual(fake.writes.length, 3, 'each fake process receives a prompt and pane input is forwarded');
  console.log('smoke-swarm-core ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

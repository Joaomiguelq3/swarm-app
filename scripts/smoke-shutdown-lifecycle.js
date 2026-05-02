const assert = require('assert');
const { EventEmitter } = require('events');
const fs = require('fs');
const { createSwarm } = require('../src/swarm');
const { registerSwarmIpc, CHANNELS } = require('../src/swarm-ipc');

class IpcMainFake {
  constructor() {
    this.handlers = new Map();
  }

  handle(channel, handler) {
    this.handlers.set(channel, handler);
  }

  invoke(channel, input) {
    const handler = this.handlers.get(channel);
    assert(handler, `handler missing: ${channel}`);
    return handler({}, input);
  }
}

async function testCoreStopIdempotency() {
  let killCount = 0;
  const events = [];
  const swarm = createSwarm({
    runtime: { id: 'fake', label: 'FAKE', cmd: 'fake', args: [], models: ['fake'] },
    scout: () => ({ context: 'fake context' }),
    spawnAdapter: () => ({
      write() {},
      kill() {
        killCount += 1;
      },
      onData() {},
      onExit() {}
    })
  });

  swarm.onEvent((event) => events.push(event));
  swarm.launch({
    mission: 'fake mission',
    workspacePath: process.cwd(),
    runtime: 'fake',
    agentCount: 2
  });

  const first = swarm.stop('user-stop');
  const second = swarm.stop('user-stop');

  assert.strictEqual(first.stopped, true, 'first stop should stop active processes');
  assert.strictEqual(second.stopped, false, 'second stop should be a no-op');
  assert.strictEqual(killCount, 2, 'each fake child should be killed exactly once');
  assert(events.some((event) => event.type === 'mission:stop'), 'mission stop event missing');
}

async function testIpcStopIdempotency() {
  const ipcMain = new IpcMainFake();
  const sent = [];
  let swarmStopCount = 0;
  let sentinelStopCount = 0;

  registerSwarmIpc({
    ipcMain,
    cleanupTimeoutMs: 50,
    getWindow: () => ({
      isDestroyed: () => false,
      webContents: {
        send(channel, payload) {
          sent.push({ channel, payload });
        }
      }
    }),
    createSwarmFactory: () => {
      const emitter = new EventEmitter();
      return {
        launch(input) {
          emitter.emit('event', {
            type: 'mission:start',
            status: 'THINKING',
            runtime: input.runtime,
            tasks: [{ id: 'agent-1', paneId: 1 }],
            message: 'started'
          });
          return { ok: true, tasks: [{ id: 'agent-1' }] };
        },
        stop() {
          swarmStopCount += 1;
          return { ok: true, stopped: true };
        },
        onEvent(listener) {
          emitter.on('event', listener);
          return () => emitter.off('event', listener);
        }
      };
    },
    createSentinelFactory: () => ({
      start() {},
      async stop() {
        sentinelStopCount += 1;
      },
      onError() {}
    }),
    speakFn: () => Promise.resolve({ ok: true })
  });

  await ipcMain.invoke(CHANNELS.launch, {
    mission: 'fake',
    workspacePath: process.cwd(),
    runtime: 'codex'
  });

  const first = await ipcMain.invoke(CHANNELS.stop, 'app-close');
  const second = await ipcMain.invoke(CHANNELS.stop, 'app-close');

  assert.strictEqual(first.stopped, true, 'first IPC stop should stop active swarm');
  assert.strictEqual(second.stopped, false, 'second IPC stop should be a no-op');
  assert.strictEqual(swarmStopCount, 1, 'swarm stop should run once');
  assert.strictEqual(sentinelStopCount, 1, 'sentinel stop should run once');
  assert(sent.some((item) => item.channel === CHANNELS.event), 'event stream should be usable');
}

function testMainLifecycleMarkers() {
  const main = fs.readFileSync('main.js', 'utf8');
  assert(main.includes('function stopSwarmFor'), 'main cleanup helper missing');
  assert(main.includes("app.on('before-quit'"), 'before-quit cleanup missing');
  assert(main.includes("app.on('will-quit'"), 'will-quit cleanup missing');
  assert(main.includes("mainWindow.on('close'"), 'window close cleanup missing');
  assert(main.includes("stopSwarmFor('app-close')"), 'app-close cleanup missing');
}

async function main() {
  await testCoreStopIdempotency();
  await testIpcStopIdempotency();
  testMainLifecycleMarkers();
  console.log('smoke-shutdown-lifecycle ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

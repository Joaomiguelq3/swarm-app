const assert = require('assert');
const { EventEmitter } = require('events');
const { CHANNELS, registerSwarmIpc } = require('../src/swarm-ipc');

class IpcMainFake {
  constructor() {
    this.handlers = new Map();
    this.listeners = new Map();
  }

  handle(channel, handler) {
    this.handlers.set(channel, handler);
  }

  on(channel, listener) {
    this.listeners.set(channel, listener);
  }

  invoke(channel, input) {
    const handler = this.handlers.get(channel);
    assert(handler, `handler missing for ${channel}`);
    return handler({}, input);
  }

  send(channel, input) {
    const listener = this.listeners.get(channel);
    assert(listener, `listener missing for ${channel}`);
    listener({}, input);
  }
}

function createFakeSwarm() {
  const emitter = new EventEmitter();
  const writes = [];
  return {
    writes,
    launch(input) {
      emitter.emit('event', {
        type: 'mission:start',
        status: 'THINKING',
        runtime: input.runtime,
        tasks: [{ id: 'agent-1', paneId: 1, title: 'fake task' }],
        message: 'started'
      });
      emitter.emit('event', {
        type: 'agent:exit',
        status: 'DONE',
        paneId: 1,
        message: 'done'
      });
      emitter.emit('event', {
        type: 'mission:done',
        status: 'DONE',
        message: 'mission done'
      });
      return { ok: true, tasks: [{ id: 'agent-1' }] };
    },
    stop() {
      emitter.emit('event', { type: 'mission:stop', status: 'IDLE', message: 'stopped' });
      return { ok: true };
    },
    writeToPane(paneId, data) {
      writes.push({ paneId, data });
      return { ok: true };
    },
    onEvent(listener) {
      emitter.on('event', listener);
      return () => emitter.off('event', listener);
    }
  };
}

async function main() {
  const ipcMain = new IpcMainFake();
  const sent = [];
  const stoppedSentinels = [];
  const spoken = [];

  registerSwarmIpc({
    ipcMain,
    getWindow: () => ({
      isDestroyed: () => false,
      webContents: {
        send(channel, payload) {
          sent.push({ channel, payload });
        }
      }
    }),
    createSwarmFactory: createFakeSwarm,
    createSentinelFactory: (_root, options) => ({
      start() {
        options.onEvent({ acao: 'modificado', arquivo: 'src/app.js', timestamp: 'now' });
      },
      stop() {
        stoppedSentinels.push(true);
      },
      onError() {}
    }),
    speakFn: (text) => {
      spoken.push(text);
      return Promise.resolve({ ok: true });
    }
  });

  assert(ipcMain.handlers.has(CHANNELS.launch), 'launch handler missing');
  assert(ipcMain.handlers.has(CHANNELS.stop), 'stop handler missing');
  assert(ipcMain.listeners.has(CHANNELS.input), 'input listener missing');

  const result = await ipcMain.invoke(CHANNELS.launch, {
    mission: 'fake',
    workspacePath: process.cwd(),
    runtime: 'codex'
  });
  assert.strictEqual(result.ok, true);
  assert(sent.some((item) => item.channel === CHANNELS.event && item.payload.type === 'file:event'), 'file event missing');
  assert(sent.some((item) => item.payload.type === 'mission:start'), 'mission start missing');
  assert(sent.some((item) => item.payload.type === 'agent:exit'), 'agent exit missing');
  ipcMain.send(CHANNELS.input, { paneId: 1, data: 'dir\r' });

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert(spoken.some((text) => /AVANT IA iniciado/.test(text)), 'start TTS missing');
  assert(spoken.some((text) => /Terminais concluidos/.test(text)), 'terminal TTS missing');
  assert(stoppedSentinels.length >= 1, 'sentinel cleanup missing');
  console.log('smoke-swarm-ipc ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

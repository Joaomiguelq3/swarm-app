const { createSwarm } = require('./swarm');
const { createSentinel } = require('./sentinel');
const { speak } = require('./tts');

const CHANNELS = {
  launch: 'swarm:orchestration:launch',
  stop: 'swarm:orchestration:stop',
  input: 'swarm:orchestration:input',
  event: 'swarm:orchestration:event'
};

function getWorkspacePath(input = {}) {
  return input.workspacePath || input.path || input.workspace?.path;
}

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: false,
          warning: `${label} timed out after ${timeoutMs}ms`
        });
      }, timeoutMs);
    })
  ]);
}

function registerSwarmIpc({
  ipcMain,
  getWindow,
  createSwarmFactory = createSwarm,
  createSentinelFactory = createSentinel,
  speakFn = speak,
  cleanupTimeoutMs = 2000
}) {
  let active = null;
  let stoppingPromise = null;

  function send(payload) {
    const window = typeof getWindow === 'function' ? getWindow() : null;
    if (window && !window.isDestroyed()) {
      window.webContents.send(CHANNELS.event, payload);
    }
  }

  function speakBestEffort(text) {
    Promise.resolve()
      .then(() => speakFn(text))
      .then((result) => {
        if (result && result.ok === false && result.error) {
          send({
            type: 'tts:warning',
            status: 'IDLE',
            message: `TTS ignorado: ${result.error}`,
            timestamp: new Date().toISOString()
          });
        }
      })
      .catch((error) => {
        send({
          type: 'tts:warning',
          status: 'IDLE',
          message: `TTS ignorado: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      });
  }

  async function stopActive(reason = 'stop') {
    if (stoppingPromise) {
      return stoppingPromise;
    }

    if (!active) {
      return { ok: true, stopped: false };
    }

    stoppingPromise = (async () => {
      const current = active;
      active = null;
      const warnings = [];

      try {
        if (current.unsubscribe) {
          current.unsubscribe();
        }
      } catch (error) {
        warnings.push(`unsubscribe: ${error.message}`);
      }

      if (current.sentinel) {
        try {
          const result = await withTimeout(current.sentinel.stop(), cleanupTimeoutMs, 'sentinel cleanup');
          if (result && result.warning) {
            warnings.push(result.warning);
          }
        } catch (error) {
          warnings.push(`sentinel: ${error.message}`);
        }
      }

      if (current.swarm && reason !== 'mission-complete') {
        try {
          current.swarm.stop(reason);
        } catch (error) {
          warnings.push(`swarm: ${error.message}`);
        }
      }

      for (const warning of warnings) {
        send({
          type: 'cleanup:warning',
          status: 'IDLE',
          reason,
          message: `Cleanup: ${warning}`,
          timestamp: new Date().toISOString()
        });
      }

      return { ok: true, stopped: true, reason, warnings };
    })();

    try {
      return await stoppingPromise;
    } finally {
      stoppingPromise = null;
    }
  }

  ipcMain.handle(CHANNELS.launch, async (_event, input = {}) => {
    await stopActive('restart');

    const workspacePath = getWorkspacePath(input);
    const swarm = createSwarmFactory();
    const sentinel = workspacePath
      ? createSentinelFactory(workspacePath, {
          onEvent(fileEvent) {
            send({
              type: 'file:event',
              status: 'WRITING',
              file: fileEvent,
              message: `${fileEvent.arquivo} ${fileEvent.acao}`,
              timestamp: fileEvent.timestamp
            });
          }
        })
      : null;

    const unsubscribe = swarm.onEvent((event) => {
      send(event);
      if (event.type === 'mission:start') {
        const label = event.runtime === 'claude' ? 'Claude Code' : event.runtime === 'codex' ? 'Codex' : event.runtime;
        const count = Array.isArray(event.tasks) ? event.tasks.length : 0;
        speakBestEffort(`AVANT IA iniciado com ${label}. ${count} terminais em paralelo.`);
      }
      if (event.type === 'agent:exit' && event.status === 'DONE') {
        speakBestEffort(`Terminal ${event.paneId || ''} concluido.`);
      }
      if (event.type === 'agent:exit' && event.status === 'ERROR') {
        speakBestEffort(`Erro no terminal ${event.paneId || ''}.`);
      }
      if (event.type === 'mission:done') {
        speakBestEffort(event.status === 'DONE' ? 'Terminais concluidos.' : 'Terminais concluidos com erros.');
        if (active && active.swarm === swarm) {
          stopActive('mission-complete').catch((error) => {
            send({
              type: 'mission:error',
              status: 'ERROR',
              message: error.message,
              timestamp: new Date().toISOString()
            });
          });
        }
      }
    });

    active = { swarm, sentinel, unsubscribe };

    if (sentinel) {
      sentinel.onError((error) => {
        send({
          type: 'file:error',
          status: 'ERROR',
          message: `Sentinel: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      });
      sentinel.start();
    }

    try {
      return swarm.launch(input);
    } catch (error) {
      await stopActive('launch-error');
      send({
        type: 'mission:error',
        status: 'ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  });

  ipcMain.handle(CHANNELS.stop, async (_event, reason = 'stop') => {
    return stopActive(reason);
  });

  ipcMain.handle(CHANNELS.input, async (_event, input = {}) => {
    if (!active || !active.swarm) {
      return { ok: false, error: 'Nenhum terminal ativo.' };
    }
    return active.swarm.writeToPane(input.paneId, input.data);
  });

  return {
    stop: stopActive
  };
}

module.exports = {
  CHANNELS,
  registerSwarmIpc
};

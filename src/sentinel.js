const path = require('path');
const { EventEmitter } = require('events');
const chokidar = require('chokidar');

const ACTIONS = {
  add: 'criado',
  change: 'modificado',
  unlink: 'removido'
};

function normalizePath(rootPath, filePath) {
  return path.relative(rootPath, filePath).replace(/\\/g, '/');
}

function createSentinel(rootPath, options = {}) {
  const root = path.resolve(rootPath);
  const emitter = new EventEmitter();
  let watcher = null;

  function emit(action, filePath) {
    const event = {
      acao: ACTIONS[action],
      arquivo: normalizePath(root, filePath),
      timestamp: new Date().toISOString()
    };
    emitter.emit('event', event);
    if (typeof options.onEvent === 'function') {
      options.onEvent(event);
    }
  }

  return {
    start() {
      if (watcher) {
        return watcher;
      }

      watcher = chokidar.watch(root, {
        ignoreInitial: true,
        ignored: options.ignored,
        awaitWriteFinish: options.awaitWriteFinish || false
      });

      watcher.on('add', (filePath) => emit('add', filePath));
      watcher.on('change', (filePath) => emit('change', filePath));
      watcher.on('unlink', (filePath) => emit('unlink', filePath));
      watcher.on('error', (error) => emitter.emit('error', error));
      return watcher;
    },
    async stop() {
      if (!watcher) {
        return;
      }
      const current = watcher;
      watcher = null;
      await current.close();
    },
    onEvent(listener) {
      emitter.on('event', listener);
      return () => emitter.off('event', listener);
    },
    onError(listener) {
      emitter.on('error', listener);
      return () => emitter.off('error', listener);
    }
  };
}

module.exports = {
  ACTIONS,
  createSentinel
};

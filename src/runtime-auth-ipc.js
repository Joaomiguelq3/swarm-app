const { RUNTIMES } = require('./runtimes');
const { checkRuntime, openRuntimeLogin } = require('./runtime-auth');

const CHANNELS = {
  list: 'swarm:runtimes:list',
  status: 'swarm:runtimes:status',
  check: 'swarm:runtimes:check',
  login: 'swarm:runtimes:login'
};

function registerRuntimeAuthIpc({ ipcMain }) {
  if (!ipcMain || typeof ipcMain.handle !== 'function') {
    throw new Error('ipcMain with handle() is required');
  }

  ipcMain.handle(CHANNELS.list, () => {
    return RUNTIMES;
  });

  ipcMain.handle(CHANNELS.status, (_event, input = {}) => {
    return checkRuntime(input.runtime);
  });

  ipcMain.handle(CHANNELS.check, (_event, input = {}) => {
    const runtime = typeof input === 'string' ? input : input.runtime;
    return checkRuntime(runtime);
  });

  ipcMain.handle(CHANNELS.login, (_event, input = {}) => {
    const runtime = typeof input === 'string' ? input : input.runtime;
    return openRuntimeLogin(runtime);
  });
}

module.exports = {
  CHANNELS,
  registerRuntimeAuthIpc
};

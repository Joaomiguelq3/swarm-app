const {
  createWorkspace,
  listWorkspaces,
  touchWorkspace,
  updateWorkspaceModel,
  updateWorkspaceRuntime
} = require('./workspaces');

const CHANNELS = {
  list: 'swarm:workspaces:list',
  create: 'swarm:workspaces:create',
  updateRuntime: 'swarm:workspaces:update-runtime',
  updateModel: 'swarm:workspaces:update-model',
  touch: 'swarm:workspaces:touch'
};

function registerWorkspaceIpc({ ipcMain, app }) {
  if (!ipcMain || typeof ipcMain.handle !== 'function') {
    throw new Error('ipcMain with handle() is required');
  }

  ipcMain.handle(CHANNELS.list, () => {
    return listWorkspaces({ app });
  });

  ipcMain.handle(CHANNELS.create, (_event, input = {}) => {
    return createWorkspace({ ...input, app });
  });

  ipcMain.handle(CHANNELS.updateRuntime, (_event, input = {}) => {
    return updateWorkspaceRuntime({ ...input, app });
  });

  ipcMain.handle(CHANNELS.updateModel, (_event, input = {}) => {
    return updateWorkspaceModel({ ...input, app });
  });

  ipcMain.handle(CHANNELS.touch, (_event, input = {}) => {
    return touchWorkspace({ ...input, app });
  });
}

module.exports = {
  CHANNELS,
  registerWorkspaceIpc
};

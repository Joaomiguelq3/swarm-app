const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('swarm', {
  getAppInfo: () => ipcRenderer.invoke('swarm:get-app-info'),
  workspaces: {
    list: () => ipcRenderer.invoke('swarm:workspaces:list'),
    create: (input) => ipcRenderer.invoke('swarm:workspaces:create', input),
    updateRuntime: (id, runtime, model) => {
      return ipcRenderer.invoke('swarm:workspaces:update-runtime', { id, runtime, model });
    },
    updateModel: (id, model) => {
      return ipcRenderer.invoke('swarm:workspaces:update-model', { id, model });
    },
    touch: (id) => ipcRenderer.invoke('swarm:workspaces:touch', { id })
  }
});

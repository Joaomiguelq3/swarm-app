const { contextBridge, ipcRenderer } = require('electron');

const ORCHESTRATION_EVENT = 'swarm:orchestration:event';

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
  },
  orchestration: {
    launch: (input) => ipcRenderer.invoke('swarm:orchestration:launch', input),
    stop: (reason) => ipcRenderer.invoke('swarm:orchestration:stop', reason),
    onEvent: (callback) => {
      if (typeof callback !== 'function') {
        return () => {};
      }
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on(ORCHESTRATION_EVENT, listener);
      return () => ipcRenderer.off(ORCHESTRATION_EVENT, listener);
    }
  }
});

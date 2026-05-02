const { contextBridge, ipcRenderer } = require('electron');

const ORCHESTRATION_EVENT = 'swarm:orchestration:event';

contextBridge.exposeInMainWorld('swarm', {
  getAppInfo: () => ipcRenderer.invoke('swarm:get-app-info'),
  workspaces: {
    list: () => ipcRenderer.invoke('swarm:workspaces:list'),
    selectDirectory: () => ipcRenderer.invoke('swarm:dialog:select-directory'),
    create: (input) => ipcRenderer.invoke('swarm:workspaces:create', input),
    updateRuntime: (id, runtime, model) => {
      return ipcRenderer.invoke('swarm:workspaces:update-runtime', { id, runtime, model });
    },
    updateModel: (id, model) => {
      return ipcRenderer.invoke('swarm:workspaces:update-model', { id, model });
    },
    touch: (id) => ipcRenderer.invoke('swarm:workspaces:touch', { id })
  },
  runtimes: {
    list: () => ipcRenderer.invoke('swarm:runtimes:list'),
    status: (runtime) => ipcRenderer.invoke('swarm:runtimes:status', { runtime }),
    check: (runtime) => ipcRenderer.invoke('swarm:runtimes:check', { runtime }),
    login: (runtime) => ipcRenderer.invoke('swarm:runtimes:login', { runtime })
  },
  loginRuntime: (runtime) => ipcRenderer.invoke('swarm:runtimes:login', runtime),
  checkRuntime: (runtime) => ipcRenderer.invoke('swarm:runtimes:check', runtime),
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

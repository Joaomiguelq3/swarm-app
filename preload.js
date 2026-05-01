const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('swarm', {
  getAppInfo: () => ipcRenderer.invoke('swarm:get-app-info')
});

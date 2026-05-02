const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerWorkspaceIpc } = require('./src/workspace-ipc');
const { registerSwarmIpc } = require('./src/swarm-ipc');

let mainWindow = null;
let swarmIpc = null;
let cleanupStarted = false;

function stopSwarmFor(reason) {
  if (!swarmIpc || cleanupStarted) {
    return;
  }
  cleanupStarted = true;
  Promise.resolve(swarmIpc.stop(reason)).catch((error) => {
    console.error(`SWARM cleanup failed during ${reason}: ${error.message}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    backgroundColor: '#0a0a0a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', () => {
    stopSwarmFor('window-close');
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'home.html'));
}

ipcMain.handle('swarm:get-app-info', () => ({
  name: 'SWARM',
  runtime: 'electron',
  status: 'foundation-ready'
}));

registerWorkspaceIpc({ ipcMain, app });
swarmIpc = registerSwarmIpc({ ipcMain, getWindow: () => mainWindow });

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  stopSwarmFor('before-quit');
});

app.on('will-quit', () => {
  stopSwarmFor('will-quit');
});

app.on('window-all-closed', () => {
  stopSwarmFor('app-close');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

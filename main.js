const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const { registerAutoUpdater } = require('./src/auto-updater');
const { registerRuntimeAuthIpc } = require('./src/runtime-auth-ipc');
const { registerWorkspaceIpc } = require('./src/workspace-ipc');
const { registerSwarmIpc } = require('./src/swarm-ipc');

let mainWindow = null;
let swarmIpc = null;
let cleanupStarted = false;
let installingUpdate = false;
const appIconPath = path.join(__dirname, 'assets', 'app-icon.png');
const appIconIcoPath = path.join(__dirname, 'assets', 'app-icon.ico');

app.setName('AVANT IA');
app.setAppUserModelId('com.avantia.desktop');

function getAppIcon() {
  const iconPath = process.platform === 'win32' ? appIconIcoPath : appIconPath;
  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? iconPath : icon;
}

function stopSwarmFor(reason) {
  if (!swarmIpc || cleanupStarted || installingUpdate) {
    return;
  }
  cleanupStarted = true;
  Promise.resolve(swarmIpc.stop(reason)).catch((error) => {
    console.error(`AVANT IA cleanup failed during ${reason}: ${error.message}`);
  });
}

function createWindow() {
  const appIcon = getAppIcon();
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    icon: appIcon,
    backgroundColor: '#0a0a0a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.setIcon(appIcon);
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
  name: 'AVANT IA',
  runtime: 'electron',
  status: 'foundation-ready'
}));

ipcMain.handle('swarm:dialog:select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecionar pasta do workspace',
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true, path: '' };
  }

  return { canceled: false, path: result.filePaths[0] };
});

registerWorkspaceIpc({ ipcMain, app });
registerRuntimeAuthIpc({ ipcMain });
registerAutoUpdater({
  ipcMain,
  app,
  getWindow: () => mainWindow,
  onBeforeInstall: () => {
    installingUpdate = true;
  }
});
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

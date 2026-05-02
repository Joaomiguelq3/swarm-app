'use strict';

const { autoUpdater } = require('electron-updater');

let updateReady = false;
let updateAvailable = false;
let downloading = false;

function sendUpdateEvent(getWindow, type, payload = {}) {
  const window = typeof getWindow === 'function' ? getWindow() : null;
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send('avant:update:event', {
    type,
    ...payload,
    timestamp: new Date().toISOString()
  });
}

function registerAutoUpdater({ ipcMain, app, getWindow }) {
  if (!ipcMain || typeof ipcMain.handle !== 'function') {
    throw new Error('ipcMain with handle() is required');
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateEvent(getWindow, 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    updateAvailable = true;
    downloading = false;
    sendUpdateEvent(getWindow, 'available', {
      version: info.version
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    updateReady = false;
    updateAvailable = false;
    downloading = false;
    sendUpdateEvent(getWindow, 'not-available', {
      version: info.version
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    downloading = true;
    sendUpdateEvent(getWindow, 'download-progress', {
      percent: Math.round(progress.percent || 0)
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true;
    updateAvailable = true;
    downloading = false;
    sendUpdateEvent(getWindow, 'downloaded', {
      version: info.version
    });
  });

  autoUpdater.on('error', (error) => {
    sendUpdateEvent(getWindow, 'error', {
      message: error.message
    });
  });

  ipcMain.handle('avant:update:check', async () => {
    if (!app.isPackaged) {
      return {
        ok: false,
        skipped: true,
        message: 'Auto-update so roda no app instalado.'
      };
    }

    const result = await autoUpdater.checkForUpdates();
    return {
      ok: true,
      updateInfo: result ? result.updateInfo : null
    };
  });

  ipcMain.handle('avant:update:install', async () => {
    if (updateReady) {
      autoUpdater.quitAndInstall(false, true);
      return { ok: true, action: 'installing' };
    }

    if (updateAvailable && !downloading) {
      downloading = true;
      await autoUpdater.downloadUpdate();
      return { ok: true, action: 'downloading' };
    }

    if (downloading) {
      return {
        ok: true,
        action: 'downloading',
        message: 'Atualizacao ja esta baixando.'
      };
    }

    await autoUpdater.checkForUpdates();
    return { ok: true, action: 'checking' };
  });
}

module.exports = {
  registerAutoUpdater
};

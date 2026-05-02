'use strict';

const { autoUpdater } = require('electron-updater');

let updateReady = false;

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

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateEvent(getWindow, 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateEvent(getWindow, 'available', {
      version: info.version
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendUpdateEvent(getWindow, 'not-available', {
      version: info.version
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateEvent(getWindow, 'download-progress', {
      percent: Math.round(progress.percent || 0)
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true;
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

  ipcMain.handle('avant:update:install', () => {
    if (!updateReady) {
      return {
        ok: false,
        message: 'Nenhuma atualizacao baixada.'
      };
    }

    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  });
}

module.exports = {
  registerAutoUpdater
};

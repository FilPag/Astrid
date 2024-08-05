import 'dotenv/config';
import { app, BrowserWindow, nativeTheme } from 'electron';
import * as Astrid from './main/Astrid';
import { initIpcEvents } from './main/IPCHandler';
import * as streamManager from './main/StreamManager';
import * as TrayManager from './main/TrayManager';
import * as WindowManager from './main/WindowManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

if (process.platform === 'darwin') {
  app.dock.hide();
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  initIpcEvents();
  Astrid.init();
  TrayManager.createTray();

  setTimeout(() => {
    WindowManager.createMainWindow(TrayManager.tray.getBounds());
  }, 500);

  WindowManager.createSearchBar();
  streamManager.getCurrentFrame();
});

app.on('before-quit', () => {
  WindowManager.triggerQuit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.createMainWindow(TrayManager.tray.getBounds());
  }

  if (!WindowManager.mainWindow.isVisible()) {
    WindowManager.mainWindow.show();
  }
});

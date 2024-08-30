import 'dotenv/config';
import { app, BrowserWindow, nativeTheme } from 'electron';
import * as Astrid from './main/Astrid';
import { initIpcEvents } from './main/IPCHandler';
import * as TrayManager from './main/TrayManager';
import * as WindowManager from './main/WindowManager';

if (require('electron-squirrel-startup')) {
  app.quit();
}

/*if (process.platform === 'darwin') {
  app.dock.hide();
}*/

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  initIpcEvents();
  Astrid.init();
  TrayManager.createTray();
  WindowManager.createSearchBar();
  WindowManager.createMainWindow();
});

app.on('before-quit', () => {
  WindowManager.triggerQuit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.createMainWindow();
  }

  if (!WindowManager.mainWindow.isVisible()) {
    WindowManager.mainWindow.show();
  }
});

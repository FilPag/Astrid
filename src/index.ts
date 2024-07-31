import 'dotenv/config';
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import * as Astrid from './main/Astrid';
import { startStream, stopStream } from './main/StreamManager';
import * as TrayManager from './main/TrayManager';
import * as WindowManager from './main/WindowManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

if (process.platform === 'darwin') {
  app.dock.hide();
}

const onMessageCreated = (message: Message) => {
  WindowManager.mainWindow.webContents.send('messageCreated', message);
};
const onMessageDelta = (delta: MessageDelta, snapshot: Message) => {
  WindowManager.mainWindow.webContents.send('messageDelta', delta, snapshot);
};
const onMessageDone = (message: Message) => {
  WindowManager.mainWindow.webContents.send('messageDone', message);
};

app.whenReady().then(() => {
  ipcMain.handle('startStream', () => {
    return startStream();
  });
  ipcMain.handle('stopStream', () => {
    return stopStream();
  });

  ipcMain.handle('cancelRun', () => {
    Astrid.cancelRun();
  });

  ipcMain.on('sendMessage', async (_event, message) => {
    if (_event.sender.id === WindowManager.searchBar.id) {
      WindowManager.refocusMainWindow();
    }

    return Astrid.sendMessage(message, onMessageCreated, onMessageDelta, onMessageDone);
  });

  nativeTheme.themeSource = 'dark';

  Astrid.init();
  TrayManager.createTray();

  setTimeout(() => {
    WindowManager.createMainWindow(TrayManager.tray.getBounds());
  }, 500);

  WindowManager.createSearchBar();
});

app.on('before-quit', () => {
  WindowManager.triggerQuit();
  console.log(TrayManager.tray.getBounds());
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.createMainWindow(TrayManager.tray.getBounds());
  }

  if (!WindowManager.mainWindow.isVisible()) {
    WindowManager.mainWindow.show();
  }
});

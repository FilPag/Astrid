import { ipcMain, shell } from 'electron';
import * as Astrid from '../main/Astrid';
import * as WindowManager from '../main/WindowManager';
import { ipc_chat_message } from '../render/types';
import { getCurrentFrame, isStreaming, startStream, stopStream } from './StreamManager';

let busy = false;
const messageQueue: ipc_chat_message[] = [];

const onMessageCreated = (message: ipc_chat_message) => {
  WindowManager.mainWindow.webContents.send('messageCreated', message);
};
const onMessageDelta = (snapshot: ipc_chat_message) => {
  WindowManager.mainWindow.webContents.send('messageDelta', snapshot);
};
const onMessageDone = (message: ipc_chat_message) => {
  WindowManager.mainWindow.webContents.send('messageDone', message);

  if (messageQueue.length > 0) {
    const nextMessage = messageQueue.shift();

    WindowManager.mainWindow.webContents.send('userMessage', nextMessage);
    WindowManager.refocusMainWindow();
    processMessage(nextMessage);
  } else {
    busy = false;
  }
};

const processMessage = async (message: ipc_chat_message) => {
  busy = true;
  let image = undefined;
  if (isStreaming) {
    image = await getCurrentFrame();
  }
  return Astrid.sendMessage(message, image, onMessageCreated, onMessageDelta, onMessageDone);
};

export const initIpcEvents = async () => {
  ipcMain.handle('startStream', () => {
    return startStream();
  });
  ipcMain.handle('stopStream', () => {
    return stopStream();
  });

  ipcMain.handle('cancelRun', () => {
    Astrid.cancelRun();
    messageQueue.length = 0;
    busy = false;
  });

  ipcMain.on('openLink', (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('getChatLog', () => {
    return Astrid.getChatLog();
  });

  ipcMain.on('sendMessage', async (_event, message) => {
    if (_event.sender.id === WindowManager.searchBar.id) {
      WindowManager.refocusMainWindow();
      if (busy) {
        messageQueue.push(message);
        return;
      }
      WindowManager.mainWindow.webContents.send('userMessage', message);
    }
    processMessage(message);
  });
};

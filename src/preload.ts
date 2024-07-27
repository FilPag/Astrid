// See the Electron documentation for details on how to use preload scripts:

import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStreamSource: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on('updateStreamSource', (_event, value) => callback(value)),
  startStream: () => ipcRenderer.invoke('startStream'),
  stopStream: () => ipcRenderer.invoke('stopStream'),
  sendMessage: (message: any) => {
    ipcRenderer.send('sendMessage', message);
  },
  onMessageCreated: (callback: (arg0: Message) => void) => {
    ipcRenderer.on('messageCreated', (event, message) => {
      callback(message);
    });
  },
  onMessageDelta: (callback: (arg0: MessageDelta, arg1: Message) => void) => {
    ipcRenderer.on('messageDelta', (event, delta, snapshot) => {
      callback(delta, snapshot);
    });
  },
  onMessageDone: (callback: (arg0: Message) => void) => {
    ipcRenderer.on('messageDone', (event, message) => {
      callback(message);
    });
  },
});

contextBridge.exposeInMainWorld('env', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});

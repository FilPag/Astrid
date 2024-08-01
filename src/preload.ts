// See the Electron documentation for details on how to use preload scripts:

import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import { ipc_chat_message } from './render/types';

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStreamSource: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on('updateStreamSource', (_event, value) => callback(value)),
  startStream: () => ipcRenderer.invoke('startStream'),
  stopStream: () => ipcRenderer.invoke('stopStream'),
  cancelRun: () => ipcRenderer.invoke('cancelRun'),
  sendMessage: (message: any) => {
    ipcRenderer.send('sendMessage', message);
  },

  openLink: (url: string) => {
    ipcRenderer.send('openLink', url);
  },
  onUserMessage: (callback: (arg0: ipc_chat_message) => void) => {
    ipcRenderer.on('userMessage', (event, message: ipc_chat_message) => {
      callback(message);
    });
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

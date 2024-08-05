// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from 'electron';
import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import { ipc_chat_message } from './render/types';

contextBridge.exposeInMainWorld('electronAPI', {
  startStream: () => ipcRenderer.invoke('startStream'),
  stopStream: () => ipcRenderer.invoke('stopStream'),

  cancelRun: () => ipcRenderer.invoke('cancelRun'),
  getChatLog: () => ipcRenderer.invoke('getChatLog'),
  sendMessage: (message: ipc_chat_message) => {
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

  onStreamToggle: (callback: (streamStatus: boolean) => void) => {
    ipcRenderer.on('onStreamToggle', (event, streamStatus) => {
      callback(streamStatus);
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

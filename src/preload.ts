// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onUpdateStreamSource: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) => ipcRenderer.on("updateStreamSource", (_event, value) => callback(value)),
  startStream: () => ipcRenderer.invoke("startStream")
});

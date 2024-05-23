import { app, BrowserWindow, desktopCapturer, ipcMain, Menu, nativeImage, screen, Tray } from "electron";
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}


const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
};

let mainWindow: BrowserWindow;
let tray: Tray 

app.whenReady().then(() => {
  ipcMain.handle("startStream", startStream);

  const trayIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '.webpack/assets/icon.png'));
  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  createWindow();
  mainWindow.hide()
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
});

const getMonitorInFocus = async () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentMonitor = screen.getDisplayNearestPoint(cursorPosition);

  const sources = await desktopCapturer.getSources({ types: ["screen"] });
  const activeSource = sources.find(
    (source) => source.display_id === currentMonitor.id.toString(),
  );

  if (activeSource === undefined) {
    console.error(
      "Unable to find source with id: " + currentMonitor.id.toString(),
    );
    return;
  }
  return activeSource.id;
};

let lastMonitorId = "";
const streamCron = async () => {
  const srcID = await getMonitorInFocus();
  if (srcID !== lastMonitorId) {
    lastMonitorId = srcID;
    mainWindow.webContents.send("updateStreamSource", srcID);
  }
};

let streamMonitor: NodeJS.Timeout
const startStream = async () => {
  const srcID = await getMonitorInFocus();

  if(streamMonitor === undefined){
    streamMonitor = setInterval(streamCron, 100);
    lastMonitorId = srcID;
  }

  return srcID
}

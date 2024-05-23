import { app, BrowserWindow, desktopCapturer, ipcMain, Menu, nativeImage, screen, Tray } from "electron";
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow
let shouldQuit = false

const trayIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '.webpack/assets/icon.png'));


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

  mainWindow.on("close", (event: { preventDefault: () => void; }) => {
    if (!shouldQuit) {
      mainWindow.hide()
      event.preventDefault();
    }
  });


};

app.whenReady().then(() => {
  ipcMain.handle("startStream", startStream);

  const tray = new Tray(trayIcon)
  tray.on('click', () => { mainWindow.show() })
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Quit', type: 'normal', click: () => { shouldQuit = true; app.quit() } },
  ])
  tray.setToolTip('Astrid')
  tray.setContextMenu(trayMenu)

  createWindow();
  mainWindow.hide()

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

  if (streamMonitor === undefined) {
    streamMonitor = setInterval(streamCron, 100);
    lastMonitorId = srcID;
  }

  return srcID
}

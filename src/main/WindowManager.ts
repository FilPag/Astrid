import { BrowserWindow } from 'electron';

export let shouldQuit = false;
export let mainWindow: BrowserWindow;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const triggerQuit = (): void => {
  shouldQuit = true;
};

export const createMainWindow = (trayBounds: Electron.Rectangle): void => {
  mainWindow = new BrowserWindow({
    title: 'Astrid',
    minHeight: 400,
    minWidth: 300,
    height: 400,
    width: 300,
    //resizable: false,
    vibrancy: 'popover',
    backgroundMaterial: 'acrylic',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.webContents.openDevTools({ mode: 'undocked' });

  if (process.platform === 'win32') {
    mainWindow.menuBarVisible = false;
  }

  mainWindow.on('close', (event) => {
    if (!shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

export const focusWindow = (trayBounds: Electron.Rectangle): void => {
  if (trayBounds.y !== mainWindow.getBounds().y) {
    mainWindow.setBounds({
      x: trayBounds.x,
      y: trayBounds.y,
    });
  }
  mainWindow.show();
  mainWindow.focus();
};

import { app, BrowserWindow, globalShortcut } from 'electron';
const { screen } = require('electron');

export let shouldQuit = false;
export let mainWindow: BrowserWindow;
export let searchBar: BrowserWindow;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const triggerQuit = (): void => {
  shouldQuit = true;
};

export const createMainWindow = (): void => {
  mainWindow = new BrowserWindow({
    title: 'Astrid',
    minHeight: 400,
    minWidth: 300,
    height: 400,
    width: 300,
    tabbingIdentifier: 'astrid',
    vibrancy: 'popover',
    backgroundMaterial: 'acrylic',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  if (process.platform === 'win32') {
    mainWindow.menuBarVisible = false;
  }

  mainWindow.on('close', (event) => {
    if (!shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
      app.dock.hide();
    }
  });
};

export const createSearchBar = (): void => {
  searchBar = new BrowserWindow({
    title: 'searchbar',
    height: 60,
    width: 600,
    frame: false,
    hiddenInMissionControl: true,
    focusable: true,
    resizable: false,
    vibrancy: 'window',
    backgroundMaterial: 'acrylic',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  searchBar.hide();

  if (process.platform === 'win32') {
    searchBar.menuBarVisible = false;
  }

  if (process.platform === 'darwin') {
    searchBar.excludedFromShownWindowsMenu = true;
  }

  searchBar.loadURL(MAIN_WINDOW_WEBPACK_ENTRY + '#input');

  searchBar.setAlwaysOnTop(true, 'floating');
  searchBar.on('ready-to-show', () => {
    const ret = globalShortcut.register('Alt+Space', () => {
      toggleSearchBar();
    });
    if (!ret) {
      console.error('registration failed');
    }
  });

  searchBar.on('blur', () => {
    searchBar.hide();
  });
};

export const refocusMainWindow = (): void => {
  mainWindow.show();
  searchBar.hide();
};

export const toggleSearchBar = (): void => {
  if (searchBar.isFocused()) {
    searchBar.hide();
  } else {
    const mousePosition = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(mousePosition);

    let { x, y } = display.bounds;
    x = x + display.size.width / 2 - searchBar.getSize()[0] / 2;
    y = y + display.size.height / 2 - searchBar.getSize()[1] / 2;

    searchBar.setPosition(x, y);
    searchBar.show();
    searchBar.focus();
  }
};

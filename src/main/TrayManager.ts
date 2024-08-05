import { Menu, Tray, app, nativeImage } from 'electron';
import * as path from 'path';
import * as WindowManager from './WindowManager';

const trayIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '.webpack/assets/icon.png'));
let trayMenu: Menu;
export let tray: Tray;

export const setStreamStatus = (status: boolean) => {
  trayMenu.items[0].checked = status;
};

export const createTray = () => {
  tray = new Tray(trayIcon);

  tray.on('click', () => {
    WindowManager.mainWindow.show();
  });

  trayMenu = Menu.buildFromTemplate([
    {
      label: 'Screen Share',
      type: 'checkbox',
      click: (box) => {
        WindowManager.mainWindow.webContents.send('onStreamToggle', box.checked);
      },
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        WindowManager.triggerQuit();
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Astrid');
  tray.setContextMenu(trayMenu);
  return Tray;
};

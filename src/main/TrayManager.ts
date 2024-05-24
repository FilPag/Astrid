import { Menu, Tray, app, nativeImage } from 'electron';
import * as path from 'path';
import * as WindowManager from './WindowManager';

const trayIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '.webpack/assets/icon.png'));
export let tray: Tray;

export const createTray = () => {
  tray = new Tray(trayIcon);

  tray.on('click', () => {
    WindowManager.focusWindow(tray.getBounds());
  });
  const trayMenu = Menu.buildFromTemplate([
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

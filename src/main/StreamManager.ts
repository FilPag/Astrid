import { desktopCapturer, screen } from 'electron';
import { mainWindow } from './WindowManager';

let streamMonitor: NodeJS.Timeout;
let lastMonitorId = '';

export const getMonitorInFocus = async () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentMonitor = screen.getDisplayNearestPoint(cursorPosition);

  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const activeSource = sources.find((source) => source.display_id === currentMonitor.id.toString());

  if (activeSource === undefined) {
    console.error('Unable to find source with id: ' + currentMonitor.id.toString());
    return;
  }
  return activeSource.id;
};

export const streamCron = async () => {
  const srcID = await getMonitorInFocus();
  if (srcID !== lastMonitorId) {
    lastMonitorId = srcID;
    mainWindow.webContents.send('updateStreamSource', srcID);
  }
};

export const startStream = async () => {
  const srcID = await getMonitorInFocus();

  if (streamMonitor === undefined) {
    streamMonitor = setInterval(() => {
      streamCron();
    }, 100);
    lastMonitorId = srcID;
  }

  return srcID;
};

export const stopStream = async () => {
  clearInterval(streamMonitor);
  streamMonitor = undefined;
};

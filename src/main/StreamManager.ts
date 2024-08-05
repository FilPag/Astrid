import { screen } from 'electron';
import jimo from 'jimp';
import screenshot from 'screenshot-desktop';

export let isStreaming = false;

export const getMonitorInFocus = async () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentMonitor = screen.getDisplayNearestPoint(cursorPosition);

  return currentMonitor.id - 1;
};

export const getCurrentFrame = async () => {
  const screenID = await getMonitorInFocus();
  try {
    const image = await screenshot({ screen: screenID, format: 'png' }); // this is slow. TODO find better alternative for screenshot
    const downScaled = (await jimo.read(image)).resize(1920, 1080);
    return await downScaled.getBufferAsync(jimo.MIME_PNG);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const startStream = async () => {
  isStreaming = true;
};

export const stopStream = async () => {
  isStreaming = false;
};

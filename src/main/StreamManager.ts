import { screen } from 'electron';
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';

export let isStreaming = false;

export const getMonitorInFocus = async () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentMonitor = screen.getDisplayNearestPoint(cursorPosition);

  return currentMonitor.id - 1;
};

export const getCurrentFrame = async () => {
  const screenID = await getMonitorInFocus();
  try {
    const image = await screenshot({ screen: screenID, format: 'png' });
    const downScaled = await sharp(image).resize(1920, 1080);
    return downScaled.toBuffer();
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

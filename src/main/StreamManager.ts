import { execFile } from 'child_process';
import { screen } from 'electron';
import fs from 'fs';
import jimo from 'jimp';
import os from 'os';

export let isStreaming = false;

export const getMonitorInFocus = async () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentMonitor = screen.getDisplayNearestPoint(cursorPosition);

  const ids = screen
    .getAllDisplays()
    .map((display) => display.id)
    .sort();
  const indexMapping: { [key: number]: number } = {};
  ids.forEach((id, index) => {
    indexMapping[id] = index + 1;
  });

  return indexMapping[currentMonitor.id];
};

const screenCaptureMac = async (screenID: number): Promise<Buffer> => {
  const tmpFile = `${os.tmpdir()}/screenshot.png`;

  return new Promise<Buffer>((resolve, reject) => {
    execFile('screencapture', ['-D', screenID.toString(), '-C', '-x', '-t', 'png', tmpFile], (err: any) => {
      if (err) {
        reject(err);
      } else {
        const data = fs.readFileSync(tmpFile);
        fs.unlinkSync(tmpFile);
        resolve(data);
      }
    });
  });
};

export const getCurrentFrame = async () => {
  try {
    const screenID = await getMonitorInFocus();
    let image;
    if (os.platform() === 'darwin') {
      image = await screenCaptureMac(screenID);
    } else {
      throw new Error('Unsupported platform');
    }
    const downScaled = (await jimo.read(image)).resize(1920, 1080);
    console.debug('Sent');
    return downScaled.getBufferAsync(jimo.MIME_PNG);
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

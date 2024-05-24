import React, { useEffect, useRef } from 'react';
import { InputBar } from '../components/InputBar';
import styles from './MainScreen.module.scss';

export interface MainScreenProps {
  // Add any props here if needed
}

const getVideoStream = async (srcID: string) => {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      //@ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: srcID,
        minFrameRate: 60,
        minWidth: 1280,
        minHeight: 720,
        maxWidth: 1280,
        maxHeight: 720,
      },
    },
  });
};

export const MainScreen: React.FC<MainScreenProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onSubmit = (message: string) => {
    console.log(message);
  };

  useEffect(() => {
    window.electronAPI.startStream().then(async (srcID: string) => {
      const stream = await getVideoStream(srcID);
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    window.electronAPI.onUpdateStreamSource(async (srcID: string) => {
      const stream = await getVideoStream(srcID);
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <div className={styles.mainScreenContainer}>
      <InputBar onSubmit={onSubmit} />
    </div>
  );
};

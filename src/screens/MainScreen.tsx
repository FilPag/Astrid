import React, { useEffect, useRef } from "react";
import styles from "./MainScreen.module.scss";

export interface MainScreenProps {
  // Add any props here if needed
}

const getVideoStream = async (srcID: string) => {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      //@ts-ignore
      mandatory: {
        chromeMediaSource: "desktop",
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

  useEffect(() => {
    const fetchStreamSource = async () => {
      const srcID = await window.electronAPI.getStreamSource();
      const stream = await getVideoStream(srcID);
      videoRef.current.srcObject = stream;
    };
    fetchStreamSource();
  }, []);

  return (
    <div className={styles.mainScreenContainer}>
      <video className={styles.videoPlayer} ref={videoRef} autoPlay></video>
    </div>
  );
};

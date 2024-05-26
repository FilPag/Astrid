import React, { useEffect, useRef, useState } from 'react';
import styles from './MainScreen.module.scss';
import { Message, InputBar, chatMessage } from '../components';

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
  const messageLogRef = useRef<HTMLUListElement>(null);
  const [messages, setMessages] = useState<chatMessage[]>([]);

  const onSubmit = (message: string) => {

    setMessages([...messages, { userMessage: true, text: message }]);
    console.log(messages)
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

  useEffect(() => {
    if (messageLogRef.current) {
      messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.mainScreenContainer}>
      <ul className={styles.messageLog} ref={messageLogRef}>
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}
      </ul>
      <InputBar className={styles.inputBar} onSubmit={onSubmit} />
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

import { Message } from 'openai/resources/beta/threads/messages';
import { InputBar, Message as MessageComponent, chatMessage } from '../components';
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

const processMessage = (message: Message) => {
  if (message.content.length === 0) return undefined;
  if (message.content[0].type !== 'text') return undefined;
  return { role: message.role, content: message.content[0].text.value };
};

export const MainScreen: React.FC<MainScreenProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageLogRef = useRef<HTMLUListElement>(null);

  const [messages, setMessages] = useState<chatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<chatMessage>(undefined);
  const [isDone, setIsDone] = useState<boolean>(true);

  const onSubmit = async (message: string) => {
    const userMessage: chatMessage = { role: 'user', content: message };
    setMessages([...messages, userMessage]);
    setIsDone(false);

    await window.electronAPI.sendMessage({
      role: 'user',
      content: message,
    });
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

    window.electronAPI.onMessageCreated((message: Message) => {
      setCurrentMessage(processMessage(message));
    });
    window.electronAPI.onMessageDelta((delta: any, snapshot: Message) => {
      setCurrentMessage(processMessage(snapshot));
    });
    window.electronAPI.onMessageDone((msg: Message) => {
      const processedMsg = processMessage(msg);
      setMessages((prevMessages) => [...prevMessages, processedMsg]);

      setCurrentMessage(undefined);
      setIsDone(true);
    });
  }, []);

  useEffect(() => {
    if (messageLogRef.current) {
      messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
    }
  }, [messages, currentMessage]);

  return (
    <div className={styles.mainScreenContainer}>
      <ul className={styles.messageLog} ref={messageLogRef}>
        {messages.map((message, index) => (
          <MessageComponent message={message} key={index} />
        ))}
        {currentMessage && <MessageComponent message={currentMessage} />}
      </ul>
      <InputBar className={styles.inputBar} onSubmit={onSubmit} enabled={isDone} />
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

import { Message } from 'openai/resources/beta/threads/messages';
import toggleIcon from '../../assets/share_icon.svg';
import { InputBar, Message as MessageComponent, SlideToggle, TypingDots, chatMessage } from '../components';
import { ipc_chat_message } from '../types';
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
        minFrameRate: 10,
        minWidth: 1920,
        minHeight: 1080,
        maxWidth: 1920,
        maxHeight: 1080,
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
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream>(undefined);

  const toggleStream = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSharing(e.target.checked);
    if (e.target.checked) {
      const srcID = await window.electronAPI.startStream();
      const stream = await getVideoStream(srcID);
      setStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } else {
      window.electronAPI.stopStream();
      if (videoRef.current) videoRef.current.srcObject = undefined;
      setStream(undefined);
    }
  };

  const getCurrentFrame = async () => {
    if (!isSharing) return '';
    const track = stream.getVideoTracks()[0];
    //Hacky but works
    const imageCapture = new (window as any).ImageCapture(track);

    const image: ImageBitmap = await imageCapture.grabFrame();

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/png');

    return base64;
  };

  const onSubmit = async (message: string) => {
    const userMessage: chatMessage = { role: 'user', content: message };
    setMessages([...messages, userMessage]);
    setIsDone(false);
    setIsThinking(true);

    const image = await getCurrentFrame();

    await window.electronAPI.sendMessage({
      role: 'user',
      content: { message: message, image: image },
    });
  };

  const onCancel = () => {
    console.debug('aborting');
    window.electronAPI.cancelRun();

    setMessages((prevMessages) => [...prevMessages, currentMessage]);
    setCurrentMessage(undefined);

    setIsDone(true);
    setIsThinking(false);
  };

  useEffect(() => {
    window.electronAPI.onUpdateStreamSource(async (srcID: string) => {
      const stream = await getVideoStream(srcID);
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    window.electronAPI.onUserMessage((message: ipc_chat_message) => {
      setIsDone(false);
      setIsThinking(true);

      const processedMessage: chatMessage = { role: 'user', content: message.content.message };
      setMessages((prevMessages) => [...prevMessages, processedMessage]);
    });

    window.electronAPI.onMessageCreated((message: Message) => {
      setCurrentMessage(processMessage(message));
      setIsThinking(false);
    });
    window.electronAPI.onMessageDelta((delta: any, snapshot: Message) => {
      setCurrentMessage(processMessage(snapshot));
    });
    window.electronAPI.onMessageDone((message: Message) => {
      const processedMsg = processMessage(message);
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
      <SlideToggle className={styles.streamToggle} onToggle={toggleStream} icon={toggleIcon} />
      {/*<video ref={videoRef} className={styles.video} autoPlay />*/}
      <ul className={styles.messageLog} ref={messageLogRef}>
        {messages.map((message, index) => (
          <MessageComponent message={message} key={index} />
        ))}
        {currentMessage && <MessageComponent message={currentMessage} />}
      </ul>
      {isThinking && <TypingDots className={styles.dots} />}
      <InputBar className={styles.inputBar} onSubmit={onSubmit} onCancel={onCancel} disabled={!isDone} />
    </div>
  );
};

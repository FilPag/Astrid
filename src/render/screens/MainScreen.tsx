import React, { useEffect, useRef, useState } from 'react';

import toggleIcon from '../../assets/share_icon.svg';
import { InputBar, Message as MessageComponent, SlideToggle, TypingDots } from '../components';
import { ipc_chat_message } from '../types';
import styles from './MainScreen.module.scss';

export interface MainScreenProps {
  // Add any props here if needed
}

export const MainScreen: React.FC<MainScreenProps> = () => {
  const messageLogRef = useRef<HTMLUListElement>(null);

  const [messages, setMessages] = useState<ipc_chat_message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<ipc_chat_message>(undefined);
  const [isDone, setIsDone] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const toggleStream = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      window.electronAPI.startStream();
    } else {
      window.electronAPI.stopStream();
    }
  };

  const onSubmit = async (message: string) => {
    const userMessage: ipc_chat_message = { role: 'user', content: { message } };
    setMessages([...messages, userMessage]);
    setIsDone(false);
    setIsThinking(true);

    await window.electronAPI.sendMessage({
      role: 'user',
      content: { message: message, image: '' },
    });
  };

  const onCancel = () => {
    window.electronAPI.cancelRun();
    if (currentMessage !== undefined && currentMessage.role !== undefined) {
      setMessages((prevMessages) => [...prevMessages, currentMessage]);
      setCurrentMessage(undefined);
    }

    setIsDone(true);
    setIsThinking(false);
  };

  useEffect(() => {
    window.electronAPI.getChatLog().then((chatLog: ipc_chat_message[]) => {
      setMessages(chatLog);
    });

    window.electronAPI.onUserMessage((message: ipc_chat_message) => {
      setIsDone(false);
      setIsThinking(true);

      setMessages((prevMessages) => [...prevMessages, message]);
    });

    window.electronAPI.onMessageCreated((message: ipc_chat_message) => {
      setCurrentMessage(message);
      setIsThinking(false);
    });
    window.electronAPI.onMessageDelta((snapshot: ipc_chat_message) => {
      setCurrentMessage(snapshot);
    });
    window.electronAPI.onMessageDone((message: ipc_chat_message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

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
      <SlideToggle className={styles.streamToggle} toggleCallback={toggleStream} icon={toggleIcon} />
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

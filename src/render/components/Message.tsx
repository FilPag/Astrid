import React, { useEffect } from 'react';
import Markdown from 'react-markdown';
import styles from './Message.module.scss';
import { chatMessage } from './types';

export interface MessageProps {
  className?: string;
  message: chatMessage;
}

const handleLinkClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('http')) {
    event.preventDefault();
    window.electronAPI.openLink(target.getAttribute('href'));
  }
};

export const Message: React.FC<MessageProps> = ({ className, message }) => {
  const messageClass = message.role === 'user' ? styles.userMessage : styles.botMessage;

  useEffect(() => {
    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <div className={`${styles.container} ${className} ${messageClass}`}>
      <Markdown className={`${styles.message}`}>{message.content}</Markdown>
    </div>
  );
};

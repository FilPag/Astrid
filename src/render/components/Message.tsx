import React from 'react';
import Markdown from 'react-markdown';
import styles from './Message.module.scss';
import { chatMessage } from './types';

export interface MessageProps {
  className?: string;
  message: chatMessage;
}
export const Message: React.FC<MessageProps> = ({ className, message }) => {
  const messageClass = message.role === 'user' ? styles.userMessage : styles.botMessage;

  return (
    <div className={[styles.container, className, messageClass].join(' ')}>
      <Markdown className={`${styles.message}`}>{message.content}</Markdown>
    </div>
  );
};

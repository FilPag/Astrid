import React from 'react';
import styles from './Message.module.scss';
import { chatMessage } from './types';

export interface MessageProps {
  className?: string;
  message: chatMessage;
}
export const Message: React.FC<MessageProps> = ({ className, message }) => {
  const messageClass = message.userMessage ? styles.userMessage : styles.botMessage;

  return (
    <div className={[styles.container, className, messageClass].join(' ')}>
      <p className={`${styles.message}`}>
        {message.text}
      </p>
    </div>
  );
};

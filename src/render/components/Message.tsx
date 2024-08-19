import React, { useEffect } from 'react';
import Markdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ipc_chat_message } from '../types';
import styles from './Message.module.scss';

export interface MessageProps {
  className?: string;
  message: ipc_chat_message;
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
      <Markdown
        className={styles.message}
        children={message.content.message}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={dark}
              />
            ) : (
              <code {...rest} className={`${className} ${styles.codeCustom}`}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

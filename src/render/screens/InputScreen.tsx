import React, { useEffect, useRef } from 'react';
import styles from './InputScreen.module.scss';

interface InputScreenProps {}

export const InputScreen: React.FC<InputScreenProps> = (props) => {
  const [text, setText] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (text.trim() === '') {
        return;
      }

      await window.electronAPI.sendMessage({
        role: 'user',
        content: { message: text, image: '' },
      });

      setText('');
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        className={styles.input}
        onKeyDown={handleKeyDown}
        onChange={(e) => setText(e.target.value)}
        type="text"
        value={text}
        placeholder="Send a message to Astrid"
      ></input>
    </div>
  );
};

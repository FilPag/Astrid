import React, { useEffect, useState } from 'react';
import stop from '../../assets/stop.svg';
import upArrow from '../../assets/up_arrow.svg';
import styles from './InputBar.module.scss';

export interface InputBarProps {
  className?: string;
  disabled?: boolean;
  onSubmit: (message: string) => void;
  onCancel: () => void;
}
export const InputBar: React.FC<InputBarProps> = ({ className, disabled, onSubmit, onCancel }) => {
  const [text, setText] = useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (text.trim() === '') {
        return;
      }

      onSubmit(text);
      setText('');
    }
  };

  const onClick = () => {
    if (disabled) {
      onCancel();
    } else {
      if (text.trim() === '') {
        return;
      }
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className={`${styles.inputBarContainer} ${className}`}>
      <textarea
        className={`${styles.inputBar}`}
        ref={inputRef}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message to Astrid"
        value={text}
      ></textarea>
      <button className={styles.button} onClick={onClick}>
        {disabled ? <img src={stop} /> : <img src={upArrow} />}
      </button>
    </div>
  );
};

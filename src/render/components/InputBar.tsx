import React, { useState } from 'react';
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

  const auto_grow = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const element = event.currentTarget;
    element.style.height = 'fit-content';
    element.style.height = element.scrollHeight + 'px';
  };

  return (
    <div className={`${styles.inputBarContainer} ${className}`}>
      <textarea
        className={`${styles.inputBar}`}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={auto_grow}
        placeholder="Send a message to Astrid"
        value={text}
      ></textarea>
      <button className={styles.button} onClick={onClick}>
        {disabled ? <img src={stop} /> : <img src={upArrow} />}
      </button>
    </div>
  );
};

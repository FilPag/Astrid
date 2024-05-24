import React from 'react';
import styles from './InputBar.module.scss';

export interface InputBarProps {
  onSubmit: (message: string) => void;
}
export const InputBar: React.FC<InputBarProps> = ({ onSubmit }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const target = event.target as HTMLTextAreaElement;
      onSubmit(target.value);
      target.value = '';
      event.preventDefault();
    }
  };

  return (
    <>
      <textarea className={styles.inputBar} onKeyDown={handleKeyDown}></textarea>
    </>
  );
};

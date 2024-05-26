import React from 'react';
import styles from './InputBar.module.scss';

export interface InputBarProps {
  className?: string;
  onSubmit: (message: string) => void;
}
export const InputBar: React.FC<InputBarProps> = ({ className, onSubmit }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const target = event.target as HTMLTextAreaElement;
      event.preventDefault();

      if (target.value.trim() === '') {
        return;
      }

      onSubmit(target.value);
      target.value = '';
    }
  };

  return (
    <div className={className}>
      <textarea className={`${styles.inputBar}`} onKeyDown={handleKeyDown}></textarea>
    </div>
  );
};

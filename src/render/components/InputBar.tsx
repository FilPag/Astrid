import React from 'react';
import styles from './InputBar.module.scss';

export interface InputBarProps {
  className?: string;
  enabled?: boolean;
  onSubmit: (message: string) => void;
}
export const InputBar: React.FC<InputBarProps> = ({ className, enabled, onSubmit }) => {
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
      <textarea
        placeholder="Send a message to Astrid"
        className={`${styles.inputBar}`}
        onKeyDown={handleKeyDown}
        disabled={!enabled}
      ></textarea>
    </div>
  );
};

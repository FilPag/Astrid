import React from 'react';
import styles from './TypingDots.module.scss';

interface TypingDotsProps {
  className?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ className }) => {
  return (
    <div className={`${styles.typing} ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

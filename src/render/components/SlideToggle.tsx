import React from 'react';
import styles from './SlideToggle.module.scss';

export interface SlideToggleProps {
  className?: string;
  icon?: string;
  onToggle?: React.ChangeEventHandler<HTMLInputElement>;
}
export const SlideToggle: React.FC<SlideToggleProps> = ({ className, icon, onToggle }: SlideToggleProps) => {
  return (
    <div className={`${styles.toggleContainer} ${className}`}>
      <label className={styles.switch}>
        <input type="checkbox" onChange={onToggle} />
        <span className={styles.slider}></span>
      </label>
      {icon && <img src={icon} alt="Share Screen" />}
    </div>
  );
};

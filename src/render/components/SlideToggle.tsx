import React, { useEffect } from 'react';
import styles from './SlideToggle.module.scss';

export interface SlideToggleProps {
  className?: string;
  icon?: string;
  toggleCallback?: React.ChangeEventHandler<HTMLInputElement>;
}
export const SlideToggle: React.FC<SlideToggleProps> = ({ className, icon, toggleCallback }: SlideToggleProps) => {
  const [checked, setChecked] = React.useState(false);
  useEffect(() => {
    window.electronAPI.onStreamToggle((streamStatus: boolean) => {
      setChecked(streamStatus);
    });
  }, []);

  const onToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    if (toggleCallback) {
      toggleCallback(e);
    }
  };

  return (
    <div className={`${styles.toggleContainer} ${className}`}>
      <label className={styles.switch}>
        <input type="checkbox" onChange={onToggle} checked={checked} />
        <span className={styles.slider}></span>
      </label>
      {icon && <img src={icon} alt="Share Screen" />}
    </div>
  );
};

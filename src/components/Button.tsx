import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'medium', fullWidth = false, loading = false, className = '', disabled, ...props }) => {
  const classes = [styles.button, styles[variant], size !== 'medium' && styles[size], fullWidth && styles.fullWidth, className].filter(Boolean).join(' ');
  return <button className={classes} disabled={disabled || loading} {...props}>{children}</button>;
};
export default Button;

import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface FormGroupProps { children: ReactNode; className?: string; }
export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => <div className={`${styles.formGroup} ${className}`}>{children}</div>;

interface LabelProps { htmlFor?: string; children: ReactNode; required?: boolean; }
export const Label: React.FC<LabelProps> = ({ htmlFor, children, required }) => <label htmlFor={htmlFor} className={`${styles.label} ${required ? styles.required : ''}`}>{children}</label>;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { error?: string; helperText?: string; }
export const Input: React.FC<InputProps> = ({ error, helperText, className = '', ...props }) => (
  <div><input className={`${styles.input} ${error ? styles.error : ''} ${className}`} {...props} />{error && <p className={styles.errorText}>{error}</p>}{helperText && !error && <p className={styles.helperText}>{helperText}</p>}</div>
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { error?: string; helperText?: string; }
export const Textarea: React.FC<TextareaProps> = ({ error, helperText, className = '', ...props }) => (
  <div><textarea className={`${styles.textarea} ${error ? styles.error : ''} ${className}`} {...props} />{error && <p className={styles.errorText}>{error}</p>}{helperText && !error && <p className={styles.helperText}>{helperText}</p>}</div>
);

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { options: { value: string; label: string }[]; error?: string; placeholder?: string; }
export const Select: React.FC<SelectProps> = ({ options, error, placeholder, className = '', ...props }) => (
  <div><select className={`${styles.select} ${error ? styles.error : ''} ${className}`} {...props}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{error && <p className={styles.errorText}>{error}</p>}</div>
);

export default Input;

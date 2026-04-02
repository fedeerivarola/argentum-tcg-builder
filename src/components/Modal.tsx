import React, { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; }

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}><h2 className={styles.title}>{title}</h2><button className={styles.closeButton} onClick={onClose}>×</button></div>
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};
export default Modal;

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextType { showToast: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToast = () => { const context = useContext(ToastContext); if (!context) throw new Error('useToast must be used within ToastProvider'); return context; };

const getIcon = (type: ToastType): string => { switch (type) { case 'success': return '✓'; case 'error': return '✕'; case 'warning': return '⚠'; case 'info': return 'ℹ'; } };

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map(toast => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span className={styles.icon}>{getIcon(toast.type)}</span>
            <span className={styles.message}>{toast.message}</span>
            <button className={styles.closeBtn} onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export default ToastProvider;

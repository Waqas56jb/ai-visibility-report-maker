import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef();

  const toast = useCallback((msg) => {
    setMessage(msg);
    setShow(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 2400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast${show ? ' show' : ''}`} role="status">
        <CheckCircle2 className="lucide svg" />
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

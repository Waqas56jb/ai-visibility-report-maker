import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);

  const toast = useCallback((m) => {
    setMsg(m);
    setShow(true);
    window.setTimeout(() => setShow(false), 2400);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={`toast ${show ? 'show' : ''}`}>
        <CheckCircle2 className="lucide svg" />
        <span>{msg}</span>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

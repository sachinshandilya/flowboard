import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '../types';

/**
 * ToastContext type definition
 */
interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

/**
 * ToastContext - React Context for toast notifications
 */
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider Props
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Maximum number of visible toasts
 */
const MAX_VISIBLE_TOASTS = 3;

/**
 * Auto-dismiss timeout in milliseconds
 */
const AUTO_DISMISS_TIMEOUT = 5000;

/**
 * ToastProvider Component
 * 
 * Provides toast notification system with queue-based management
 * Max 3 visible toasts, auto-dismiss after 5 seconds
 * 
 * @param children - Child components that need access to toast context
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Show a toast notification
   */
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };

    setToasts((prevToasts) => {
      // Add new toast at the beginning
      const updatedToasts = [newToast, ...prevToasts];
      // Keep only max visible toasts
      return updatedToasts.slice(0, MAX_VISIBLE_TOASTS);
    });

    // Auto-dismiss after timeout
    setTimeout(() => {
      removeToast(id);
    }, AUTO_DISMISS_TIMEOUT);
  }, []);

  /**
   * Remove a toast notification
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast context
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

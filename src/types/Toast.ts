/**
 * Toast type - Defines the type of toast notification
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast interface - Represents a toast notification
 * 
 * Used in the toast queue system (max 3 visible toasts)
 * 
 * @property id - Unique identifier for the toast
 * @property message - Message to display in the toast
 * @property type - Type of toast (success, error, warning, info)
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

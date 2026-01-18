import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBoardContext } from '../hooks/useBoardContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * AddTaskDialog Props
 */
interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddTaskDialog Component
 * 
 * Portal-based modal dialog for adding new tasks
 * Includes form validation and focus management
 * 
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback to close the dialog
 */
export function AddTaskDialog({ isOpen, onClose }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useBoardContext();

  // Focus trap for modal
  useFocusTrap(isOpen, dialogRef);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure focus trap doesn't interfere
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setError('');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title cannot be empty');
      return;
    }

    // Dispatch ADD_TASK action
    dispatch({
      type: 'ADD_TASK',
      payload: { title: trimmedTitle },
    });

    // Close dialog and reset form
    onClose();
    setTitle('');
    setError('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-dialog-title"
    >
      <div
        ref={dialogRef}
        className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h2 id="add-task-dialog-title" className="text-xl font-semibold text-gray-900 mb-4">
          Add New Task
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              id="task-title"
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className={`input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task title"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'task-title-error' : undefined}
            />
            {error && (
              <p id="task-title-error" className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-4 py-2 rounded-md font-medium transition-colors"
              data-testid="add-task-cancel-button"
              aria-label="Cancel adding task"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-md font-medium transition-colors"
              data-testid="add-task-submit-button"
              aria-label="Add new task"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

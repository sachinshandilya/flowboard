import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * DeleteConfirmationDialog Props
 */
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DeleteConfirmationDialog Component
 * 
 * Portal-based confirmation dialog for task deletion
 * Shows before deleting a task
 * 
 * @param isOpen - Whether the dialog is open
 * @param taskTitle - Title of the task to delete
 * @param onConfirm - Callback when user confirms deletion
 * @param onCancel - Callback when user cancels
 */
export function DeleteConfirmationDialog({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for modal
  useFocusTrap(isOpen, dialogRef);

  // Focus cancel button when dialog opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirmation-dialog-title"
    >
      <div
        ref={dialogRef}
        className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h2 id="delete-confirmation-dialog-title" className="text-xl font-semibold text-gray-900 mb-4">
          Delete Task
        </h2>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete &quot;{taskTitle}&quot;? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="btn btn-secondary px-4 py-2 rounded-md font-medium transition-colors"
            data-testid="delete-task-cancel-button"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn px-4 py-2 rounded-md font-medium transition-colors bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
            data-testid="delete-task-confirm-button"
            aria-label={`Confirm deletion of task: ${taskTitle}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

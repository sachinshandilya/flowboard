import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ColumnType, Task } from '../types';
import { useBoardContext } from '../hooks/useBoardContext';
import { getColumnDisplayName } from '../utils/columnUtils';
import { COLUMN_TYPES } from '../types';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

/**
 * TaskMenu Props
 */
interface TaskMenuProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

/**
 * TaskMenu Component
 * 
 * Portal-based dropdown menu for task actions
 * Includes move to specific column and delete options
 * 
 * @param task - The task this menu is for
 * @param isOpen - Whether the menu is open
 * @param onClose - Callback to close the menu
 * @param buttonRef - Reference to the button that opened the menu
 */
export function TaskMenu({ task, isOpen, onClose, buttonRef }: TaskMenuProps) {
  const { dispatch } = useBoardContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Calculate menu position with smart positioning to prevent cutoff
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 200; // min-w-[200px]
      const padding = 8; // Padding from screen edge
      const viewportWidth = window.innerWidth;
      
      let left = rect.left;
      
      // Check if menu would be cut off on the right side
      if (rect.left + menuWidth + padding > viewportWidth) {
        // Position menu to the left of the button
        left = rect.right - menuWidth;
        
        // Ensure menu doesn't go off the left edge
        if (left < padding) {
          left = padding;
        }
      }
      
      setPosition({
        top: rect.bottom + 4,
        left,
      });
    }
  }, [isOpen, buttonRef]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  // Get available menu items (excluding current column)
  const availableColumns = COLUMN_TYPES.filter(col => col !== task.columnId);
  const menuItemCount = availableColumns.length + 1; // +1 for delete button

  // Handle keyboard navigation (Arrow keys, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        // Return focus to menu button
        buttonRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev === null ? 0 : Math.min(prev + 1, menuItemCount - 1);
          menuItemsRef.current[next]?.focus();
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev === null ? menuItemCount - 1 : Math.max(prev - 1, 0);
          menuItemsRef.current[next]?.focus();
          return next;
        });
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
        menuItemsRef.current[0]?.focus();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        const lastIndex = menuItemCount - 1;
        setFocusedIndex(lastIndex);
        menuItemsRef.current[lastIndex]?.focus();
        return;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first menu item when menu opens
      setTimeout(() => {
        menuItemsRef.current[0]?.focus();
        setFocusedIndex(0);
      }, 0);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        setFocusedIndex(null);
      };
    }
  }, [isOpen, onClose, buttonRef, menuItemCount]);

  const handleMoveTask = (targetColumn: ColumnType, targetOrder?: number) => {
    // If order not specified, append to end of target column
    // The reducer will calculate the proper order
    dispatch({
      type: 'MOVE_TASK',
      payload: {
        taskId: task.id,
        columnId: targetColumn,
        order: targetOrder ?? -1, // -1 means append to end
      },
    });

    onClose();
  };

  const handleDeleteClick = () => {
    onClose(); // Close menu first
    // Use setTimeout to ensure menu closes before dialog opens (prevents visual glitch)
    setTimeout(() => {
      setShowDeleteDialog(true);
    }, 0);
  };

  const handleDeleteConfirm = () => {
    dispatch({
      type: 'DELETE_TASK',
      payload: { taskId: task.id },
    });
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          role="menu"
          aria-label={`Task actions for: ${task.title}`}
        >
          {availableColumns.map((columnType, index) => (
            <button
              key={columnType}
              ref={(el) => {
                menuItemsRef.current[index] = el;
              }}
              type="button"
              onClick={() => handleMoveTask(columnType)}
              className="menu-item w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition-colors focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
              role="menuitem"
              aria-label={`Move task to ${getColumnDisplayName(columnType)}`}
              data-testid={`task-menu-move-to-${columnType}-${task.id}`}
            >
              Move to {getColumnDisplayName(columnType)}
            </button>
          ))}

          <div className="border-t border-gray-200 my-1" />

          <button
            ref={(el) => {
              menuItemsRef.current[availableColumns.length] = el;
            }}
            type="button"
            onClick={handleDeleteClick}
            className="menu-item w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-md transition-colors focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
            role="menuitem"
            aria-label={`Delete task: ${task.title}`}
            data-testid={`task-menu-delete-${task.id}`}
          >
            Delete
          </button>
        </div>,
        document.body
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        taskTitle={task.title}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}

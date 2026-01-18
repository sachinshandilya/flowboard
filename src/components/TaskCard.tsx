import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { TaskMenu } from './TaskMenu';

/**
 * TaskCard Props
 */
interface TaskCardProps {
  task: Task;
  onDragStart?: (task: Task, event: React.MouseEvent) => void;
  draggedTaskId?: string | null;
  dragOverColumnId?: string | null;
}

/**
 * TaskCard Component
 * 
 * Displays a single task card with title and 3-dot menu button
 * Includes TaskMenu for task actions
 * Supports drag-and-drop functionality
 * 
 * @param task - The task to display
 * @param onDragStart - Handler for drag start event
 * @param draggedTaskId - ID of task currently being dragged
 * @param dragOverColumnId - ID of column currently being dragged over
 */
export const TaskCard = React.memo(function TaskCard({ 
  task, 
  onDragStart,
  draggedTaskId,
  dragOverColumnId,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on menu button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (onDragStart) {
      onDragStart(task, e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard navigation for task card
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Focus menu button to open menu
      if (menuButtonRef.current) {
        menuButtonRef.current.focus();
        handleMenuToggle();
      }
    }
  };

  const isDragged = draggedTaskId === task.id;
  const isInDragOverColumn = dragOverColumnId === task.columnId && !isDragged;
  
  // Opacity: dragged task 0.3, tasks in drag-over column 0.7, others 1.0
  const opacity = isDragged ? 0.3 : isInDragOverColumn ? 0.7 : 1.0;

  return (
    <>
      <div
        data-task-id={task.id}
        className="task-card card card-hover p-3 mb-2 cursor-move transition-opacity focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
        style={{ opacity }}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Task: ${task.title}. Press Enter or Space to open menu. Drag to move.`}
        data-testid={`task-card-${task.id}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-900 flex-1 text-sm">{task.title}</span>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={handleMenuToggle}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label={`Menu for task: ${task.title}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            data-testid={`task-menu-button-${task.id}`}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
      
      <TaskMenu
        task={task}
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        buttonRef={menuButtonRef}
      />
    </>
  );
});

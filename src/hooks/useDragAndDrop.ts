import { useCallback, useRef, useEffect } from 'react';
import { ColumnType, Task } from '../types';
import { useBoardContext } from './useBoardContext';

/**
 * useDragAndDrop Hook
 * 
 * Manages drag-and-drop functionality using native mouse events
 * Handles drag start, move, and end with visual feedback
 * 
 * @returns Object with drag handlers and state
 */
export function useDragAndDrop() {
  const { state, dispatch } = useBoardContext();
  const dragStateRef = useRef<{
    draggedTask: Task | null;
    startX: number;
    startY: number;
    ghostElement: HTMLElement | null;
    rafId: number | null;
  }>({
    draggedTask: null,
    startX: 0,
    startY: 0,
    ghostElement: null,
    rafId: null,
  });

  /**
   * Calculate drop zone (column and insertion index) based on mouse position
   */
  const calculateDropZone = useCallback((clientX: number, clientY: number, draggedTaskId: string | null): {
    columnId: ColumnType | null;
    index: number | null;
  } => {
    const columns = document.querySelectorAll('[data-column-id]');
    
    for (const column of columns) {
      const rect = column.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const columnId = column.getAttribute('data-column-id') as ColumnType;
        // Get all task cards, excluding the dragged one
        const allTaskCards = column.querySelectorAll('[data-task-id]');
        const taskCards = Array.from(allTaskCards).filter(
          card => card.getAttribute('data-task-id') !== draggedTaskId
        );
        
        // Empty column (or only dragged task) - drop at index 0
        if (taskCards.length === 0) {
          return { columnId, index: 0 };
        }
        
        // Find insertion point between tasks
        let insertionIndex = 0;
        for (let i = 0; i < taskCards.length; i++) {
          const cardRect = taskCards[i].getBoundingClientRect();
          const cardCenterY = cardRect.top + cardRect.height / 2;
          
          if (clientY < cardCenterY) {
            insertionIndex = i;
            break;
          }
          insertionIndex = i + 1;
        }
        
        return { columnId, index: insertionIndex };
      }
    }
    
    return { columnId: null, index: null };
  }, []);

  /**
   * Create ghost preview element
   */
  const createGhostElement = useCallback((task: Task, mouseX: number, mouseY: number, taskRect: DOMRect): HTMLElement => {
    const ghost = document.createElement('div');
    ghost.className = 'task-card card p-3';
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.5';
    ghost.style.transform = 'scale(0.95)';
    ghost.style.zIndex = '9999';
    ghost.style.width = `${taskRect.width}px`;
    ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    ghost.style.backgroundColor = 'white';
    ghost.style.borderRadius = '8px';
    ghost.style.border = '1px solid #e5e7eb';
    
    // Create inner content matching task card structure
    const innerDiv = document.createElement('div');
    innerDiv.className = 'flex items-center justify-between gap-2';
    const span = document.createElement('span');
    span.className = 'text-gray-900 flex-1 text-sm';
    span.textContent = task.title;
    innerDiv.appendChild(span);
    ghost.appendChild(innerDiv);
    
    // Position ghost at mouse position with offset from click point
    const offsetX = mouseX - taskRect.left;
    const offsetY = mouseY - taskRect.top;
    ghost.style.left = `${mouseX - offsetX}px`;
    ghost.style.top = `${mouseY - offsetY}px`;
    
    document.body.appendChild(ghost);
    return ghost;
  }, []);

  /**
   * Handle drag start (mousedown on task card)
   */
  const handleDragStart = useCallback((task: Task, event: React.MouseEvent) => {
    // Prevent default to avoid text selection
    event.preventDefault();
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Find the task card element
    const taskCard = event.currentTarget as HTMLElement;
    const taskRect = taskCard.getBoundingClientRect();
    
    // Calculate offset from mouse click to card top-left
    const offsetX = mouseX - taskRect.left;
    const offsetY = mouseY - taskRect.top;
    
    // Create ghost element
    const ghost = createGhostElement(task, mouseX, mouseY, taskRect);
    
    // Store drag state
    dragStateRef.current = {
      draggedTask: task,
      startX: offsetX,
      startY: offsetY,
      ghostElement: ghost,
      rafId: null,
    };
    
    // Set drag state in reducer
    dispatch({
      type: 'SET_DRAG_STATE',
      payload: {
        draggedTaskId: task.id,
        dragOverColumnId: null,
        dragOverIndex: null,
      },
    });
    
    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.draggedTask || !dragStateRef.current.ghostElement) {
        return;
      }
      
      // Cancel previous RAF if exists
      if (dragStateRef.current.rafId !== null) {
        cancelAnimationFrame(dragStateRef.current.rafId);
      }
      
      // Use requestAnimationFrame for smooth updates
      dragStateRef.current.rafId = requestAnimationFrame(() => {
        const ghost = dragStateRef.current.ghostElement;
        if (ghost) {
          // Update ghost position (follow cursor with offset)
          ghost.style.left = `${e.clientX - dragStateRef.current.startX}px`;
          ghost.style.top = `${e.clientY - dragStateRef.current.startY}px`;
        }
        
        // Calculate drop zone (exclude dragged task)
        const { columnId, index } = calculateDropZone(
          e.clientX,
          e.clientY,
          dragStateRef.current.draggedTask!.id
        );
        
        // Update drag state
        dispatch({
          type: 'SET_DRAG_STATE',
          payload: {
            draggedTaskId: dragStateRef.current.draggedTask!.id,
            dragOverColumnId: columnId,
            dragOverIndex: index,
          },
        });
      });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!dragStateRef.current.draggedTask) {
        return;
      }
      
      // Calculate final drop zone
      const { columnId, index } = calculateDropZone(
        e.clientX,
        e.clientY,
        dragStateRef.current.draggedTask.id
      );
      
      // If dropped in valid zone, move task
      if (columnId !== null && index !== null && dragStateRef.current.draggedTask) {
        const task = dragStateRef.current.draggedTask;
        
        // Always dispatch MOVE_TASK - reducer will handle if position actually changed
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            taskId: task.id,
            columnId,
            order: index,
          },
        });
      }
      
      // Cleanup
      if (dragStateRef.current.ghostElement && dragStateRef.current.ghostElement.parentNode) {
        document.body.removeChild(dragStateRef.current.ghostElement);
      }
      
      if (dragStateRef.current.rafId !== null) {
        cancelAnimationFrame(dragStateRef.current.rafId);
      }
      
      // Reset drag state
      dragStateRef.current = {
        draggedTask: null,
        startX: 0,
        startY: 0,
        ghostElement: null,
        rafId: null,
      };
      
      // Reset reducer state
      dispatch({
        type: 'SET_DRAG_STATE',
        payload: {
          draggedTaskId: null,
          dragOverColumnId: null,
          dragOverIndex: null,
        },
      });
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, calculateDropZone, createGhostElement]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cleanup ghost element if component unmounts during drag
      if (dragStateRef.current.ghostElement && dragStateRef.current.ghostElement.parentNode) {
        document.body.removeChild(dragStateRef.current.ghostElement);
      }
      if (dragStateRef.current.rafId !== null) {
        cancelAnimationFrame(dragStateRef.current.rafId);
      }
    };
  }, []);

  return {
    handleDragStart,
    draggedTaskId: state.ui.draggedTaskId,
    dragOverColumnId: state.ui.dragOverColumnId,
    dragOverIndex: state.ui.dragOverIndex,
  };
}

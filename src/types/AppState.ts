import { Task } from './Task';
import { ColumnType } from './ColumnType';

/**
 * AppState interface - Global application state structure
 * 
 * Uses flat array for tasks (Task[]) with columnId field rather than nested object
 * This simplifies filtering, lookups, and drag-and-drop operations
 */
export interface AppState {
  /** Flat array of all tasks */
  tasks: Task[];
  
  /** Current filter (column type or 'all' for showing all tasks) */
  filter: ColumnType | 'all';
  
  /** UI state for drag-and-drop operations */
  ui: {
    /** ID of the task currently being dragged (null if no drag in progress) */
    draggedTaskId: string | null;
    
    /** Column ID where the drag is currently over (null if not over any column) */
    dragOverColumnId: ColumnType | null;
    
    /** Index position where the task will be inserted (null if not over a valid drop zone) */
    dragOverIndex: number | null;
  };
}

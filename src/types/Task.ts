import { ColumnType } from './ColumnType';

/**
 * Task interface - Represents a single task in the Kanban board
 * 
 * @property id - Unique identifier (timestamp string from Date.now().toString())
 * @property title - Task title (required, non-empty)
 * @property columnId - Current column where the task is located
 * @property order - Explicit order for reordering (number, not array index)
 */
export interface Task {
  id: string;
  title: string;
  columnId: ColumnType;
  order: number;
}

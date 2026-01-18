import { ColumnType } from './ColumnType';
import { Task } from './Task';

/**
 * AppAction union type - All possible actions for the reducer
 * 
 * Each action has a type discriminator and optional payload
 */
export type AppAction =
  | { type: 'ADD_TASK'; payload: { title: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; columnId: ColumnType; order: number } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'UPDATE_FILTER'; payload: { filter: ColumnType | 'all' } }
  | { type: 'SET_DRAG_STATE'; payload: { draggedTaskId: string | null; dragOverColumnId: ColumnType | null; dragOverIndex: number | null } }
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[] } }
  | { type: 'RESET_STATE' };

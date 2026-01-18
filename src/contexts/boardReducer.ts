import { AppState, AppAction } from '../types';
import { ColumnType } from '../types';

/**
 * Initial state for the board application
 */
export const initialState: AppState = {
  tasks: [],
  filter: 'all',
  ui: {
    draggedTaskId: null,
    dragOverColumnId: null,
    dragOverIndex: null,
  },
};

/**
 * Board reducer function
 * 
 * Handles all state mutations for the board application
 * Each action type updates the state accordingly
 * 
 * @param state - Current application state
 * @param action - Action to perform
 * @returns New state after applying the action
 */
export function boardReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const { title } = action.payload;
      
      // Validate title is not empty
      if (!title.trim()) {
        return state;
      }
      
      // Get max order from tasks in TODO column
      const todoTasks = state.tasks.filter(task => task.columnId === ColumnType.TODO);
      const maxOrder = todoTasks.length > 0 
        ? Math.max(...todoTasks.map(task => task.order))
        : -1;
      
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        columnId: ColumnType.TODO,
        order: maxOrder + 1,
      };
      
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'MOVE_TASK': {
      const { taskId, columnId, order } = action.payload;
      
      // Find the task being moved
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        return state;
      }
      
      const task = state.tasks[taskIndex];
      const isMovingBetweenColumns = task.columnId !== columnId;
      
      // Get all tasks except the one being moved
      let updatedTasks = state.tasks.filter(t => t.id !== taskId);
      
      // If moving between columns, reorder tasks in the source column
      if (isMovingBetweenColumns) {
        const sourceColumnTasks = updatedTasks
          .filter(t => t.columnId === task.columnId)
          .sort((a, b) => a.order - b.order)
          .map((t, index) => ({ ...t, order: index }));
        
        // Replace source column tasks with reordered ones
        updatedTasks = updatedTasks
          .filter(t => t.columnId !== task.columnId)
          .concat(sourceColumnTasks);
      }
      
      // Get tasks in the target column (excluding the moved task)
      const targetColumnTasks = updatedTasks
        .filter(t => t.columnId === columnId)
        .sort((a, b) => a.order - b.order);
      
      // Calculate the new order for the moved task
      let newOrder: number;
      if (order === -1) {
        // Append to end
        newOrder = targetColumnTasks.length > 0
          ? Math.max(...targetColumnTasks.map(t => t.order)) + 1
          : 0;
      } else {
        // Insert at specific position
        newOrder = order;
        // Shift orders of tasks that come after the insertion point
        updatedTasks = updatedTasks.map((t) => {
          if (t.columnId === columnId && t.order >= order) {
            return { ...t, order: t.order + 1 };
          }
          return t;
        });
      }
      
      // Update the moved task
      const updatedTask = {
        ...task,
        columnId,
        order: newOrder,
      };
      
      // Combine all tasks
      const allTasks = [
        ...updatedTasks.filter(t => t.columnId !== columnId),
        ...updatedTasks.filter(t => t.columnId === columnId),
        updatedTask,
      ];
      
      return {
        ...state,
        tasks: allTasks,
      };
    }

    case 'DELETE_TASK': {
      const { taskId } = action.payload;
      
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
      };
    }

    case 'UPDATE_FILTER': {
      const { filter } = action.payload;
      
      return {
        ...state,
        filter,
      };
    }

    case 'SET_DRAG_STATE': {
      const { draggedTaskId, dragOverColumnId, dragOverIndex } = action.payload;
      
      return {
        ...state,
        ui: {
          draggedTaskId,
          dragOverColumnId,
          dragOverIndex,
        },
      };
    }

    case 'LOAD_TASKS': {
      const { tasks } = action.payload;
      
      return {
        ...state,
        tasks,
      };
    }

    case 'RESET_STATE': {
      return initialState;
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = action;
      return state;
    }
  }
}

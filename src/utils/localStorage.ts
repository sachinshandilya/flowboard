import { Task, ColumnType } from '../types';

/**
 * localStorage keys
 */
const TASKS_STORAGE_KEY = 'flowboard_tasks';
const FILTER_STORAGE_KEY = 'flowboard_filter';

/**
 * Error types for localStorage operations
 */
export type LocalStorageError = 
  | 'QUOTA_EXCEEDED'
  | 'DISABLED'
  | 'CORRUPTED'
  | 'UNKNOWN';

/**
 * Result type for localStorage operations
 */
export interface LocalStorageResult<T> {
  success: boolean;
  data?: T;
  error?: LocalStorageError;
  message?: string;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save tasks to localStorage
 * 
 * @param tasks - Array of tasks to save
 * @returns Result indicating success or failure
 */
export function saveTasksToLocalStorage(tasks: Task[]): LocalStorageResult<void> {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'DISABLED',
      message: 'localStorage is not available. Your changes may be lost on refresh.',
    };
  }

  try {
    const serialized = JSON.stringify(tasks);
    localStorage.setItem(TASKS_STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: 'Storage quota exceeded. Please free up space.',
        };
      }
      if (error.name === 'SecurityError') {
        return {
          success: false,
          error: 'DISABLED',
          message: 'localStorage is disabled. Your changes may be lost on refresh.',
        };
      }
    }
    
    return {
      success: false,
      error: 'UNKNOWN',
      message: 'Failed to save data. Your changes may be lost on refresh.',
    };
  }
}

/**
 * Load tasks from localStorage
 * 
 * @returns Result with tasks or error information
 */
export function loadTasksFromLocalStorage(): LocalStorageResult<Task[]> {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'DISABLED',
      message: 'localStorage is not available. Starting with empty board.',
      data: [],
    };
  }

  try {
    const serialized = localStorage.getItem(TASKS_STORAGE_KEY);
    
    if (serialized === null) {
      // No data stored yet, return empty array
      return {
        success: true,
        data: [],
      };
    }

    const tasks = JSON.parse(serialized) as Task[];

    // Validate data structure
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid data format');
    }

    // Validate each task has required fields
    const isValid = tasks.every((task) => {
      return (
        typeof task === 'object' &&
        task !== null &&
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.columnId === 'string' &&
        typeof task.order === 'number'
      );
    });

    if (!isValid) {
      throw new Error('Invalid task data structure');
    }

    return {
      success: true,
      data: tasks,
    };
  } catch (error) {
    // Clear corrupted data
    try {
      localStorage.removeItem(TASKS_STORAGE_KEY);
    } catch {
      // Ignore errors when clearing
    }

    return {
      success: false,
      error: 'CORRUPTED',
      message: 'Failed to load saved data. Starting with empty board.',
      data: [],
    };
  }
}

/**
 * Clear all tasks from localStorage
 */
export function clearTasksFromLocalStorage(): void {
  try {
    localStorage.removeItem(TASKS_STORAGE_KEY);
  } catch {
    // Ignore errors when clearing
  }
}

/**
 * Save filter to localStorage
 * 
 * @param filter - Filter value to save
 * @returns Result indicating success or failure
 */
export function saveFilterToLocalStorage(filter: ColumnType | 'all'): LocalStorageResult<void> {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'DISABLED',
      message: 'localStorage is not available. Filter preference may be lost on refresh.',
    };
  }

  try {
    const serialized = JSON.stringify(filter);
    localStorage.setItem(FILTER_STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: 'Storage quota exceeded. Please free up space.',
        };
      }
      if (error.name === 'SecurityError') {
        return {
          success: false,
          error: 'DISABLED',
          message: 'localStorage is disabled. Filter preference may be lost on refresh.',
        };
      }
    }
    
    return {
      success: false,
      error: 'UNKNOWN',
      message: 'Failed to save filter preference.',
    };
  }
}

/**
 * Load filter from localStorage
 * 
 * @returns Result with filter or error information
 */
export function loadFilterFromLocalStorage(): LocalStorageResult<ColumnType | 'all'> {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'DISABLED',
      message: 'localStorage is not available. Using default filter.',
      data: 'all',
    };
  }

  try {
    const serialized = localStorage.getItem(FILTER_STORAGE_KEY);
    
    if (serialized === null) {
      // No filter stored yet, return default
      return {
        success: true,
        data: 'all',
      };
    }

    const filter = JSON.parse(serialized) as ColumnType | 'all';

    // Validate filter value
    const validFilters: (ColumnType | 'all')[] = ['all', ColumnType.TODO, ColumnType.IN_PROGRESS, ColumnType.DONE];
    if (!validFilters.includes(filter)) {
      throw new Error('Invalid filter value');
    }

    return {
      success: true,
      data: filter,
    };
  } catch (error) {
    // Clear corrupted data
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch {
      // Ignore errors when clearing
    }

    return {
      success: false,
      error: 'CORRUPTED',
      message: 'Failed to load filter preference. Using default filter.',
      data: 'all',
    };
  }
}

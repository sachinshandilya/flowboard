import { useEffect, useRef } from 'react';
import { AppState, AppAction } from '../types';
import { 
  saveTasksToLocalStorage, 
  loadTasksFromLocalStorage,
  saveFilterToLocalStorage,
  loadFilterFromLocalStorage,
} from '../utils/localStorage';
import { useToast } from '../contexts/ToastContext';

/**
 * Debounce delay in milliseconds
 */
const DEBOUNCE_DELAY = 300;

/**
 * useLocalStorageSync Hook
 * 
 * Handles localStorage synchronization with debounced writes
 * Immediate writes for critical operations (delete, move)
 * Loads tasks from localStorage on mount
 * Shows error toasts on localStorage failures
 * 
 * @param state - Current application state
 * @param dispatch - Dispatch function for reducer actions
 */
export function useLocalStorageSync(state: AppState, dispatch: React.Dispatch<AppAction>) {
  const { showToast } = useToast();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousTasksRef = useRef(state.tasks);
  const previousFilterRef = useRef(state.filter);
  const isInitialMountRef = useRef(true);

  /**
   * Load tasks and filter from localStorage on mount
   */
  useEffect(() => {
    const loadData = () => {
      // Load tasks
      const tasksResult = loadTasksFromLocalStorage();
      
      if (tasksResult.success && tasksResult.data) {
        if (tasksResult.data.length > 0) {
          dispatch({
            type: 'LOAD_TASKS',
            payload: { tasks: tasksResult.data },
          });
        }
      } else if (tasksResult.error && tasksResult.message) {
        // Show error toast on load failure
        showToast(tasksResult.message, 'error');
      }

      // Load filter
      const filterResult = loadFilterFromLocalStorage();
      
      if (filterResult.success && filterResult.data) {
        dispatch({
          type: 'UPDATE_FILTER',
          payload: { filter: filterResult.data },
        });
      } else if (filterResult.error && filterResult.message && filterResult.error !== 'DISABLED') {
        // Only show error toast if it's not just localStorage being disabled
        // (we already show error for tasks, don't spam)
      }
    };

    loadData();
    isInitialMountRef.current = false;
  }, [dispatch, showToast]);

  /**
   * Sync tasks to localStorage on state changes
   */
  useEffect(() => {
    // Skip on initial mount (tasks are loaded separately)
    if (isInitialMountRef.current) {
      previousTasksRef.current = state.tasks;
      return;
    }

    // Check if tasks actually changed
    const prevTasks = previousTasksRef.current;
    const currentTasks = state.tasks;

    // Simple check: compare lengths and task IDs
    const tasksChanged = 
      prevTasks.length !== currentTasks.length ||
      prevTasks.some((prevTask) => {
        const currentTask = currentTasks.find(t => t.id === prevTask.id);
        if (!currentTask) return true; // Task was deleted
        return (
          prevTask.columnId !== currentTask.columnId ||
          prevTask.order !== currentTask.order ||
          prevTask.title !== currentTask.title
        );
      }) ||
      currentTasks.some((currentTask) => {
        return !prevTasks.find(t => t.id === currentTask.id);
      });

    if (!tasksChanged) {
      return;
    }

    // Detect critical operations
    const wasDeleteOperation = prevTasks.length > currentTasks.length;
    const wasMoveOperation = 
      prevTasks.length === currentTasks.length &&
      prevTasks.some((prevTask) => {
        const currentTask = currentTasks.find(t => t.id === prevTask.id);
        return currentTask && currentTask.columnId !== prevTask.columnId;
      });

    const isCriticalOperation = wasDeleteOperation || wasMoveOperation;

    // Update previous tasks reference
    previousTasksRef.current = state.tasks;

    /**
     * Save tasks to localStorage
     */
    const saveTasks = () => {
      const result = saveTasksToLocalStorage(state.tasks);
      
      if (!result.success && result.message) {
        showToast(result.message, 'error');
      }
    };

    if (isCriticalOperation) {
      // Immediate write for critical operations
      // Clear any pending debounced write
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      saveTasks();
    } else {
      // Debounced write for non-critical operations
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        saveTasks();
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.tasks, showToast]);

  /**
   * Sync filter to localStorage on filter changes
   */
  useEffect(() => {
    // Skip on initial mount (filter is loaded separately)
    if (isInitialMountRef.current) {
      previousFilterRef.current = state.filter;
      return;
    }

    // Check if filter actually changed
    if (previousFilterRef.current === state.filter) {
      return;
    }

    // Update previous filter reference
    previousFilterRef.current = state.filter;

    /**
     * Save filter to localStorage
     */
    const saveFilter = () => {
      const result = saveFilterToLocalStorage(state.filter);
      
      if (!result.success && result.message) {
        // Don't show toast for filter save failures (less critical than tasks)
        // Just log for debugging
        console.warn('Failed to save filter:', result.message);
      }
    };

    // Debounced write for filter (not critical, can be debounced)
    // Clear previous timer
    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }
    
    // Set new timer
    filterDebounceTimerRef.current = setTimeout(() => {
      saveFilter();
      filterDebounceTimerRef.current = null;
    }, DEBOUNCE_DELAY);

    // Cleanup on unmount
    return () => {
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }
    };
  }, [state.filter, showToast]);
}

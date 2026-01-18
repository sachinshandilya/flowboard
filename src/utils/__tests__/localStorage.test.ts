import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTasksToLocalStorage,
  loadTasksFromLocalStorage,
  saveFilterToLocalStorage,
  loadFilterFromLocalStorage,
  clearTasksFromLocalStorage,
  LocalStorageError,
} from '../localStorage';
import { Task, ColumnType } from '../../types';

describe('localStorage Utilities', () => {
  // Store original methods
  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Restore all Storage prototype methods to their original state
    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.removeItem = originalRemoveItem;
  });

  describe('saveTasksToLocalStorage', () => {
    it('should save tasks successfully', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 },
        { id: '2', title: 'Task 2', columnId: ColumnType.IN_PROGRESS, order: 0 },
      ];

      const result = saveTasksToLocalStorage(tasks);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('flowboard_tasks')).toBeTruthy();
    });

    it('should handle quota exceeded error', () => {
      // Mock localStorage to throw QuotaExceededError only for the actual key
      
      // Mock setItem to throw QuotaExceededError only for flowboard_tasks
      // Allow isLocalStorageAvailable test to succeed
      Storage.prototype.setItem = vi.fn((key: string, value: string) => {
        if (key === 'flowboard_tasks') {
          const error = Object.create(DOMException.prototype);
          Object.defineProperty(error, 'name', { value: 'QuotaExceededError', writable: false });
          Object.defineProperty(error, 'message', { value: 'Quota exceeded', writable: false });
          throw error;
        }
        return originalSetItem.call(localStorage, key, value);
      });
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_tasks') return null;
        return originalGetItem.call(localStorage, key);
      });
      Storage.prototype.removeItem = vi.fn((key: string) => {
        return originalRemoveItem.call(localStorage, key);
      });

      const tasks: Task[] = [{ id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 }];
      const result = saveTasksToLocalStorage(tasks);

      expect(result.success).toBe(false);
      expect(result.error).toBe('QUOTA_EXCEEDED');
      expect(result.message).toContain('quota exceeded');
    });

    it('should handle disabled localStorage', () => {
      // Mock localStorage to be unavailable - make setItem throw for test key
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage is disabled');
      });

      const tasks: Task[] = [{ id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 }];
      const result = saveTasksToLocalStorage(tasks);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DISABLED');
    });
  });

  describe('loadTasksFromLocalStorage', () => {
    it('should load tasks successfully', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 },
      ];
      localStorage.setItem('flowboard_tasks', JSON.stringify(tasks));

      const result = loadTasksFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(tasks);
    });

    it('should return empty array when no data exists', () => {
      // Ensure localStorage is available and returns null for the key
      localStorage.removeItem('flowboard_tasks');
      
      const result = loadTasksFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle corrupted data', () => {
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_tasks') return 'invalid json';
        return originalGetItem.call(localStorage, key);
      });

      const result = loadTasksFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('CORRUPTED');
      expect(result.data).toEqual([]);
    });

    it('should handle invalid data structure', () => {
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_tasks') return JSON.stringify({ not: 'an array' });
        return originalGetItem.call(localStorage, key);
      });

      const result = loadTasksFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('CORRUPTED');
      expect(result.data).toEqual([]);
    });

    it('should handle tasks with missing required fields', () => {
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_tasks') return JSON.stringify([
          { id: '1', title: 'Task 1' }, // Missing columnId and order
        ]);
        return originalGetItem.call(localStorage, key);
      });

      const result = loadTasksFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('CORRUPTED');
    });
  });

  describe('saveFilterToLocalStorage', () => {
    it('should save filter successfully', () => {
      const result = saveFilterToLocalStorage(ColumnType.IN_PROGRESS);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('flowboard_filter')).toBe(JSON.stringify(ColumnType.IN_PROGRESS));
    });

    it('should handle quota exceeded error', () => {
      // Mock setItem to throw QuotaExceededError only for flowboard_filter
      // Allow isLocalStorageAvailable test to succeed
      Storage.prototype.setItem = vi.fn((key: string, value: string) => {
        if (key === 'flowboard_filter') {
          const error = Object.create(DOMException.prototype);
          Object.defineProperty(error, 'name', { value: 'QuotaExceededError', writable: false });
          Object.defineProperty(error, 'message', { value: 'Quota exceeded', writable: false });
          throw error;
        }
        return originalSetItem.call(localStorage, key, value);
      });
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_filter') return null;
        return originalGetItem.call(localStorage, key);
      });
      Storage.prototype.removeItem = vi.fn((key: string) => {
        return originalRemoveItem.call(localStorage, key);
      });

      const result = saveFilterToLocalStorage('all');

      expect(result.success).toBe(false);
      expect(result.error).toBe('QUOTA_EXCEEDED');
    });
  });

  describe('loadFilterFromLocalStorage', () => {
    it('should load filter successfully', () => {
      localStorage.setItem('flowboard_filter', JSON.stringify(ColumnType.DONE));

      const result = loadFilterFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toBe(ColumnType.DONE);
    });

    it('should return default "all" when no data exists', () => {
      // Ensure localStorage is available and returns null for the key
      localStorage.removeItem('flowboard_filter');
      
      const result = loadFilterFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toBe('all');
    });

    it('should handle invalid filter value', () => {
      Storage.prototype.getItem = vi.fn((key: string) => {
        if (key === 'flowboard_filter') return JSON.stringify('invalid');
        return originalGetItem.call(localStorage, key);
      });

      const result = loadFilterFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('CORRUPTED');
      expect(result.data).toBe('all');
    });
  });

  describe('clearTasksFromLocalStorage', () => {
    it('should clear tasks from localStorage', () => {
      localStorage.setItem('flowboard_tasks', JSON.stringify([
        { id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 },
      ]));

      clearTasksFromLocalStorage();

      expect(localStorage.getItem('flowboard_tasks')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error('Cannot remove');
      });

      // Should not throw
      expect(() => clearTasksFromLocalStorage()).not.toThrow();
    });
  });
});

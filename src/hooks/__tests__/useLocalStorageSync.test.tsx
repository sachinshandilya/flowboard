import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BoardProvider } from '../../contexts/BoardContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { useBoardContext } from '../useBoardContext';
import { ColumnType } from '../../types';
import React from 'react';

// Mock localStorage functions
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorageSync Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      <BoardProvider>{children}</BoardProvider>
    </ToastProvider>
  );

  it('should load tasks from localStorage on mount', () => {
    const tasks = [
      { id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 },
    ];
    localStorage.setItem('flowboard_tasks', JSON.stringify(tasks));

    const { result } = renderHook(() => useBoardContext(), { wrapper });

    expect(result.current.state.tasks).toHaveLength(1);
    expect(result.current.state.tasks[0].title).toBe('Task 1');
  });

  it('should load filter from localStorage on mount', () => {
    localStorage.setItem('flowboard_filter', JSON.stringify(ColumnType.IN_PROGRESS));

    const { result } = renderHook(() => useBoardContext(), { wrapper });

    expect(result.current.state.filter).toBe(ColumnType.IN_PROGRESS);
  });

  it('should save tasks to localStorage when tasks change', async () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'New Task' },
      });
    });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const savedTasks = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
    expect(savedTasks).toHaveLength(1);
    expect(savedTasks[0].title).toBe('New Task');
  });

  it('should save filter to localStorage when filter changes', async () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_FILTER',
        payload: { filter: ColumnType.DONE },
      });
    });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const savedFilter = JSON.parse(localStorage.getItem('flowboard_filter') || 'null');
    expect(savedFilter).toBe(ColumnType.DONE);
  });

  it('should immediately save on delete operation', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper });

    // Add a task first
    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task to Delete' },
      });
    });

    const taskId = result.current.state.tasks[0].id;

    // Delete task (should save immediately)
    act(() => {
      result.current.dispatch({
        type: 'DELETE_TASK',
        payload: { taskId },
      });
    });

    // Should save immediately without waiting for debounce
    const savedTasks = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
    expect(savedTasks).toHaveLength(0);
  });

  it('should immediately save on move operation', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper });

    // Add a task first
    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task to Move' },
      });
    });

    const taskId = result.current.state.tasks[0].id;

    // Move task (should save immediately)
    act(() => {
      result.current.dispatch({
        type: 'MOVE_TASK',
        payload: {
          taskId,
          columnId: ColumnType.IN_PROGRESS,
          order: 0,
        },
      });
    });

    // Should save immediately without waiting for debounce
    const savedTasks = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
    expect(savedTasks).toHaveLength(1);
    expect(savedTasks[0].columnId).toBe(ColumnType.IN_PROGRESS);
  });

  it('should debounce non-critical operations', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task 1' },
      });
    });

    // Should not save immediately
    let savedTasks = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
    expect(savedTasks).toHaveLength(0);

    // After debounce delay, should save
    act(() => {
      vi.advanceTimersByTime(300);
    });

    savedTasks = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
    expect(savedTasks).toHaveLength(1);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useBoardContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task' },
      });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should not crash, state should still be updated
    expect(result.current.state.tasks).toHaveLength(1);

    localStorage.setItem = originalSetItem;
  });
});

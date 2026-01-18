import { describe, it, expect } from 'vitest';
import { boardReducer, initialState } from '../boardReducer';
import { ColumnType } from '../../types';
import { AppAction } from '../../types';

describe('boardReducer', () => {
  describe('ADD_TASK', () => {
    it('should add a new task to TODO column', () => {
      const action: AppAction = {
        type: 'ADD_TASK',
        payload: { title: 'New Task' },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.tasks).toHaveLength(1);
      expect(newState.tasks[0].title).toBe('New Task');
      expect(newState.tasks[0].columnId).toBe(ColumnType.TODO);
      expect(newState.tasks[0].order).toBe(0);
    });

    it('should not add task with empty title', () => {
      const action: AppAction = {
        type: 'ADD_TASK',
        payload: { title: '   ' },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.tasks).toHaveLength(0);
    });

    it('should trim task title', () => {
      const action: AppAction = {
        type: 'ADD_TASK',
        payload: { title: '  Trimmed Task  ' },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.tasks[0].title).toBe('Trimmed Task');
    });

    it('should assign correct order for multiple tasks', () => {
      let state = initialState;
      
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 2' } });
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 3' } });

      expect(state.tasks).toHaveLength(3);
      expect(state.tasks[0].order).toBe(0);
      expect(state.tasks[1].order).toBe(1);
      expect(state.tasks[2].order).toBe(2);
    });
  });

  describe('MOVE_TASK', () => {
    it('should move task between columns', () => {
      let state = initialState;
      
      // Add a task
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });
      const taskId = state.tasks[0].id;

      // Move to IN_PROGRESS
      state = boardReducer(state, {
        type: 'MOVE_TASK',
        payload: { taskId, columnId: ColumnType.IN_PROGRESS, order: 0 },
      });

      expect(state.tasks[0].columnId).toBe(ColumnType.IN_PROGRESS);
    });

    it('should reorder tasks within same column', () => {
      let state = initialState;
      
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 2' } });
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 3' } });

      const task2Id = state.tasks[1].id;

      // Move Task 2 to position 0
      state = boardReducer(state, {
        type: 'MOVE_TASK',
        payload: { taskId: task2Id, columnId: ColumnType.TODO, order: 0 },
      });

      const todoTasks = state.tasks.filter(t => t.columnId === ColumnType.TODO);
      expect(todoTasks[0].id).toBe(task2Id);
    });

    it('should append task to end when order is -1', () => {
      let state = initialState;
      
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });
      const taskId = state.tasks[0].id;

      state = boardReducer(state, {
        type: 'MOVE_TASK',
        payload: { taskId, columnId: ColumnType.DONE, order: -1 },
      });

      expect(state.tasks[0].columnId).toBe(ColumnType.DONE);
      expect(state.tasks[0].order).toBe(0);
    });

    it('should not move task if taskId not found', () => {
      let state = initialState;
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });

      const originalTasks = [...state.tasks];

      state = boardReducer(state, {
        type: 'MOVE_TASK',
        payload: { taskId: 'non-existent', columnId: ColumnType.IN_PROGRESS, order: 0 },
      });

      expect(state.tasks).toEqual(originalTasks);
    });
  });

  describe('UPDATE_FILTER', () => {
    it('should update filter', () => {
      const action: AppAction = {
        type: 'UPDATE_FILTER',
        payload: { filter: ColumnType.IN_PROGRESS },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.filter).toBe(ColumnType.IN_PROGRESS);
    });
  });

  describe('SET_DRAG_STATE', () => {
    it('should update drag state', () => {
      const action: AppAction = {
        type: 'SET_DRAG_STATE',
        payload: {
          draggedTaskId: 'task-1',
          dragOverColumnId: ColumnType.IN_PROGRESS,
          dragOverIndex: 0,
        },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.ui.draggedTaskId).toBe('task-1');
      expect(newState.ui.dragOverColumnId).toBe(ColumnType.IN_PROGRESS);
      expect(newState.ui.dragOverIndex).toBe(0);
    });
  });

  describe('LOAD_TASKS', () => {
    it('should load tasks', () => {
      const tasks = [
        { id: '1', title: 'Task 1', columnId: ColumnType.TODO, order: 0 },
        { id: '2', title: 'Task 2', columnId: ColumnType.IN_PROGRESS, order: 0 },
      ];

      const action: AppAction = {
        type: 'LOAD_TASKS',
        payload: { tasks },
      };

      const newState = boardReducer(initialState, action);

      expect(newState.tasks).toEqual(tasks);
    });
  });

  describe('RESET_STATE', () => {
    it('should reset state to initial', () => {
      let state = initialState;
      state = boardReducer(state, { type: 'ADD_TASK', payload: { title: 'Task 1' } });
      state = boardReducer(state, { type: 'UPDATE_FILTER', payload: { filter: ColumnType.TODO } });

      const action: AppAction = {
        type: 'RESET_STATE',
      };

      const newState = boardReducer(state, action);

      expect(newState.tasks).toHaveLength(0);
      expect(newState.filter).toBe('all');
      expect(newState.ui.draggedTaskId).toBeNull();
    });
  });
});

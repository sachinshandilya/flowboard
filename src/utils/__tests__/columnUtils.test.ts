import { describe, it, expect } from 'vitest';
import { getPreviousColumn, getNextColumn, getColumnDisplayName } from '../columnUtils';
import { ColumnType } from '../../types';

describe('columnUtils', () => {
  describe('getPreviousColumn', () => {
    it('should return null for TODO column', () => {
      expect(getPreviousColumn(ColumnType.TODO)).toBeNull();
    });

    it('should return TODO for IN_PROGRESS column', () => {
      expect(getPreviousColumn(ColumnType.IN_PROGRESS)).toBe(ColumnType.TODO);
    });

    it('should return IN_PROGRESS for DONE column', () => {
      expect(getPreviousColumn(ColumnType.DONE)).toBe(ColumnType.IN_PROGRESS);
    });
  });

  describe('getNextColumn', () => {
    it('should return IN_PROGRESS for TODO column', () => {
      expect(getNextColumn(ColumnType.TODO)).toBe(ColumnType.IN_PROGRESS);
    });

    it('should return DONE for IN_PROGRESS column', () => {
      expect(getNextColumn(ColumnType.IN_PROGRESS)).toBe(ColumnType.DONE);
    });

    it('should return null for DONE column', () => {
      expect(getNextColumn(ColumnType.DONE)).toBeNull();
    });
  });

  describe('getColumnDisplayName', () => {
    it('should return "To Do" for TODO column', () => {
      expect(getColumnDisplayName(ColumnType.TODO)).toBe('To Do');
    });

    it('should return "In Progress" for IN_PROGRESS column', () => {
      expect(getColumnDisplayName(ColumnType.IN_PROGRESS)).toBe('In Progress');
    });

    it('should return "Done" for DONE column', () => {
      expect(getColumnDisplayName(ColumnType.DONE)).toBe('Done');
    });

    it('should return empty string for unknown column type', () => {
      // TypeScript won't allow this, but testing runtime behavior
      expect(getColumnDisplayName('unknown' as ColumnType)).toBe('');
    });
  });
});

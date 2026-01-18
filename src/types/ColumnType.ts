/**
 * ColumnType enum - Defines the three fixed columns in the Kanban board
 */
export enum ColumnType {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

/**
 * COLUMN_TYPES - Single source of truth for column definitions
 * Used for mapping columns and maintaining consistency
 */
export const COLUMN_TYPES: ColumnType[] = [
  ColumnType.TODO,
  ColumnType.IN_PROGRESS,
  ColumnType.DONE,
];

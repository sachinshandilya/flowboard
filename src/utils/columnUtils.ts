import { ColumnType, COLUMN_TYPES } from '../types';

/**
 * Get the previous column type
 * 
 * @param currentColumn - Current column type
 * @returns Previous column type or null if already at first column
 */
export function getPreviousColumn(currentColumn: ColumnType): ColumnType | null {
  const currentIndex = COLUMN_TYPES.indexOf(currentColumn);
  if (currentIndex <= 0) {
    return null;
  }
  return COLUMN_TYPES[currentIndex - 1];
}

/**
 * Get the next column type
 * 
 * @param currentColumn - Current column type
 * @returns Next column type or null if already at last column
 */
export function getNextColumn(currentColumn: ColumnType): ColumnType | null {
  const currentIndex = COLUMN_TYPES.indexOf(currentColumn);
  if (currentIndex >= COLUMN_TYPES.length - 1) {
    return null;
  }
  return COLUMN_TYPES[currentIndex + 1];
}

/**
 * Get the display name for a column type
 * 
 * @param columnType - Column type
 * @returns Display name
 */
export function getColumnDisplayName(columnType: ColumnType): string {
  switch (columnType) {
    case ColumnType.TODO:
      return 'To Do';
    case ColumnType.IN_PROGRESS:
      return 'In Progress';
    case ColumnType.DONE:
      return 'Done';
    default:
      return '';
  }
}

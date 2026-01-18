import React from 'react';
import { ColumnType } from '../types';

/**
 * ColumnHeader Props
 */
interface ColumnHeaderProps {
  columnType: ColumnType;
}

/**
 * ColumnHeader Component
 * 
 * Displays the header for a column with the column name
 * 
 * @param columnType - The type of column (TODO, IN_PROGRESS, DONE)
 */
export function ColumnHeader({ columnType }: ColumnHeaderProps) {
  const getColumnTitle = (type: ColumnType): string => {
    switch (type) {
      case ColumnType.TODO:
        return 'To Do';
      case ColumnType.IN_PROGRESS:
        return 'In Progress';
      case ColumnType.DONE:
        return 'Done';
      default:
        return '';
    }
  };

  return (
    <h2 className="column-header text-lg font-semibold text-gray-800 mb-4" id={`column-header-${columnType}`}>
      {getColumnTitle(columnType)}
    </h2>
  );
}

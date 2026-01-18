import React, { useMemo } from 'react';
import { COLUMN_TYPES, ColumnType } from '../types';
import { useBoardContext } from '../hooks/useBoardContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Column } from './Column';
import { FilterDropdown } from './FilterDropdown';

/**
 * Board Component
 * 
 * Main container component that displays the Kanban board
 * Renders three columns (To Do, In Progress, Done) with equal width (33% each)
 * Integrates drag-and-drop functionality and column filtering
 */
export function Board() {
  const { state, dispatch } = useBoardContext();
  const { tasks, filter } = state;
  
  const {
    handleDragStart,
    draggedTaskId,
    dragOverColumnId,
    dragOverIndex,
  } = useDragAndDrop();

  // Filter tasks based on selected filter using useMemo for performance
  const filteredTasks = useMemo(() => {
    if (filter === 'all') {
      return tasks;
    }
    // When a specific column is selected, only show tasks from that column
    return tasks.filter(task => task.columnId === filter);
  }, [tasks, filter]);

  // Filter columns to show based on selected filter
  const visibleColumns = useMemo(() => {
    if (filter === 'all') {
      return COLUMN_TYPES;
    }
    // When a specific column is selected, only show that column
    return [filter];
  }, [filter]);

  const handleFilterChange = (newFilter: ColumnType | 'all') => {
    dispatch({
      type: 'UPDATE_FILTER',
      payload: { filter: newFilter },
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8" role="main" aria-label="FlowBoard Kanban board">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">FlowBoard</h1>
          <FilterDropdown
            currentFilter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        <div className="flex gap-4 h-[calc(100vh-200px)]" role="group" aria-label="Task columns">
          {visibleColumns.map(columnType => (
            <div
              key={columnType}
              className="column-width flex-shrink-0"
              style={{ width: filter === 'all' ? '33.333333%' : '100%' }}
            >
              <Column
                columnType={columnType}
                tasks={filteredTasks}
                onDragStart={handleDragStart}
                draggedTaskId={draggedTaskId}
                dragOverColumnId={dragOverColumnId}
                dragOverIndex={dragOverIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

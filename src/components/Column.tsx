import React, { useMemo, useState } from 'react';
import { ColumnType, Task } from '../types';
import { ColumnHeader } from './ColumnHeader';
import { TaskCard } from './TaskCard';
import { AddTaskDialog } from './AddTaskDialog';

/**
 * Column Props
 */
interface ColumnProps {
  columnType: ColumnType;
  tasks: Task[];
  onDragStart?: (task: Task, event: React.MouseEvent) => void;
  draggedTaskId?: string | null;
  dragOverColumnId?: ColumnType | null;
  dragOverIndex?: number | null;
}

/**
 * Column Component
 * 
 * Displays a column with header and task cards
 * Tasks are filtered by columnId and sorted by order
 * Shows Add Task button only in TODO column
 * Supports drag-and-drop with visual feedback
 * 
 * @param columnType - The type of column (TODO, IN_PROGRESS, DONE)
 * @param tasks - Array of all tasks (will be filtered by columnId)
 * @param onDragStart - Handler for drag start event
 * @param draggedTaskId - ID of task currently being dragged
 * @param dragOverColumnId - ID of column currently being dragged over
 * @param dragOverIndex - Index where task will be inserted
 */
export const Column = React.memo(function Column({ 
  columnType, 
  tasks,
  onDragStart,
  draggedTaskId,
  dragOverColumnId,
  dragOverIndex,
}: ColumnProps) {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Filter and sort tasks for this column
  const columnTasks = useMemo(() => {
    return tasks
      .filter(task => task.columnId === columnType)
      .sort((a, b) => a.order - b.order);
  }, [tasks, columnType]);

  const isTodoColumn = columnType === ColumnType.TODO;
  const isDragOver = dragOverColumnId === columnType;
  const isEmpty = columnTasks.length === 0;
  
  // Show drop zone indicator for empty columns
  const showEmptyDropZone = isEmpty && isDragOver && draggedTaskId !== null;

  return (
    <>
      <div
        data-column-id={columnType}
        className={`column flex flex-col h-full bg-gray-50 rounded-lg border-2 p-4 transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200'
        }`}
        role="region"
        aria-labelledby={`column-header-${columnType}`}
        aria-label={`${columnType} column with ${columnTasks.length} ${columnTasks.length === 1 ? 'task' : 'tasks'}`}
      >
        <ColumnHeader columnType={columnType} />
        
        {isTodoColumn && (
          <button
            type="button"
            onClick={() => setIsAddTaskDialogOpen(true)}
            className="btn btn-primary mb-4 w-full px-4 py-2 rounded-md font-medium transition-colors"
            data-testid="add-task-button"
            aria-label="Add new task"
          >
            + Add Task
          </button>
        )}

        <div className="column-content flex-1 overflow-y-auto relative">
          {showEmptyDropZone ? (
            <div className="empty-drop-zone flex-center flex-col py-8 border-2 border-dashed border-blue-400 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Drop here</p>
            </div>
          ) : isEmpty ? (
            <div className="empty-state flex-center flex-col py-8 text-gray-400">
              <p className="text-sm">No tasks</p>
            </div>
          ) : (
            <>
              {/* Insertion indicator at top */}
              {isDragOver && dragOverIndex === 0 && (
                <div className="insertion-indicator h-0.5 bg-blue-500 mb-2 rounded" />
              )}
              
              {columnTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <TaskCard
                    task={task}
                    onDragStart={onDragStart}
                    draggedTaskId={draggedTaskId}
                    dragOverColumnId={dragOverColumnId}
                  />
                  
                  {/* Insertion indicator after this task */}
                  {isDragOver && dragOverIndex === index + 1 && (
                    <div className="insertion-indicator h-0.5 bg-blue-500 my-2 rounded" />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      {isTodoColumn && (
        <AddTaskDialog
          isOpen={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
        />
      )}
    </>
  );
});

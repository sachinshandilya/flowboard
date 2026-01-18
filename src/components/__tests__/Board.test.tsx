import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Board } from '../Board';
import { ColumnType } from '../../types';

describe('Board Component - Task CRUD Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render board with three columns', () => {
    render(<Board />);
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should add a new task to To Do column', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Click Add Task button
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);

    // Fill in task title
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'New Task');

    // Submit form
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    // Verify task appears in To Do column
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('should not add task with empty title', async () => {
    const user = userEvent.setup();
    render(<Board />);

    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/task title cannot be empty/i)).toBeInTheDocument();
    });

    // Dialog should still be open
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
  });

  it('should delete a task', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task first
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task to Delete');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    // Open menu for the task
    const taskCard = screen.getByText('Task to Delete').closest('[data-testid^="task-card-"]');
    const taskId = taskCard?.getAttribute('data-testid')?.replace('task-card-', '') || '';
    const menuButton = screen.getByTestId(`task-menu-button-${taskId}`);
    await user.click(menuButton);

    // Click delete
    const deleteButton = screen.getByTestId(`task-menu-delete-${taskId}`);
    await user.click(deleteButton);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByTestId('delete-task-confirm-button')).toBeInTheDocument();
    });
    const confirmButton = screen.getByTestId('delete-task-confirm-button');
    await user.click(confirmButton);

    // Verify task is deleted
    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  it('should move task to different column via menu', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task to Move');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Move')).toBeInTheDocument();
    });

    // Find task card and open menu
    const taskCard = screen.getByText('Task to Move').closest('[data-testid^="task-card-"]');
    const taskId = taskCard?.getAttribute('data-testid')?.replace('task-card-', '') || '';
    const menuButton = screen.getByTestId(`task-menu-button-${taskId}`);
    await user.click(menuButton);

    // Move to In Progress
    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${taskId}`)).toBeInTheDocument();
    });
    const moveButton = screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${taskId}`);
    await user.click(moveButton);

    // Verify task is in In Progress column
    await waitFor(() => {
      const inProgressColumn = screen.getByText('In Progress').closest('[role="region"]');
      expect(inProgressColumn).toHaveTextContent('Task to Move');
    });
  });

  it('should cancel task deletion', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task to Keep');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Keep')).toBeInTheDocument();
    });

    // Open menu and click delete
    const taskCard = screen.getByText('Task to Keep').closest('[data-testid^="task-card-"]');
    const taskId = taskCard?.getAttribute('data-testid')?.replace('task-card-', '') || '';
    const menuButton = screen.getByTestId(`task-menu-button-${taskId}`);
    await user.click(menuButton);

    const deleteButton = screen.getByTestId(`task-menu-delete-${taskId}`);
    await user.click(deleteButton);

    // Cancel deletion
    await waitFor(() => {
      expect(screen.getByTestId('delete-task-cancel-button')).toBeInTheDocument();
    });
    const cancelButton = screen.getByTestId('delete-task-cancel-button');
    await user.click(cancelButton);

    // Verify task still exists
    await waitFor(() => {
      expect(screen.getByText('Task to Keep')).toBeInTheDocument();
    });
  });
});

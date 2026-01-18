import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';

describe('DeleteConfirmationDialog Component', () => {
  const mockTaskTitle = 'Test Task';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should not render when closed', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={false}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when open', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
    const message = screen.getByText(/Are you sure you want to delete/i);
    expect(message).toBeInTheDocument();
    // Check for task title (quotes are escaped in JSX, text may be split)
    expect(message.textContent).toContain(mockTaskTitle);
  });

  it('should have correct ARIA attributes', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirmation-dialog-title');
  });

  it('should call onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const deleteButton = screen.getByTestId('delete-task-confirm-button');
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByTestId('delete-task-cancel-button');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should close dialog on Escape key', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should close dialog on backdrop click', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog when clicking inside dialog content', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    const dialogContent = screen.getByText(/Are you sure/i);
    await user.click(dialogContent);

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should focus cancel button when dialog opens', async () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() => {
      const cancelButton = screen.getByTestId('delete-task-cancel-button');
      expect(cancelButton).toHaveFocus();
    });
  });

  it('should have correct ARIA labels on buttons', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={mockTaskTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const cancelButton = screen.getByTestId('delete-task-cancel-button');
    expect(cancelButton).toHaveAttribute('aria-label', 'Cancel deletion');

    const confirmButton = screen.getByTestId('delete-task-confirm-button');
    expect(confirmButton).toHaveAttribute('aria-label', `Confirm deletion of task: ${mockTaskTitle}`);
  });

  it('should handle task title with special characters', () => {
    const specialTitle = 'Task with "quotes" & <tags>';
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        taskTitle={specialTitle}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Check for task title (quotes and tags are escaped in JSX, text may be split)
    const message = screen.getByText(/Are you sure you want to delete/i);
    expect(message.textContent).toContain('Task with "quotes"');
    expect(message.textContent).toContain('<tags>');
  });
});

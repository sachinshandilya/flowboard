import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { AddTaskDialog } from '../AddTaskDialog';

describe('AddTaskDialog Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not render when closed', () => {
    render(<AddTaskDialog isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when open', () => {
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'add-task-dialog-title');
  });

  it('should focus input when dialog opens', async () => {
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);
    
    await waitFor(() => {
      const input = screen.getByLabelText(/task title/i);
      expect(input).toHaveFocus();
    });
  });

  it('should add task when form is submitted with valid title', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'New Task');

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    // Dialog should close via onClose callback
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show error when submitting empty title', async () => {
    const user = userEvent.setup();
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/task title cannot be empty/i)).toBeInTheDocument();
    });

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show error when submitting whitespace-only title', async () => {
    const user = userEvent.setup();
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByLabelText(/task title/i);
    await user.type(input, '   ');

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/task title cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('should trim task title before submission', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const input = screen.getByLabelText(/task title/i);
    await user.type(input, '  Trimmed Task  ');

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should close dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const cancelButton = screen.getByTestId('add-task-cancel-button');
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close dialog on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('should close dialog on backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not close dialog when clicking inside dialog content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const input = screen.getByLabelText(/task title/i);
    await user.click(input);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    // Submit empty form to show error
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/task title cannot be empty/i)).toBeInTheDocument();
    });

    // Start typing
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'New');

    // Error should be cleared
    expect(screen.queryByText(/task title cannot be empty/i)).not.toBeInTheDocument();
  });

  it('should reset form when dialog closes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Test Task');

    // Close dialog
    rerender(<AddTaskDialog isOpen={false} onClose={vi.fn()} />);

    // Reopen dialog
    rerender(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const newInput = screen.getByLabelText(/task title/i);
    expect(newInput).toHaveValue('');
  });

  it('should have correct ARIA attributes on input', () => {
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByLabelText(/task title/i);
    expect(input).toHaveAttribute('id', 'task-title');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('should set aria-invalid when error exists', async () => {
    const user = userEvent.setup();
    render(<AddTaskDialog isOpen={true} onClose={vi.fn()} />);

    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const input = screen.getByLabelText(/task title/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'task-title-error');
    });
  });

  it('should submit form on Enter key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddTaskDialog isOpen={true} onClose={onClose} />);

    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'New Task{Enter}');

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TaskMenu } from '../TaskMenu';
import { Task, ColumnType } from '../../types';

describe('TaskMenu Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    columnId: ColumnType.TODO,
    order: 0,
  };

  const mockButtonRef = {
    current: document.createElement('button'),
  };

  beforeEach(() => {
    localStorage.clear();
    // Set button position for menu positioning
    mockButtonRef.current.getBoundingClientRect = () => ({
      bottom: 100,
      left: 200,
      right: 250,
      top: 50,
      width: 50,
      height: 50,
      x: 200,
      y: 50,
      toJSON: vi.fn(),
    });
  });

  it('should not render when closed', () => {
    render(
      <TaskMenu
        task={mockTask}
        isOpen={false}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should render menu when open', () => {
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toHaveAttribute('aria-label', 'Task actions for: Test Task');
  });

  it('should show move options for other columns', () => {
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`task-menu-move-to-${ColumnType.DONE}-${mockTask.id}`)).toBeInTheDocument();
    expect(screen.queryByTestId(`task-menu-move-to-${ColumnType.TODO}-${mockTask.id}`)).not.toBeInTheDocument();
  });

  it('should show delete option', () => {
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    expect(screen.getByTestId(`task-menu-delete-${mockTask.id}`)).toBeInTheDocument();
  });

  it('should move task when move option is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={onClose}
        buttonRef={mockButtonRef}
      />
    );

    const moveButton = screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`);
    await user.click(moveButton);

    // Menu should close after selection via onClose callback
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should open delete dialog when delete is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    const deleteButton = screen.getByTestId(`task-menu-delete-${mockTask.id}`);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-task-confirm-button')).toBeInTheDocument();
    });
  });

  it('should close menu on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={onClose}
        buttonRef={mockButtonRef}
      />
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('should navigate menu items with Arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    // Wait for menu to be fully rendered
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Focus should be on first menu item
    const firstMenuItem = screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`);
    expect(firstMenuItem).toHaveFocus();

    // Press Arrow Down
    await user.keyboard('{ArrowDown}');
    const secondMenuItem = screen.getByTestId(`task-menu-move-to-${ColumnType.DONE}-${mockTask.id}`);
    expect(secondMenuItem).toHaveFocus();

    // Press Arrow Up
    await user.keyboard('{ArrowUp}');
    expect(firstMenuItem).toHaveFocus();
  });

  it('should navigate to first item with Home key', async () => {
    const user = userEvent.setup();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Focus delete button (last item)
    const deleteButton = screen.getByTestId(`task-menu-delete-${mockTask.id}`);
    deleteButton.focus();

    // Press Home
    await user.keyboard('{Home}');
    const firstMenuItem = screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`);
    expect(firstMenuItem).toHaveFocus();
  });

  it('should navigate to last item with End key', async () => {
    const user = userEvent.setup();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Press End
    await user.keyboard('{End}');
    const deleteButton = screen.getByTestId(`task-menu-delete-${mockTask.id}`);
    expect(deleteButton).toHaveFocus();
  });

  it('should close menu on outside click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={onClose}
        buttonRef={mockButtonRef}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Click outside menu
    await user.click(document.body);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have correct ARIA labels on menu items', () => {
    render(
      <TaskMenu
        task={mockTask}
        isOpen={true}
        onClose={vi.fn()}
        buttonRef={mockButtonRef}
      />
    );

    const moveButton = screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`);
    expect(moveButton).toHaveAttribute('aria-label', 'Move task to In Progress');

    const deleteButton = screen.getByTestId(`task-menu-delete-${mockTask.id}`);
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete task: Test Task');
  });
});

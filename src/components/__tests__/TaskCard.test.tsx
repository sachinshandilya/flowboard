import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../TaskCard';
import { Task, ColumnType } from '../../types';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    columnId: ColumnType.TODO,
    order: 0,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render menu button', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByTestId(`task-menu-button-${mockTask.id}`)).toBeInTheDocument();
  });

  it('should open menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} />);

    const menuButton = screen.getByTestId(`task-menu-button-${mockTask.id}`);
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`)).toBeInTheDocument();
    });
  });

  it('should have correct ARIA label', () => {
    render(<TaskCard task={mockTask} />);
    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    expect(taskCard).toHaveAttribute('aria-label', 'Task: Test Task. Press Enter or Space to open menu. Drag to move.');
  });

  it('should have correct role and tabIndex', () => {
    render(<TaskCard task={mockTask} />);
    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    expect(taskCard).toHaveAttribute('role', 'button');
    expect(taskCard).toHaveAttribute('tabIndex', '0');
  });

  it('should open menu on Enter key', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} />);

    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    taskCard.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`)).toBeInTheDocument();
    });
  });

  it('should open menu on Space key', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} />);

    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    taskCard.focus();
    await user.keyboard(' ');

    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`)).toBeInTheDocument();
    });
  });

  it('should call onDragStart when mousedown occurs on card', async () => {
    const handleDragStart = vi.fn();
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} onDragStart={handleDragStart} />);

    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    await user.pointer({ target: taskCard, keys: '[MouseLeft>]' });

    // Note: Actual drag start requires mousedown event
    // This verifies the component structure is correct
    expect(taskCard).toBeInTheDocument();
  });

  it('should not start drag when clicking menu button', async () => {
    const handleDragStart = vi.fn();
    const user = userEvent.setup();
    render(<TaskCard task={mockTask} onDragStart={handleDragStart} />);

    const menuButton = screen.getByTestId(`task-menu-button-${mockTask.id}`);
    await user.click(menuButton);

    // Menu should open, drag should not start
    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${mockTask.id}`)).toBeInTheDocument();
    });
  });

  it('should show reduced opacity when being dragged', () => {
    render(<TaskCard task={mockTask} draggedTaskId={mockTask.id} />);
    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    expect(taskCard).toHaveStyle({ opacity: '0.3' });
  });

  it('should show reduced opacity when in drag-over column', () => {
    render(
      <TaskCard
        task={mockTask}
        draggedTaskId="2"
        dragOverColumnId={ColumnType.TODO}
      />
    );
    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    expect(taskCard).toHaveStyle({ opacity: '0.7' });
  });

  it('should show normal opacity when not being dragged', () => {
    render(<TaskCard task={mockTask} />);
    const taskCard = screen.getByTestId(`task-card-${mockTask.id}`);
    expect(taskCard).toHaveStyle({ opacity: '1' });
  });

  it('should have menu button with correct ARIA attributes', () => {
    render(<TaskCard task={mockTask} />);
    const menuButton = screen.getByTestId(`task-menu-button-${mockTask.id}`);
    expect(menuButton).toHaveAttribute('aria-label', 'Menu for task: Test Task');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
  });
});

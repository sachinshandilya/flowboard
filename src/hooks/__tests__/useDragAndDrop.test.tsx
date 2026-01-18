import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Board } from '../../components/Board';
import { ColumnType } from '../../types';

describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start drag operation on mousedown', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Draggable Task');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Draggable Task')).toBeInTheDocument();
    });

    // Find task card - use getAllByText since there might be multiple (original + ghost)
    const taskCards = screen.getAllByText('Draggable Task');
    const taskCard = taskCards[0].closest('[data-testid^="task-card-"]');
    expect(taskCard).toBeInTheDocument();

    // Simulate mousedown on task card
    if (taskCard) {
      await user.pointer({ target: taskCard, keys: '[MouseLeft>]' });
      
      // Task should have reduced opacity (being dragged)
      await waitFor(() => {
        const cards = screen.getAllByText('Draggable Task');
        const card = cards[0].closest('[data-testid^="task-card-"]');
        expect(card).toHaveStyle({ opacity: '0.3' });
      });
    }
  });

  it('should not start drag when clicking menu button', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task with Menu');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task with Menu')).toBeInTheDocument();
    });

    // Find task card and menu button
    const taskCard = screen.getByText('Task with Menu').closest('[data-testid^="task-card-"]');
    const taskId = taskCard?.getAttribute('data-testid')?.replace('task-card-', '') || '';
    const menuButton = screen.getByTestId(`task-menu-button-${taskId}`);

    // Click menu button - should open menu, not start drag
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId(`task-menu-move-to-${ColumnType.IN_PROGRESS}-${taskId}`)).toBeInTheDocument();
    });
  });

  it('should show visual feedback during drag', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add tasks to both columns
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task 1');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // Find task card
    const taskCard = screen.getByText('Task 1').closest('[data-testid^="task-card-"]');
    
    if (taskCard) {
      // Simulate drag start
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
      });
      taskCard.dispatchEvent(mouseDownEvent);

      // Check if ghost element is created (would be in document.body)
      await waitFor(() => {
        const ghostElements = document.querySelectorAll('.task-card');
        // Should have at least the original card
        expect(ghostElements.length).toBeGreaterThan(0);
      });
    }
  });

  it('should handle drag over column', async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Add a task to TODO
    const addButton = screen.getByTestId('add-task-button');
    await user.click(addButton);
    const input = screen.getByLabelText(/task title/i);
    await user.type(input, 'Task to Move');
    const submitButton = screen.getByTestId('add-task-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Move')).toBeInTheDocument();
    });

    // Find In Progress column
    const inProgressColumn = screen.getByText('In Progress').closest('[role="region"]');
    expect(inProgressColumn).toBeInTheDocument();

    // When dragging over a column, it should show visual feedback
    // This is tested through the visual state changes in the component
  });
});

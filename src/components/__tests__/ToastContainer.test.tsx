import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from '../ToastContainer';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

// Helper component to trigger toasts
function ToastTrigger() {
  const { showToast } = useToast();
  
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')} data-testid="show-success">
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')} data-testid="show-error">
        Show Error
      </button>
      <button onClick={() => showToast('Warning message', 'warning')} data-testid="show-warning">
        Show Warning
      </button>
      <button onClick={() => showToast('Info message', 'info')} data-testid="show-info">
        Show Info
      </button>
    </div>
  );
}

describe('ToastContainer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not render when there are no toasts', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    expect(screen.queryByRole('region', { name: /notifications/i })).not.toBeInTheDocument();
  });

  it('should render toast when shown', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    const showButton = screen.getByTestId('show-success');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('should render success toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-success'));

    await waitFor(() => {
      const toast = screen.getByText('Success message').closest('[role="alert"]');
      expect(toast).toHaveClass('border-green-500');
    });
  });

  it('should render error toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-error'));

    await waitFor(() => {
      const toast = screen.getByText('Error message').closest('[role="alert"]');
      expect(toast).toHaveClass('border-red-500');
    });
  });

  it('should render warning toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-warning'));

    await waitFor(() => {
      const toast = screen.getByText('Warning message').closest('[role="alert"]');
      expect(toast).toHaveClass('border-yellow-500');
    });
  });

  it('should render info toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-info'));

    await waitFor(() => {
      const toast = screen.getByText('Info message').closest('[role="alert"]');
      expect(toast).toHaveClass('border-blue-500');
    });
  });

  it('should dismiss toast when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-success'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Find dismiss button (it will have a testid with toast id)
    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    await user.click(dismissButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('should have correct ARIA attributes', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-success'));

    await waitFor(() => {
      const region = screen.getByRole('region', { name: /notifications/i });
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'false');
    });
  });

  it('should render multiple toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('show-success'));
    await user.click(screen.getByTestId('show-error'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('should limit visible toasts to 3', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastContainer />
        <ToastTrigger />
      </ToastProvider>
    );

    // Show 4 toasts
    await user.click(screen.getByTestId('show-success'));
    await user.click(screen.getByTestId('show-error'));
    await user.click(screen.getByTestId('show-warning'));
    await user.click(screen.getByTestId('show-info'));

    await waitFor(() => {
      const toasts = screen.getAllByRole('alert');
      // Should only show 3 toasts (most recent)
      expect(toasts.length).toBeLessThanOrEqual(3);
    });
  });

});

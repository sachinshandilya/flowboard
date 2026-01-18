import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BoardProvider } from '../../contexts/BoardContext';
import { ToastProvider } from '../../contexts/ToastContext';

/**
 * Custom render function that wraps components with providers
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BoardProvider>
        {children}
      </BoardProvider>
    </ToastProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

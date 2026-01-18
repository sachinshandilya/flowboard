import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBoardContext } from '../useBoardContext';
import { BoardProvider } from '../../contexts/BoardContext';
import { ToastProvider } from '../../contexts/ToastContext';
import React from 'react';

describe('useBoardContext Hook', () => {
  it('should return context value when used within BoardProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider>
        <BoardProvider>{children}</BoardProvider>
      </ToastProvider>
    );

    const { result } = renderHook(() => useBoardContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
    expect(typeof result.current.dispatch).toBe('function');
  });

  it('should throw error when used outside BoardProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useBoardContext());
    }).toThrow('useBoardContext must be used within a BoardProvider');

    consoleSpy.mockRestore();
  });
});

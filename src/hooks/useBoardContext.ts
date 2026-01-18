import { useContext } from 'react';
import { BoardContext } from '../contexts/BoardContext';

/**
 * Custom hook to access board context
 * 
 * Provides state and dispatch function for managing board state
 * Throws error if used outside BoardProvider
 * 
 * @returns Object containing state and dispatch function
 */
export function useBoardContext() {
  const context = useContext(BoardContext);
  
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  
  return context;
}

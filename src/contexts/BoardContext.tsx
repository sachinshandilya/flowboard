import React, { createContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import { boardReducer, initialState } from './boardReducer';
import { useLocalStorageSync } from '../hooks/useLocalStorageSync';

/**
 * BoardContext type definition
 * 
 * Provides state and dispatch function for managing board state
 */
interface BoardContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * BoardContext - React Context for board state management
 * 
 * Used with BoardProvider to provide state and dispatch to all child components
 */
export const BoardContext = createContext<BoardContextType | undefined>(undefined);

/**
 * BoardProvider Props
 */
interface BoardProviderProps {
  children: ReactNode;
}

/**
 * BoardProvider Component
 * 
 * Provides board state and dispatch function to all child components
 * Uses useReducer to manage state with boardReducer
 * Syncs with localStorage (debounced writes + immediate for critical operations)
 * 
 * @param children - Child components that need access to board context
 */
export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  // Sync with localStorage
  useLocalStorageSync(state, dispatch);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

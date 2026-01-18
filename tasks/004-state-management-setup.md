# Task 004: State Management Setup (Context API + useReducer)

## Objective
Set up global state management using React Context API with useReducer hook.

## Requirements
- Create BoardProvider context component
- Implement useReducer with AppState and AppAction types
- Define reducer actions: ADD_TASK, MOVE_TASK, DELETE_TASK, UPDATE_FILTER, SET_DRAG_STATE, LOAD_TASKS, RESET_STATE
- Wrap application with BoardProvider
- Create custom hook for accessing context (useBoardContext)

## Deliverables
- [ ] BoardProvider context component created
- [ ] Reducer function implemented with all action types
- [ ] Custom hook (useBoardContext) for accessing state and dispatch
- [ ] App component wrapped with BoardProvider
- [ ] Initial state structure matches AppState interface

## Technical Notes
- Use Context API + useReducer (no Redux)
- Single context provider wrapping entire application
- Reducer handles all state mutations
- State structure: tasks array, filter, ui state (drag state)
- Memoization will be added in later tasks

## Dependencies
- Task 003: Data Models & TypeScript Types

## Related Requirements
- Section 1: State Management
- Decision 1: Context API vs Redux
- FR008: localStorage Persistence (will be integrated later)

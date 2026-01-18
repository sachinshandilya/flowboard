# FlowBoard - Technical Requirements Document

**Document Version:** 1.0  
**Last Updated:** Based on architectural decisions  
**Status:** Approved for Implementation

---

## Table of Contents

1. [State Management](#1-state-management)
2. [Data Models](#2-data-models)
3. [Component Architecture](#3-component-architecture)
4. [Drag-and-Drop Implementation](#4-drag-and-drop-implementation)
5. [Persistence Strategy](#5-persistence-strategy)
6. [UI Components](#6-ui-components)
7. [Error Handling](#7-error-handling)
8. [Performance Optimizations](#8-performance-optimizations)
9. [Accessibility](#9-accessibility)
10. [Testing Strategy](#10-testing-strategy)
11. [TypeScript Configuration](#11-typescript-configuration)
12. [Styling Approach](#12-styling-approach)
13. [Major Decisions & Trade-offs](#13-major-decisions--trade-offs)

---

## 1. State Management

### Decision: Context API + useReducer

**Implementation:**
- Use React Context API with `useReducer` hook for global state management
- Single context provider wrapping the entire application
- Reducer handles all state mutations (tasks, filter, UI state)

**State Structure:**
```typescript
interface AppState {
  tasks: Task[];
  filter: ColumnType | 'all';
  ui: {
    draggedTaskId: string | null;
    dragOverColumnId: ColumnType | null;
    dragOverIndex: number | null;
  }
}
```

**Actions:**
- `ADD_TASK` - Add new task to To Do column
- `MOVE_TASK` - Move task between columns or reorder within column
- `DELETE_TASK` - Delete task (with confirmation)
- `UPDATE_FILTER` - Update column filter
- `SET_DRAG_STATE` - Update drag-and-drop UI state
- `LOAD_TASKS` - Load tasks from localStorage on mount
- `RESET_STATE` - Reset state (for error recovery)

**Why Context API + useReducer:**
- ✅ Simpler setup than Redux (no boilerplate, actions, reducers)
- ✅ Built into React (no external dependencies)
- ✅ Sufficient for current scope (single board, simple operations)
- ✅ Good performance with proper memoization
- ✅ Easy to migrate to Redux later if needed

**Trade-offs:**
- ⚠️ Context API can cause re-renders if not properly optimized (mitigated with memoization)
- ⚠️ Less tooling than Redux (no time-travel debugging, but not needed)
- ⚠️ If future complexity grows significantly, migration to Redux may be needed

---

## 2. Data Models

### Task Model

```typescript
interface Task {
  id: string;           // Timestamp string (Date.now().toString())
  title: string;        // Task title (required, non-empty)
  columnId: ColumnType; // Current column
  order: number;        // Explicit order for reordering
}
```

### Column Types

```typescript
enum ColumnType {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

const COLUMN_TYPES: ColumnType[] = [
  ColumnType.TODO,
  ColumnType.IN_PROGRESS,
  ColumnType.DONE
];
```

### State Shape: Flat Array

**Decision:** Store tasks as a flat array `Task[]` rather than `{ [columnId]: Task[] }`

**Why Flat Array:**
- ✅ Simpler data structure (less nesting)
- ✅ Easier filtering (simple `.filter()` by `columnId`)
- ✅ Easier task lookups by ID (no nested iteration)
- ✅ Simpler drag-and-drop operations (update `columnId` and `order`)
- ✅ Easier to add future features (search, tags, etc.)
- ✅ Simpler localStorage serialization

**Task Order:**
- Use explicit `order` field (number) for stable reordering
- When moving tasks, update `order` values accordingly
- Array index is NOT used for ordering (order field is source of truth)

**Task ID Generation:**
- Use timestamp: `Date.now().toString()`
- Ensures uniqueness
- Simple and deterministic

---

## 3. Component Architecture

### Component Hierarchy

```
App
└── BoardProvider (Context Provider)
    └── Board
        ├── FilterDropdown (Board level, above columns)
        ├── Column (mapped from COLUMN_TYPES)
        │   ├── ColumnHeader
        │   ├── AddTaskButton (only in ToDo column)
        │   └── TaskCard (mapped from filtered tasks)
        │       ├── TaskTitle
        │       └── TaskMenu (3-dot menu)
        │           ├── MoveLeftButton
        │           ├── MoveRightButton
        │           ├── MoveToColumnMenu
        │           └── DeleteButton
        ├── AddTaskDialog (Portal, modal)
        └── ToastContainer (Portal, top-right)
```

### Component Responsibilities

**Board:**
- Main container component
- Renders filter dropdown and columns
- Handles column layout (33% width each)

**Column:**
- Displays column header
- Renders task cards for its column
- Handles drop zone for drag-and-drop
- Shows Add Task button (ToDo column only)

**TaskCard:**
- Displays task title
- Handles drag start/end events
- Renders 3-dot menu button (positioned on the right side of the card)
- Memoized to prevent unnecessary re-renders

**TaskMenu:**
- Dropdown menu (Portal-based)
- Move left/right options
- Move to specific column options
- Delete option
- Keyboard navigation support

**AddTaskDialog:**
- Modal dialog (Portal-based)
- Input field for task title
- Validation on submit
- Close on backdrop click or Escape

**FilterDropdown:**
- Dropdown at board level
- Options: "All Columns", "To Do", "In Progress", "Done"
- Default: "All Columns"

### Columns Implementation

**Decision:** Map columns from `COLUMN_TYPES` constant array

**Why:**
- ✅ Single source of truth for column definitions
- ✅ Easy to add/remove columns in future
- ✅ Consistent column rendering
- ✅ Easier to maintain

---

## 4. Drag-and-Drop Implementation

### Decision: Custom Mouse Events (No HTML5 Drag API)

**Implementation Approach:**
- Use native browser events: `mousedown`, `mousemove`, `mouseup`
- Custom implementation without HTML5 Drag and Drop API
- Full control over visual feedback and behavior

### Drag Flow

1. **Drag Start (mousedown on task card):**
   - Set `draggedTaskId` in state
   - Create ghost preview element
   - Hide original task (opacity 0.3)
   - Attach global mousemove and mouseup listeners

2. **Drag Move (mousemove):**
   - Update ghost preview position (follow cursor)
   - Calculate drop zone (column and insertion index)
   - Update `dragOverColumnId` and `dragOverIndex` in state
   - Show visual feedback (column highlight, insertion indicator)

3. **Drag End (mouseup):**
   - Calculate final drop position
   - Update task `columnId` and `order` if dropped in valid zone
   - Remove ghost preview
   - Reset drag state
   - Remove global event listeners

### Visual Feedback

**Ghost Preview:**
- Clone task card element
- Position: `fixed`, follow cursor
- Styling: opacity 0.5, slight scale (0.95), shadow
- Hide original task (opacity 0.3)

**Drop Zone Highlighting:**
- Highlight entire column border (2px, primary color)
- Show insertion indicator (horizontal line between tasks)
- Opacity changes: dragged task 0.3, hovered column tasks 0.7

**Insertion Points:**
- Show insertion line between tasks
- Allow drop at top (index 0) and bottom (last index)
- Empty columns: show drop zone indicator in center

### Drop Zone Detection

**Algorithm:**
- Use `getBoundingClientRect()` to get column boundaries
- Calculate mouse Y position relative to column
- Find insertion index based on task card positions
- Update state with `dragOverColumnId` and `dragOverIndex`

**Performance:**
- Use `requestAnimationFrame` for smooth updates
- Throttle mousemove calculations (16ms = 60fps)
- Only update drag-related state, not full re-render

### Why Custom Implementation

**Advantages:**
- ✅ Full control over visual feedback
- ✅ Better performance (no browser drag API overhead)
- ✅ Consistent behavior across browsers
- ✅ Easier to customize (Jira/Trello-like experience)
- ✅ No external dependencies

**Trade-offs:**
- ⚠️ More code to maintain
- ⚠️ Need to handle edge cases manually
- ⚠️ Accessibility requires additional work (keyboard alternatives)

---

## 5. Persistence Strategy

### localStorage Sync Strategy

**Decision:** Debounced writes (300ms) + immediate for critical operations

**Implementation:**
- In-memory state updates are immediate
- localStorage writes are debounced (300ms delay)
- Critical operations (delete, move) write immediately
- Batch multiple rapid changes into single write

**Sync Flow:**
1. User action triggers state update
2. State updates immediately (UI responds instantly)
3. Debounced localStorage write scheduled
4. If another change occurs within 300ms, cancel previous write, schedule new one
5. After 300ms of inactivity, write to localStorage

**Critical Operations (Immediate Write):**
- Task deletion
- Task movement (drag-and-drop)
- These operations are important and should persist immediately

### Error Handling

**localStorage Failures:**
- Try-catch around all localStorage operations
- On failure: show toast error, continue with in-memory state
- On load failure: show error toast, start with empty state
- Graceful degradation (app continues to work without persistence)

**Error Detection:**
- Quota exceeded: `QuotaExceededError`
- Disabled: `SecurityError` or `null` check
- Corrupted data: JSON parse error

**Recovery:**
- If localStorage fails, app continues with in-memory state
- User can continue working (data lost on refresh, but app doesn't break)
- Show clear error message via toast

### Data Validation

**On Load:**
- Validate localStorage data structure
- Handle corrupted/invalid data gracefully
- Reset to empty state if data is invalid
- Show error toast on load failure

**On Save:**
- Validate task data before saving
- Ensure required fields are present
- Handle serialization errors

---

## 6. UI Components

### Add Task Dialog

**Implementation:**
- Modal dialog using Portal
- Always visible input when dialog opens
- Validation on submit (non-empty title)
- Close on backdrop click or Escape key
- Focus management (focus input on open, return focus on close)

**Flow:**
1. Click "Add Task" button in ToDo column
2. Dialog opens with input field
3. User types title
4. Submit validates (non-empty)
5. On success: add task, close dialog, show success toast
6. On error: show validation error

### Task Menu (3-Dot Menu)

**Implementation:**
- Portal/overlay (React Portal) for z-index management
- Position: absolute, calculated from button position
- Menu button positioned on the right side of the task card
- Close on outside click (useRef + useEffect)
- Keyboard navigation: Escape to close, Arrow keys to navigate, Enter to select

**Menu Options:**
- Move Left (if not in first column)
- Move Right (if not in last column)
- Move to "To Do"
- Move to "In Progress"
- Move to "Done"
- Delete (with confirmation dialog)

### Delete Confirmation Dialog

**Implementation:**
- Show confirmation dialog before deletion
- Options: "Cancel" and "Delete"
- On confirm: delete task immediately, show success toast
- No undo functionality (per requirements)

### Toast System

**Implementation:**
- Global Context Provider
- Queue-based system (max 3 visible toasts)
- Auto-dismiss: 5 seconds
- Manual dismiss button
- Position: top-right

**Toast Types:**
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Toast Queue:**
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
```

**Behavior:**
- New toasts appear at top
- Oldest toast dismissed when limit reached
- Smooth animations (slide in/out)

---

## 7. Error Handling

### localStorage Errors

**Scenarios:**
1. **Quota Exceeded:**
   - Detect: `QuotaExceededError`
   - Action: Show error toast, continue with in-memory state

2. **localStorage Disabled:**
   - Detect: `SecurityError` or `null` check
   - Action: Show error toast, continue with in-memory state

3. **Corrupted Data:**
   - Detect: JSON parse error on load
   - Action: Show error toast, reset to empty state

**Error Messages:**
- "Failed to save data. Your changes may be lost on refresh."
- "Failed to load saved data. Starting with empty board."
- "Storage quota exceeded. Please free up space."

### Data Validation

**Task Title Validation:**
- Cannot be empty (trimmed)
- No maximum length restriction
- Validation on submit (not real-time)

**Invalid Data Handling:**
- Graceful degradation on corrupted localStorage
- Reset to empty state if data is invalid
- Show error toast with clear message

---

## 8. Performance Optimizations

### Memoization Strategy

**Components:**
- `React.memo` for Column and TaskCard components
- Prevent re-renders when props haven't changed

**Computed Values:**
- `useMemo` for filtered tasks
- `useMemo` for column-specific tasks
- Avoid recalculating on every render

**Event Handlers:**
- `useCallback` for event handlers passed to children
- Prevent child re-renders due to new function references

### Drag-and-Drop Optimization

**During Drag:**
- Only update drag-related state (not full state)
- Use `requestAnimationFrame` for smooth updates
- Throttle mousemove calculations (16ms = 60fps)
- Minimize DOM queries (cache element positions)

**Re-render Optimization:**
- Memoize Column components (only re-render if tasks change)
- Memoize TaskCard components (only re-render if task data changes)
- Avoid unnecessary state updates

### General Optimizations

**Avoid:**
- Unnecessary re-renders
- Expensive calculations in render
- Large component trees without memoization

**Use:**
- React DevTools Profiler to identify bottlenecks
- Code splitting if needed (not required for MVP)

---

## 9. Accessibility

### ARIA Labels

**Required ARIA Labels:**
- All buttons: `aria-label` with descriptive text
- Task cards: `aria-label` describing task and column
- Drag handles: `aria-label="Drag to move task"`
- Menu items: `aria-label` for each action
- Dialogs: `aria-labelledby` for title

### Keyboard Navigation

**Basic Support:**
- Tab navigation through interactive elements
- Enter/Space to activate buttons
- Escape to close dialogs/menus
- Arrow keys in menus

**Drag-and-Drop Alternative:**
- Use 3-dot menu for moving tasks (keyboard accessible)
- ARIA labels on move buttons
- Focus management during menu interactions

### Focus Management

**Modals:**
- Focus trap inside modal
- Return focus to trigger on close
- Focus input field on open

**Menus:**
- Focus first item on open
- Arrow keys to navigate
- Escape to close

### ARIA Roles

**Columns:**
- `role="region"` with `aria-label` for each column
- `aria-labelledby` for column headers

**Task Cards:**
- `role="button"` for draggable tasks
- `aria-label` describing task and current column

**Menus:**
- `role="menu"` for dropdown menus
- `role="menuitem"` for menu items

---

## 10. Testing Strategy

### Testing Scope

**Critical Paths to Test:**
- Task CRUD operations (Create, Read, Update, Delete)
- Drag-and-drop functionality
- Filtering by column
- localStorage persistence
- Error handling (localStorage failures)
- Form validation

### Testing Approach

**Components:**
- Render components with React Testing Library
- Test user interactions (clicks, inputs)
- Test conditional rendering
- Test error states

**Drag-and-Drop Testing:**
- Simulate mouse events: `fireEvent.mouseDown`, `fireEvent.mouseMove`, `fireEvent.mouseUp`
- Mock `getBoundingClientRect()` for position calculations
- Test drop zone detection logic
- Test visual feedback updates

**localStorage Testing:**
- Mock `window.localStorage` with `jest.spyOn`
- Test save operations
- Test load operations
- Test error scenarios (quota exceeded, disabled, corrupted)

**Utilities:**
- Test helper functions
- Test data transformation logic
- Test validation functions

### Coverage Target

**Goal:** 30-40% coverage focusing on critical paths

**Priority:**
1. Task operations (add, move, delete)
2. Drag-and-drop core functionality
3. Filtering logic
4. localStorage sync
5. Error handling

**Not Required:**
- 100% coverage (not practical for MVP)
- Edge cases that are unlikely to occur
- Visual styling tests

---

## 11. TypeScript Configuration

### TypeScript Strictness

**Configuration:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

**Rationale:**
- Moderate strictness (not too lenient, not overly strict)
- Catches common errors without being overly restrictive
- Allows some flexibility for rapid development

### Type Definitions

**Task Model:**
```typescript
interface Task {
  id: string;
  title: string;
  columnId: ColumnType;
  order: number;
}
```

**Column Types:**
```typescript
enum ColumnType {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}
```

**State Types:**
```typescript
interface AppState {
  tasks: Task[];
  filter: ColumnType | 'all';
  ui: {
    draggedTaskId: string | null;
    dragOverColumnId: ColumnType | null;
    dragOverIndex: number | null;
  }
}
```

**Action Types:**
```typescript
type AppAction =
  | { type: 'ADD_TASK'; payload: { title: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; columnId: ColumnType; order: number } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'UPDATE_FILTER'; payload: { filter: ColumnType | 'all' } }
  | { type: 'SET_DRAG_STATE'; payload: { draggedTaskId: string | null; dragOverColumnId: ColumnType | null; dragOverIndex: number | null } }
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[] } }
  | { type: 'RESET_STATE' };
```

---

## 12. Styling Approach

### TailwindCSS Only

**Decision:** Use TailwindCSS exclusively (no external design system library)

**Implementation:**
- Custom Tailwind classes for consistent styling
- Create reusable utility classes for common patterns
- Jira/Trello-inspired minimal design

**Design Principles:**
- Clean, minimal interface
- Subtle shadows and borders
- Consistent spacing (Tailwind spacing scale)
- Professional color palette

**Component Styling:**
- Task cards: White background, subtle shadow, rounded corners, 3-dot menu button on right side
- Columns: Light background, border, rounded corners
- Buttons: Consistent styling with hover states
- Dialogs: Overlay with centered modal

**Responsive Design:**
- Desktop only (no mobile/tablet support required)
- Fixed layout (three columns, 33% width each)

---

## 13. Major Decisions & Trade-offs

### Decision 1: Context API vs Redux

**Chosen:** Context API + useReducer

**Reasoning:**
- Current scope is simple (single board, basic CRUD)
- Less boilerplate than Redux
- Built into React (no external dependencies)
- Sufficient for shared state across components
- Easy to migrate to Redux later if complexity grows

**Trade-offs:**
- ⚠️ Less tooling than Redux (no time-travel debugging)
- ⚠️ Can cause re-renders if not properly optimized (mitigated with memoization)
- ⚠️ May need migration to Redux if future complexity grows significantly

**Future Considerations:**
- If multi-board or real-time sync is added, consider migrating to Redux
- Current architecture allows for easy migration (state shape can remain similar)

---

### Decision 2: Flat Array vs Nested Object

**Chosen:** Flat array `Task[]` with `columnId` field

**Reasoning:**
- Simpler data structure (less nesting)
- Easier filtering (simple `.filter()` by `columnId`)
- Easier task lookups by ID
- Simpler drag-and-drop operations
- Easier to add future features (search, tags)

**Trade-offs:**
- ⚠️ Need to filter by `columnId` to get column-specific tasks
- ⚠️ Slightly more complex queries (but still simple)

**Alternative Considered:**
- `{ [columnId]: Task[] }` - More complex, harder to maintain

---

### Decision 3: Explicit Order Field vs Array Index

**Chosen:** Explicit `order` field (number)

**Reasoning:**
- Stable ordering (not dependent on array manipulation)
- Easier to reorder tasks (update order values)
- Better for persistence (order is explicit in data)
- Prevents ordering bugs from array operations

**Trade-offs:**
- ⚠️ Need to maintain order field when moving tasks
- ⚠️ Slightly more complex than relying on array index

**Alternative Considered:**
- Array index - Simpler but less stable, harder to maintain

---

### Decision 4: Custom Drag-and-Drop vs HTML5 API

**Chosen:** Custom mouse events (mousedown, mousemove, mouseup)

**Reasoning:**
- Full control over visual feedback
- Better performance (no browser drag API overhead)
- Consistent behavior across browsers
- Easier to customize (Jira/Trello-like experience)
- No external dependencies

**Trade-offs:**
- ⚠️ More code to maintain
- ⚠️ Need to handle edge cases manually
- ⚠️ Accessibility requires additional work (keyboard alternatives)

**Alternative Considered:**
- HTML5 Drag and Drop API - Less control, browser inconsistencies

---

### Decision 5: Debounced localStorage Writes

**Chosen:** Debounced writes (300ms) + immediate for critical operations

**Reasoning:**
- Better performance (batches rapid changes)
- Reduces localStorage write operations
- Immediate UI feedback (state updates instantly)
- Critical operations persist immediately

**Trade-offs:**
- ⚠️ Risk of data loss if browser closes during debounce window
- ⚠️ More complex than immediate writes

**Mitigation:**
- Critical operations (delete, move) write immediately
- 300ms window is short enough to minimize risk

**Alternative Considered:**
- Immediate writes - Simpler but less performant

---

### Decision 6: No Undo Functionality

**Chosen:** No undo (confirmation dialog only)

**Reasoning:**
- Simpler implementation
- Confirmation dialog provides safety
- Per requirements (no undo specified)

**Trade-offs:**
- ⚠️ User cannot recover from accidental deletions
- ⚠️ Less user-friendly than undo

**Future Consideration:**
- Could add undo functionality later if needed

---

### Decision 7: Portal-based Modals and Menus

**Chosen:** React Portal for modals and menus

**Reasoning:**
- Better z-index management
- Avoids parent container overflow issues
- Standard React pattern for overlays
- Easier to position absolutely

**Trade-offs:**
- ⚠️ Slightly more complex than relative positioning
- ⚠️ Need to handle focus management manually

**Alternative Considered:**
- Relative positioning - Simpler but z-index issues

---

### Decision 8: Timestamp-based Task IDs

**Chosen:** `Date.now().toString()` for task IDs

**Reasoning:**
- Simple and deterministic
- Ensures uniqueness
- No external dependencies
- Easy to debug (human-readable)

**Trade-offs:**
- ⚠️ Not cryptographically secure (not needed for this use case)
- ⚠️ Potential collisions if multiple tasks created simultaneously (very unlikely)

**Alternative Considered:**
- UUID - More complex, external dependency
- Incremental counter - Requires state management

---

### Decision 9: Filtering as Computed State

**Chosen:** Computed selector (useMemo) rather than separate filtered state

**Reasoning:**
- Single source of truth (tasks array)
- No need to sync filtered state with main state
- Simpler state management
- Better performance with memoization

**Trade-offs:**
- ⚠️ Recomputes on every filter change (mitigated with useMemo)

**Alternative Considered:**
- Separate filtered state - More complex, need to sync

---

### Decision 10: Toast Queue (Max 3)

**Chosen:** Queue-based system with max 3 visible toasts

**Reasoning:**
- Prevents UI clutter
- Better UX (not overwhelming)
- Standard pattern for toast systems

**Trade-offs:**
- ⚠️ Older toasts may be dismissed if queue is full
- ⚠️ User may miss some notifications

**Mitigation:**
- Auto-dismiss after 5 seconds
- Manual dismiss button
- Important errors shown immediately

---

## Summary

This technical requirements document outlines all architectural decisions, implementation details, and trade-offs for the FlowBoard application. These decisions prioritize:

1. **Simplicity:** Choose simpler solutions when they meet requirements
2. **Performance:** Optimize where it matters (drag-and-drop, re-renders)
3. **Maintainability:** Code that's easy to understand and modify
4. **Scalability:** Architecture that can grow if needed (with migration path)
5. **User Experience:** Smooth interactions and clear feedback

All decisions are documented with reasoning and trade-offs to inform future development and the ARCHITECTURE.md document.

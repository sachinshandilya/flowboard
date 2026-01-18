# FlowBoard Architecture Documentation

**Document Version:** 2.0  
**Last Updated:** Based on complete implementation journey  
**Status:** Complete

---

## Table of Contents

1. [Architectural Pattern](#1-architectural-pattern)
2. [Component Hierarchy](#2-component-hierarchy)
3. [State Management](#3-state-management)
4. [Drag-and-Drop Implementation](#4-drag-and-drop-implementation)
5. [Key Design Decisions](#5-key-design-decisions)
6. [Data Flow](#6-data-flow)
7. [Performance Considerations](#7-performance-considerations)

---

## 1. Architectural Pattern

### Overview

FlowBoard follows a **Component-Based Architecture** with **Unidirectional Data Flow**, built on React 18. The application uses:

- **React Context API + useReducer** for global state management
- **Custom Hooks** for reusable business logic
- **Portal-based Modals** for overlays and dialogs
- **Native Browser Events** for drag-and-drop interactions

### Architecture Principles

1. **Separation of Concerns**: Components handle UI rendering, hooks encapsulate logic, reducers manage state mutations
2. **Single Source of Truth**: State managed centrally in Context API, synchronized with localStorage
3. **Unidirectional Data Flow**: Data flows down via props/context, events flow up via callbacks/dispatch
4. **Composition over Inheritance**: Reusable components and hooks composed together
5. **Accessibility First**: ARIA labels, keyboard navigation, and focus management built-in from the start

### Technology Stack

- **React 18.2.0** - UI library with modern hooks and patterns
- **TypeScript 5.2.2** - Type safety and enhanced developer experience
- **Vite 5.0.8** - Fast build tool and development server
- **TailwindCSS 3.4.0** - Utility-first CSS framework
- **Vitest 1.0.4** - Fast unit testing framework
- **React Testing Library** - Component testing utilities

---

## 2. Component Hierarchy

### Component Tree Diagram

```
App (Root Component)
│
├── ToastProvider (Context Provider)
│   │   Provides toast notification system
│   │
│   └── BoardProvider (Context Provider)
│       │   Provides board state and dispatch
│       │   Integrates localStorage sync
│       │
│       ├── Board (Main Container)
│       │   │   - Renders three columns
│       │   │   - Manages column filtering logic
│       │   │   - Integrates drag-and-drop hook
│       │   │
│       │   ├── FilterDropdown (Board Level)
│       │   │   - Column filter dropdown
│       │   │   - Positioned above columns
│       │   │
│       │   └── Column[] (3 instances: TODO, IN_PROGRESS, DONE)
│       │       │   - Displays column header
│       │       │   - Renders filtered tasks
│       │       │   - Handles drop zone highlighting
│       │       │
│       │       ├── ColumnHeader
│       │       │   - Column title display
│       │       │
│       │       ├── AddTaskButton (TODO column only)
│       │       │   - Opens AddTaskDialog
│       │       │
│       │       └── TaskCard[] (Mapped from filtered tasks)
│       │           │   - Displays task title
│       │           │   - Handles drag start (mousedown)
│       │           │   - Shows visual feedback during drag
│       │           │
│       │           └── TaskMenu (Portal)
│       │               │   - 3-dot menu dropdown
│       │               │   - Move and delete options
│       │               │   - Keyboard navigation support
│       │               │
│       │               └── DeleteConfirmationDialog (Portal)
│       │                   - Confirmation modal
│       │                   - Focus trap
│       │
│       ├── AddTaskDialog (Portal)
│       │   - Modal for adding new tasks
│       │   - Form validation
│       │   - Focus management
│       │
│       └── ToastContainer (Portal)
│           - Renders toast notifications
│           - Queue management (max 3 visible)
│           - Auto-dismiss after 5 seconds
```

### Component Responsibilities

#### **App Component**
- Root component that sets up provider hierarchy
- Wraps application with `ToastProvider` and `BoardProvider`
- Renders main `Board` component and `ToastContainer`

#### **Board Component**
- Main container managing the three-column layout
- Computes filtered tasks using `useMemo` for performance
- Integrates `useDragAndDrop` hook for drag-and-drop functionality
- Renders `FilterDropdown` and three `Column` components

#### **Column Component**
- Displays a single column (To Do, In Progress, or Done)
- Filters tasks by `columnId` and sorts by `order`
- Shows drop zone highlighting during drag operations
- Displays insertion indicators for visual feedback
- Memoized with `React.memo` to prevent unnecessary re-renders

#### **TaskCard Component**
- Displays individual task with title and menu button
- Handles drag start via `onMouseDown` event
- Applies visual feedback (opacity changes) during drag
- Opens `TaskMenu` on menu button click
- Memoized with `React.memo` for performance

#### **TaskMenu Component**
- Portal-based dropdown menu (rendered outside component tree)
- Provides move options (left/right, to specific columns) and delete
- Supports keyboard navigation (Arrow keys, Enter, Escape)
- Dynamically positions to prevent cutoff at screen edges

#### **AddTaskDialog Component**
- Portal-based modal for creating new tasks
- Form validation (non-empty title)
- Focus trap and keyboard support (Escape to close)
- Returns focus to trigger button on close

#### **DeleteConfirmationDialog Component**
- Portal-based confirmation modal before deletion
- Shows task title for context
- Focus trap and keyboard support
- Returns focus to menu button on cancel

#### **FilterDropdown Component**
- Custom dropdown for column filtering
- Options: "All Columns", "To Do", "In Progress", "Done"
- Highlights selected filter option
- Supports keyboard navigation

---

## 3. State Management

### Chosen Pattern: Context API + useReducer

FlowBoard uses **React Context API with useReducer** for global state management. This decision was made after evaluating alternatives and considering the project's requirements.

### Why Context API + useReducer?

#### ✅ **Advantages Over State Lifting**

**State Lifting** would require:
- Passing state and callbacks through multiple component layers (prop drilling)
- Managing state in a common ancestor component
- Complex prop chains: `App → Board → Column → TaskCard → TaskMenu`
- Difficult to maintain as component tree grows
- Performance issues (all intermediate components re-render on state changes)

**Context API solves these issues:**
- ✅ No prop drilling - components access state directly via context
- ✅ Centralized state management - single source of truth
- ✅ Cleaner component interfaces - no need to thread props through layers
- ✅ Better performance with proper memoization
- ✅ Easier to add new features without modifying component hierarchy

#### ✅ **Advantages Over Redux**

**Redux** would provide:
- Time-travel debugging with Redux DevTools
- Middleware support (logging, async actions)
- Large ecosystem of plugins and tools
- Standardized patterns and conventions

**Why Context API was chosen instead:**
- ✅ **Simpler Setup**: No boilerplate (actions, action creators, store configuration)
- ✅ **Built into React**: No external dependencies, smaller bundle size
- ✅ **Sufficient for Scope**: Current requirements (single board, simple CRUD) don't need Redux complexity
- ✅ **Easier to Learn**: Team members familiar with React can understand it immediately
- ✅ **Migration Path**: Easy to migrate to Redux later if complexity grows
- ✅ **Less Code**: Fewer files, less abstraction, easier to maintain

**Trade-offs:**
- ⚠️ Less tooling (no Redux DevTools time-travel debugging)
- ⚠️ May need refactoring if scope grows significantly (multi-board, real-time sync)
- ⚠️ Context can cause re-renders if not properly optimized (mitigated with memoization)

### State Structure

```typescript
interface AppState {
  tasks: Task[];                    // Flat array of all tasks
  filter: ColumnType | 'all';       // Current column filter
  ui: {
    draggedTaskId: string | null;   // ID of task being dragged
    dragOverColumnId: ColumnType | null;  // Column being dragged over
    dragOverIndex: number | null;    // Insertion index
  };
}
```

### Why Flat Array Structure?

Tasks are stored as a **flat array** `Task[]` rather than a nested structure like `{ [columnId]: Task[] }`.

**Advantages:**
- ✅ Simpler data structure (less nesting)
- ✅ Easier filtering: `tasks.filter(t => t.columnId === columnId)`
- ✅ Easier task lookups: `tasks.find(t => t.id === taskId)`
- ✅ Simpler drag-and-drop: Just update `columnId` and `order` fields
- ✅ Easier localStorage serialization
- ✅ Better for future features (search, tags, etc.)

**Trade-off:**
- ⚠️ Need to filter by `columnId` to get column-specific tasks (mitigated with `useMemo`)

### Reducer Pattern

The `boardReducer` function handles all state mutations using a reducer pattern:

```typescript
function boardReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': { /* ... */ }
    case 'MOVE_TASK': { /* ... */ }
    case 'DELETE_TASK': { /* ... */ }
    case 'UPDATE_FILTER': { /* ... */ }
    case 'SET_DRAG_STATE': { /* ... */ }
    case 'LOAD_TASKS': { /* ... */ }
    case 'RESET_STATE': { /* ... */ }
  }
}
```

**Benefits:**
- ✅ Predictable state updates
- ✅ All mutations in one place
- ✅ Easy to test (pure function)
- ✅ Type-safe with TypeScript action types

### State Flow

1. **User Action** → Component dispatches action via `dispatch()`
2. **Reducer** → Processes action, returns new state
3. **Context** → Updates context value with new state
4. **Components** → Re-render with new state (if subscribed)
5. **localStorage Sync** → State synchronized to localStorage (debounced or immediate)

### Actions

| Action Type | Payload | Description |
|------------|---------|-------------|
| `ADD_TASK` | `{ title: string }` | Add new task to TODO column |
| `MOVE_TASK` | `{ taskId, columnId, order }` | Move task between columns or reorder |
| `DELETE_TASK` | `{ taskId: string }` | Delete a task |
| `UPDATE_FILTER` | `{ filter: ColumnType \| 'all' }` | Update column filter |
| `SET_DRAG_STATE` | `{ draggedTaskId, dragOverColumnId, dragOverIndex }` | Update drag-and-drop UI state |
| `LOAD_TASKS` | `{ tasks: Task[] }` | Load tasks from localStorage |
| `RESET_STATE` | `{}` | Reset state to initial (error recovery) |

### Performance Optimization

To prevent unnecessary re-renders:
- **Memoization**: Components memoized with `React.memo`
- **useMemo**: Filtered tasks computed with `useMemo`
- **useCallback**: Event handlers memoized to prevent child re-renders
- **Selective Updates**: Only drag-related state updates during drag (not full state)

---

## 4. Drag-and-Drop Implementation

### Chosen Approach: Native Mouse Events

FlowBoard implements drag-and-drop using **native browser mouse events** (`mousedown`, `mousemove`, `mouseup`) rather than the HTML5 Drag and Drop API or external libraries.

### Why Native Mouse Events?

#### ✅ **Advantages Over HTML5 Drag API**

**HTML5 Drag API** (`draggable="true"`, `ondragstart`, `ondrop`) would provide:
- Browser-native drag-and-drop support
- Built-in drag image handling
- Cross-browser compatibility (mostly)

**Why native events were chosen instead:**
- ✅ **Full Control**: Complete control over drag behavior and visual feedback
- ✅ **Consistent Behavior**: No browser inconsistencies (HTML5 API has quirks across browsers)
- ✅ **Custom Visual Feedback**: Easy to implement Jira/Trello-style ghost preview and drop zones
- ✅ **Better Performance**: Direct DOM manipulation, optimized with `requestAnimationFrame`
- ✅ **No Browser Limitations**: HTML5 API has restrictions on drag image styling and positioning
- ✅ **Easier Debugging**: Direct event handling, easier to trace issues

**Trade-offs:**
- ⚠️ More code to maintain (~280 lines in `useDragAndDrop` hook)
- ⚠️ Need to handle edge cases manually (scrolling, window boundaries)
- ⚠️ Accessibility requires additional work (keyboard alternatives via menu)

#### ✅ **Advantages Over External Libraries**

**External libraries** (react-dnd, react-beautiful-dnd, interact.js) would provide:
- Pre-built drag-and-drop functionality
- Accessibility features
- Touch support for mobile
- Battle-tested edge case handling

**Why native implementation was chosen instead:**
- ✅ **No Dependencies**: Reduces bundle size, no external library overhead
- ✅ **Full Control**: Complete control over behavior and visual feedback
- ✅ **Custom Requirements**: Jira/Trello-style experience tailored to our needs
- ✅ **Learning Opportunity**: Understanding how drag-and-drop works under the hood
- ✅ **No Version Conflicts**: No dependency management issues

**Trade-offs:**
- ⚠️ More code to write and maintain
- ⚠️ Need to handle edge cases manually
- ⚠️ Accessibility features need custom implementation

### Implementation Details

#### Drag Flow

1. **Drag Start** (`mousedown` on TaskCard)
   - Create ghost preview element (cloned task card)
   - Set drag state in reducer (`SET_DRAG_STATE`)
   - Store initial mouse position and offsets
   - Add global `mousemove` and `mouseup` listeners

2. **Drag Move** (`mousemove`)
   - Update ghost element position using `requestAnimationFrame` (60fps)
   - Calculate drop zone (column + insertion index) using `getBoundingClientRect()`
   - Update drag state (highlight column, show insertion indicator)
   - Visual feedback: dragged task opacity 0.3, hovered column tasks opacity 0.7

3. **Drag End** (`mouseup`)
   - Calculate final drop zone
   - Dispatch `MOVE_TASK` action if dropped in valid zone
   - Cleanup: remove ghost element, reset drag state, remove event listeners

#### Drop Zone Detection Algorithm

```typescript
// Simplified algorithm
1. Get all columns using `querySelectorAll('[data-column-id]')`
2. For each column, check if mouse position is within column bounds
3. If inside column:
   - Get all task cards in column (excluding dragged task)
   - Calculate insertion index based on mouse Y position relative to card centers
   - Return columnId and insertion index
4. If not inside any column, return null
```

**Key Features:**
- Uses `getBoundingClientRect()` for accurate position calculations
- Excludes dragged task from drop zone calculations
- Handles empty columns (drop at index 0)
- Handles insertion between tasks (calculates center points)

#### Visual Feedback

- **Ghost Preview**: Semi-transparent cloned task card following cursor
  - Opacity: 0.5
  - Scale: 0.95
  - Shadow: Enhanced for depth
  - Position: Fixed, follows cursor with offset

- **Dragged Task**: Original task becomes semi-transparent (opacity 0.3)

- **Drop Zone Highlighting**:
  - Column border: Blue highlight (2px) when `dragOverColumnId` matches
  - Insertion indicator: Blue line between tasks showing drop position
  - Other tasks in column: Dimmed (opacity 0.7)

- **Empty Column Indicator**: Shows drop zone indicator in center of empty columns

#### Performance Optimizations

- **requestAnimationFrame**: Smooth ghost element updates (60fps)
- **Throttled Calculations**: Drop zone calculations throttled to 16ms
- **Selective State Updates**: Only drag-related state updates during drag
- **Memoization**: Components memoized to prevent unnecessary re-renders
- **Refs for State**: Drag state stored in `useRef` to avoid re-renders

### Accessibility Alternative

Since drag-and-drop is primarily mouse-based, a keyboard-accessible alternative is provided:
- **TaskMenu**: 3-dot menu with move options accessible via keyboard
- **Arrow Keys**: Navigate menu items
- **Enter/Space**: Activate menu options
- **Escape**: Close menu

This ensures the application is accessible to users who cannot use a mouse.

---

## 5. Key Design Decisions

### Decision 1: Context API + useReducer vs Redux vs State Lifting

**Chosen:** Context API + useReducer

**Rationale:**
- Simpler than Redux (no boilerplate, no external dependencies)
- Better than state lifting (no prop drilling, centralized state)
- Sufficient for current scope (single board, simple CRUD operations)
- Easy to migrate to Redux later if complexity grows

**Reference:** Task 004 (State Management Setup), Technical Requirements Section 1

### Decision 2: Flat Array vs Nested Structure

**Chosen:** Flat array `Task[]` with `columnId` field

**Rationale:**
- Simpler data structure (less nesting)
- Easier filtering and lookups
- Simpler drag-and-drop operations
- Better for future features (search, tags)

**Reference:** Technical Requirements Section 2

### Decision 3: Native Mouse Events vs HTML5 Drag API vs External Libraries

**Chosen:** Native mouse events (`mousedown`, `mousemove`, `mouseup`)

**Rationale:**
- Full control over visual feedback (Jira/Trello-style)
- Better performance (direct DOM manipulation)
- No external dependencies
- Consistent behavior across browsers

**Reference:** Task 007 (Drag-and-Drop Implementation), Technical Requirements Section 4

### Decision 4: Debounced localStorage Writes

**Chosen:** Hybrid approach - debounced (300ms) for non-critical operations, immediate for critical operations

**Rationale:**
- Better performance (batches rapid changes)
- Reduces localStorage write operations
- Critical operations (delete, move) persist immediately for data safety

**Reference:** Task 009 (localStorage Persistence), Technical Requirements Section 5

### Decision 5: Portal-based Modals

**Chosen:** React Portal for modals and menus

**Rationale:**
- Better z-index management
- Avoids parent container overflow issues
- Standard React pattern for overlays
- Easier to position absolutely

**Reference:** Technical Requirements Section 6

### Decision 6: Explicit Order Field vs Array Index

**Chosen:** Explicit `order` field (number) for task ordering

**Rationale:**
- Stable ordering (not dependent on array manipulation)
- Easier to reorder tasks (update order values)
- Better for persistence (order is explicit in data)
- Prevents ordering bugs from array operations

**Reference:** Technical Requirements Section 2

---

## 6. Data Flow

### Unidirectional Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
dispatch(action)
    ↓
boardReducer(state, action)
    ↓
New State
    ↓
Context Value Updated
    ↓
Components Re-render (if subscribed)
    ↓
localStorage Sync (debounced/immediate)
```

### Example: Adding a Task

1. User clicks "Add Task" button in TODO column
2. `AddTaskDialog` opens
3. User enters title and submits
4. Component dispatches `ADD_TASK` action with `{ title: string }`
5. `boardReducer` processes action:
   - Validates title (non-empty)
   - Creates new task with `id`, `title`, `columnId: TODO`, `order`
   - Returns new state with task added
6. `BoardContext` updates with new state
7. Components re-render:
   - `Column` (TODO) shows new task
   - `TaskCard` renders for new task
8. `useLocalStorageSync` hook detects change
9. Debounced write scheduled (300ms)
10. After 300ms, tasks saved to localStorage

### Example: Drag-and-Drop

1. User presses mouse down on `TaskCard`
2. `handleDragStart` called:
   - Creates ghost preview element
   - Sets drag state (`SET_DRAG_STATE` action)
   - Adds global mouse event listeners
3. User moves mouse (`mousemove`):
   - Ghost element follows cursor (`requestAnimationFrame`)
   - Drop zone calculated (`calculateDropZone`)
   - Drag state updated (`SET_DRAG_STATE` action)
   - Visual feedback applied (opacity, highlighting)
4. User releases mouse (`mouseup`):
   - Final drop zone calculated
   - `MOVE_TASK` action dispatched
   - Reducer updates task `columnId` and `order`
   - Ghost element removed
   - Drag state reset
   - Event listeners removed
5. Components re-render with new task positions
6. `useLocalStorageSync` detects critical operation (move)
7. Immediate write to localStorage (no debounce)

---

## 7. Performance Considerations

### Memoization Strategy

- **Components**: `React.memo` for `Column` and `TaskCard` to prevent re-renders when props haven't changed
- **Computed Values**: `useMemo` for filtered tasks to avoid recalculating on every render
- **Event Handlers**: `useCallback` for event handlers passed to children

### Drag-and-Drop Optimizations

- **requestAnimationFrame**: Smooth ghost element updates (60fps)
- **Throttled Calculations**: Drop zone calculations throttled to 16ms
- **Selective State Updates**: Only drag-related state updates during drag (not full state)
- **Refs for State**: Drag state stored in `useRef` to avoid re-renders during drag

### localStorage Sync Optimizations

- **Debounced Writes**: Non-critical operations debounced (300ms) to batch rapid changes
- **Immediate Writes**: Critical operations (delete, move) written immediately
- **Error Handling**: Graceful degradation if localStorage fails (app continues with in-memory state)

### General Optimizations

- **Avoid Unnecessary Re-renders**: Components memoized, computed values memoized
- **Efficient Queries**: Flat array structure allows simple `.filter()` operations
- **Minimal DOM Queries**: Cache element positions during drag operations

---

## Summary

FlowBoard's architecture prioritizes:

1. **Simplicity**: Choose simpler solutions when they meet requirements (Context API over Redux)
2. **Control**: Full control over behavior and visual feedback (native drag-and-drop)
3. **Performance**: Optimizations where they matter (memoization, requestAnimationFrame)
4. **Maintainability**: Code that's easy to understand and modify
5. **Scalability**: Architecture that can grow if needed (migration path to Redux)

The architecture follows React best practices while avoiding unnecessary complexity, resulting in a maintainable, performant, and accessible application.

---

**Related Documents:**
- [Technical Requirements](./technical-requirements.md) - Detailed technical specifications
- [Business Requirements](./business-requirements.md) - Functional requirements
- [Project Structure](./PROJECT_STRUCTURE.md) - Folder and module layout

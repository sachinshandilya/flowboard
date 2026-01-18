# Project Structure

This document provides a comprehensive explanation of the FlowBoard project's folder and module layout.

## Root Directory

```
flowboard/
├── src/                    # Source code directory
├── tasks/                  # Development task documentation
├── coverage/               # Test coverage reports (generated)
├── index.html             # HTML entry point
├── package.json           # Dependencies and npm scripts
├── package-lock.json      # Locked dependency versions
├── vite.config.ts         # Vite build tool configuration
├── tsconfig.json          # TypeScript configuration for application
├── tsconfig.node.json     # TypeScript configuration for Node.js tools
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .eslintrc.cjs          # ESLint linting rules
├── .gitignore             # Git ignore patterns
├── README.md              # Project overview and setup instructions
├── ARCHITECTURE.md        # System architecture documentation
├── business-requirements.md  # Business requirements document
└── technical-requirements.md # Technical requirements document
```

### Root Configuration Files

- **`index.html`** - HTML template that serves as the entry point for the application. Contains the root `<div id="root">` where React mounts.
- **`package.json`** - Defines project metadata, dependencies, and npm scripts (dev, build, test, lint, preview).
- **`vite.config.ts`** - Vite configuration including dev server settings (port 3000), React plugin, and Vitest test configuration.
- **`tsconfig.json`** - TypeScript compiler options for the application code.
- **`tsconfig.node.json`** - TypeScript configuration for Node.js tooling (Vite config, etc.).
- **`tailwind.config.js`** - Tailwind CSS utility classes configuration.
- **`postcss.config.js`** - PostCSS configuration for processing CSS (used by Tailwind).
- **`.eslintrc.cjs`** - ESLint rules and configuration for code quality checks.

---

## Source Directory (`src/`)

The `src/` directory contains all application source code, organized by concern and responsibility.

```
src/
├── components/          # React UI components
├── contexts/           # React Context providers and reducers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── test/               # Test configuration and utilities
├── styles/             # Global styles and CSS utilities
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global CSS styles
```

---

## Components (`src/components/`)

Contains all React UI components organized by feature. Each component is self-contained with its own file.

```
components/
├── __tests__/                    # Component unit tests
│   ├── AddTaskDialog.test.tsx
│   ├── Board.test.tsx
│   ├── Column.test.tsx
│   ├── ColumnHeader.test.tsx
│   ├── DeleteConfirmationDialog.test.tsx
│   ├── FilterDropdown.test.tsx
│   ├── TaskCard.test.tsx
│   ├── TaskMenu.test.tsx
│   └── ToastContainer.test.tsx
├── Board.tsx                     # Main board container component
├── Column.tsx                    # Column component (To Do, In Progress, Done)
├── ColumnHeader.tsx              # Column header with title
├── TaskCard.tsx                  # Individual task card component
├── AddTaskDialog.tsx             # Dialog for adding new tasks
├── TaskMenu.tsx                  # 3-dot menu for task actions
├── DeleteConfirmationDialog.tsx  # Confirmation dialog for task deletion
├── FilterDropdown.tsx            # Column filter dropdown component
├── ToastContainer.tsx            # Toast notification container
└── index.ts                      # Central export point for all components
```

### Component Responsibilities

- **`Board.tsx`** - Main container that renders all three columns and manages the overall board layout.
- **`Column.tsx`** - Represents a single column (To Do, In Progress, or Done) and renders its tasks.
- **`ColumnHeader.tsx`** - Displays the column title and handles column-specific UI.
- **`TaskCard.tsx`** - Individual task card with drag-and-drop support and menu trigger.
- **`AddTaskDialog.tsx`** - Modal dialog for creating new tasks in the To Do column.
- **`TaskMenu.tsx`** - Dropdown menu providing move and delete actions for tasks.
- **`DeleteConfirmationDialog.tsx`** - Confirmation modal before deleting a task.
- **`FilterDropdown.tsx`** - Dropdown filter to show tasks by column.
- **`ToastContainer.tsx`** - Renders toast notifications from the ToastContext.
- **`index.ts`** - Barrel export file for clean imports: `import { Board, Column } from './components'`.

---

## Contexts (`src/contexts/`)

Contains React Context providers and reducers for global state management.

```
contexts/
├── __tests__/              # Context and reducer tests
│   ├── boardReducer.test.ts
│   └── ToastContext.test.tsx
├── BoardContext.tsx        # Board state context provider
├── boardReducer.ts         # Reducer for board state management
└── ToastContext.tsx        # Toast notification context provider
```

### Context Responsibilities

- **`BoardContext.tsx`** - Provides board state (tasks, columns) and dispatch function to all components. Wraps the application with `BoardProvider`.
- **`boardReducer.ts`** - Reducer function handling all board-related actions (ADD_TASK, MOVE_TASK, DELETE_TASK, SET_FILTER, etc.). Uses reducer pattern for predictable state updates.
- **`ToastContext.tsx`** - Manages toast notification state and provides `showToast` function for displaying success/error/warning/info messages.

---

## Hooks (`src/hooks/`)

Contains custom React hooks that encapsulate reusable logic.

```
hooks/
├── __tests__/              # Hook unit tests
│   ├── useBoardContext.test.tsx
│   ├── useDragAndDrop.test.tsx
│   └── useLocalStorageSync.test.tsx
├── useBoardContext.ts      # Hook to access BoardContext
├── useDragAndDrop.ts       # Drag-and-drop logic hook
├── useFocusTrap.ts         # Focus trap for modals/dialogs
└── useLocalStorageSync.ts  # localStorage synchronization hook
```

### Hook Responsibilities

- **`useBoardContext.ts`** - Convenience hook to access `BoardContext` without importing `useContext` directly. Throws error if used outside provider.
- **`useDragAndDrop.ts`** - Encapsulates all drag-and-drop logic including mouse events, drop zone detection, and visual feedback. Used by `TaskCard` component.
- **`useFocusTrap.ts`** - Traps keyboard focus within modals/dialogs for accessibility. Prevents focus from escaping modal boundaries.
- **`useLocalStorageSync.ts`** - Synchronizes board state with localStorage. Handles saving, loading, and error recovery. Debounces writes for performance.

---

## Types (`src/types/`)

Contains all TypeScript type definitions, interfaces, and enums used throughout the application.

```
types/
├── AppState.ts      # Application state type definition
├── AppAction.ts     # Action types for reducer
├── Task.ts          # Task model type definition
├── ColumnType.ts    # Column type enum and constants
├── Toast.ts         # Toast notification types
└── index.ts         # Central export point for all types
```

### Type Responsibilities

- **`AppState.ts`** - Defines the shape of the application state (tasks array, filter state).
- **`AppAction.ts`** - Union type of all possible actions dispatched to the reducer.
- **`Task.ts`** - Task model interface with `id` and `title` fields.
- **`ColumnType.ts`** - Enum defining column types (`TODO`, `IN_PROGRESS`, `DONE`) and `COLUMN_TYPES` array constant.
- **`Toast.ts`** - Toast notification type definitions (`Toast`, `ToastType`).
- **`index.ts`** - Barrel export for clean type imports: `import { Task, ColumnType } from './types'`.

---

## Utils (`src/utils/`)

Contains pure utility functions and helper methods that don't depend on React.

```
utils/
├── __tests__/          # Utility function tests
│   ├── columnUtils.test.ts
│   └── localStorage.test.ts
├── columnUtils.ts      # Column-related utility functions
└── localStorage.ts     # localStorage helper functions
```

### Utility Responsibilities

- **`columnUtils.ts`** - Pure functions for column operations (getting next/previous column, column order, etc.).
- **`localStorage.ts`** - Helper functions for localStorage operations (get, set, remove, error handling). Provides abstraction over browser localStorage API.

---

## Test Directory (`src/test/`)

Contains test configuration and shared test utilities.

```
test/
├── setup.ts              # Vitest test setup configuration
└── utils/
    └── test-utils.tsx    # Shared test utilities and helpers
```

### Test Responsibilities

- **`setup.ts`** - Vitest configuration including `@testing-library/jest-dom` matchers and global test setup.
- **`utils/test-utils.tsx`** - Shared test utilities like custom render functions, mock data generators, and test helpers.

---

## Styles (`src/styles/`)

Contains global CSS files and utility styles.

```
styles/
└── utilities.css    # Custom CSS utility classes
```

### Style Responsibilities

- **`utilities.css`** - Custom utility classes and global style overrides that complement Tailwind CSS.

---

## Entry Points

### `src/main.tsx`

Application entry point that:
- Renders the React root using `ReactDOM.createRoot`
- Wraps `App` in `React.StrictMode` for development checks
- Imports global CSS files (`index.css`, `styles/utilities.css`)

### `src/App.tsx`

Root application component that:
- Sets up the provider hierarchy (`ToastProvider` → `BoardProvider`)
- Renders the main `Board` component
- Renders the `ToastContainer` for notifications

### `src/index.css`

Global CSS styles including:
- Tailwind CSS directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- CSS custom properties (variables)
- Global resets and base styles

---

## Tasks Directory (`tasks/`)

Contains development task documentation and progress tracking.

```
tasks/
├── 001-react-setup.md
├── 002-typescript-tailwind-setup.md
├── 003-data-models-types.md
├── 004-state-management-setup.md
├── 005-basic-ui-components.md
├── 006-task-crud-operations.md
├── 007-drag-and-drop-implementation.md
├── 008-column-filtering.md
├── 009-localstorage-persistence-error-handling.md
├── 010-accessibility-testing-documentation.md
└── progress.md
```

Each task file documents:
- Requirements and acceptance criteria
- Implementation approach
- Testing strategy
- Completion status

---

## Coverage Directory (`coverage/`)

Generated directory containing test coverage reports. Created when running `npm run test:coverage`.

**Note:** This directory is typically excluded from version control (via `.gitignore`).

---

## Architecture Principles

### Separation of Concerns

- **Components** - Pure UI rendering and user interaction
- **Contexts** - Global state management
- **Hooks** - Reusable business logic
- **Utils** - Pure functions and helpers
- **Types** - Type safety and contracts

### Testing Strategy

- Each module has a corresponding `__tests__/` directory
- Tests are co-located with source code for easy discovery
- Shared test utilities in `src/test/` for consistency

### Import Patterns

- Use barrel exports (`index.ts`) for clean imports
- Prefer named exports over default exports
- Group imports: external → internal → relative

### File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useDragAndDrop.ts`)
- Utils: `camelCase.ts` (e.g., `columnUtils.ts`)
- Types: `PascalCase.ts` (e.g., `AppState.ts`)
- Tests: `*.test.tsx` or `*.test.ts`

---

## Module Dependencies

```
main.tsx
  └── App.tsx
      ├── contexts/ToastContext
      ├── contexts/BoardContext
      │   └── boardReducer
      ├── components/Board
      │   ├── components/Column
      │   │   ├── components/ColumnHeader
      │   │   └── components/TaskCard
      │   │       ├── hooks/useDragAndDrop
      │   │       └── components/TaskMenu
      │   ├── components/FilterDropdown
      │   └── components/AddTaskDialog
      │       └── hooks/useFocusTrap
      └── components/ToastContainer
```

**State Flow:**
- `BoardContext` manages board state via `boardReducer`
- Components consume state via `useBoardContext` hook
- Actions dispatched to reducer update state
- `useLocalStorageSync` syncs state with localStorage
- `ToastContext` provides notification system

---

## Key Design Decisions

1. **Context + Reducer Pattern** - Centralized state management without external libraries
2. **Custom Hooks** - Encapsulate complex logic (drag-and-drop, localStorage sync)
3. **Barrel Exports** - Clean import statements via `index.ts` files
4. **Co-located Tests** - Tests live next to source code in `__tests__/` directories
5. **TypeScript First** - All code is typed with interfaces and types in dedicated directory
6. **Pure Utils** - Utility functions are framework-agnostic and easily testable

---

This structure promotes maintainability, testability, and scalability while keeping the codebase organized and easy to navigate.

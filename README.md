# FlowBoard

A lightweight Kanban board application built with React 18, TypeScript, and Vite. FlowBoard provides a simple task management interface with drag-and-drop functionality, column filtering, and local persistence.

## About

FlowBoard is a desktop-focused Kanban board application inspired by Trello and Jira. It enables users to organize tasks across three fixed columns (To Do, In Progress, Done) with intuitive drag-and-drop interactions. The application uses localStorage for persistence, making it fully functional offline without requiring any backend infrastructure.

### Key Features

- **Three Fixed Columns**: To Do, In Progress, and Done
- **Drag-and-Drop**: Native browser-based drag-and-drop with visual feedback
- **Task Management**: Add, move, and delete tasks with confirmation dialogs
- **Column Filtering**: Filter tasks by column to focus on specific statuses
- **Local Persistence**: Automatic saving to localStorage with error handling
- **Accessibility**: ARIA labels and keyboard navigation support
- **Responsive UI**: Clean, minimal design with toast notifications

## Project Structure

```
flowboard/
├── src/
│   ├── components/     # React components (Board, Column, TaskCard, etc.)
│   ├── contexts/       # React contexts (BoardContext, ToastContext)
│   ├── hooks/          # Custom React hooks (useDragAndDrop, useLocalStorageSync)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (localStorage, columnUtils)
│   ├── test/           # Test setup and utilities
│   └── App.tsx         # Main App component
├── tasks/              # Development task documentation
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** package manager

### Installation

Install project dependencies:

```bash
npm install
```

## Development

### Start Development Server

Start the local development server:

```bash
npm run dev
# or
npm start
```

The application will be available at **http://localhost:3000**

The development server supports hot module replacement (HMR) for instant updates during development.

### Run Tests

Run the test suite:

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

## Building for Production

### Build

Create an optimized production build:

```bash
npm run build
```

This command:
1. Type-checks the code using TypeScript (`tsc`)
2. Builds the application using Vite
3. Outputs optimized files to the `dist/` directory

### Preview Production Build

Preview the production build locally before deployment:

```bash
npm run preview
```

This serves the production build from the `dist/` directory, allowing you to test the optimized version locally.

## Technology Stack

- **React 18** - UI library with modern hooks and patterns
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Fast unit test framework
- **ESLint** - Code linting and quality checks

## Documentation

- **[Business Requirements](./business-requirements.md)** - Complete functional and technical requirements
- **[Architecture](./ARCHITECTURE.md)** - System architecture and design decisions
- **[Technical Requirements](./technical-requirements.md)** - Detailed technical specifications

## Development Status

This project is currently in active development. See `tasks/progress.md` for current status and completed features.

## License

This project is private and proprietary.

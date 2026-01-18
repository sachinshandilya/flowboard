# FlowBoard - Business Requirements Document

**Document Version:** 1.0  
**Last Updated:** Based on requirements discussion  
**Status:** Approved for Implementation

---

## Problem Statement

To empower engineers to think deeply about state management, design trade-offs, and AI-native development practices, we are building a lightweight Kanban board application, codenamed FlowBoard.

The vision is to create a simple task management tool that mimics the core interactions of Trello but with reduced scope, focusing on component design, drag-drop interactions, and iterative AI-assisted development.

**Note:** For this assignment, localStorage will be used as the persistence layer. No API integration is required.

---

## Functional Requirements

| Requirement ID | Description | User Story | Expected Behavior/Outcome |
|----------------|-------------|------------|---------------------------|
| FR001 | Three Fixed Columns | As a user, I want to see three distinct columns (To Do, In Progress, Done) so I can organize my tasks by their current status. | The board displays three fixed columns with equal width (33% each): To Do (left), In Progress (middle), and Done (right). Each column displays its tasks vertically. |
| FR002 | Task Data Model | As a user, I want to create simple tasks with just a title so I can quickly capture what needs to be done without complexity. | Tasks contain only a title field. No description, due date, priority, assignee, tags, or timestamps are included. |
| FR003 | Add Task to To Do Column | As a user, I want to add new tasks to the To Do column so I can start tracking work items. | An "Add Task" button is placed at the top of the To Do column. Clicking the button opens a dialog where users can enter a task title. Upon submission, the task is added to the To Do column. |
| FR004 | Move Task via Drag-and-Drop | As a user, I want to drag and drop tasks between columns and reorder them within columns so I can easily manage task flow. | Tasks can be dragged and dropped across columns (To Do ↔ In Progress ↔ Done). Tasks can be reordered within the same column. No constraints on movement direction (can move forward or backward). Visual feedback includes ghost preview, drop zone highlighting, and opacity changes similar to Jira/Trello. |
| FR005 | Move Task via 3-Dot Menu | As a user, I want to move tasks using menu options so I have an alternative to drag-and-drop for keyboard accessibility. | Each task card has a 3-dot menu containing move options. Users can move tasks left/right or to specific columns (To Do, In Progress, Done) using menu options. |
| FR006 | Delete Task | As a user, I want to delete tasks that are no longer needed so I can keep my board clean and organized. | Delete option is available in the 3-dot menu on each task card. A confirmation dialog appears before deletion. Upon confirmation, the task is deleted immediately. No undo functionality is available. |
| FR007 | Filter Tasks by Column | As a user, I want to filter tasks by column so I can focus on tasks in a specific status. | A column filter dropdown is displayed at the top of the board (above all columns). Filtering shows only tasks from the selected column. Default option is "All Columns" which shows all tasks. |
| FR008 | localStorage Persistence | As a user, I want my tasks to persist across page refreshes so I don't lose my work. | Tasks are stored in component state and synchronized with localStorage on every change (real-time persistence). State is loaded from localStorage on mount. When users refresh the page, they see their previous state exactly as they left off. localStorage is the source of truth. |

---

## UI/UX Requirements

| Requirement ID | Description | User Story | Expected Behavior/Outcome |
|----------------|-------------|------------|---------------------------|
| UX001 | Three-Column Layout | As a user, I want a clear, organized layout so I can easily see all my tasks at a glance. | The board displays three columns with equal width (33% each). Tasks are displayed vertically within each column. Filter dropdown is positioned at the top of the board above all columns. |
| UX002 | Task Card Design | As a user, I want task cards to be simple and clear so I can quickly understand what needs to be done. | Each task card displays the task title and a 3-dot menu button. Card styling is basic/minimal, similar to Jira/Trello style (not overly fancy). The 3-dot menu is positioned on the right side of the card. |
| UX003 | Visual Feedback During Drag | As a user, I want clear visual feedback when dragging tasks so I know where the task will be dropped. | During drag-and-drop: a ghost/preview of the dragged task follows the cursor, drop zones are highlighted (column borders and insertion points), task opacity changes (dragged task becomes semi-transparent), providing a visual experience similar to Jira/Trello. |
| UX004 | Add Task Button Placement | As a user, I want easy access to add new tasks so I can quickly capture ideas. | The "Add Task" button is located at the top of the To Do column. The button is clear and visible. Clicking the button opens a dialog modal with an input field. |
| UX005 | 3-Dot Menu Implementation | As a user, I want a menu that provides task actions so I can manage tasks efficiently. | The 3-dot menu is a custom implementation (no external libraries). It contains move options (move left/right or to specific columns) and delete option. The menu is accessible and user-friendly, closes on outside click, and supports keyboard navigation (Arrow keys, Enter, Escape). |

---

## Technical Requirements

| Requirement ID | Description | User Story | Expected Behavior/Outcome |
|----------------|-------------|------------|---------------------------|
| TR001 | React 18 Technology Stack | As a developer, I want to use React 18 so I can leverage modern React features and patterns. | The application is built using React 18. Standard React architecture pattern is followed (components/, utils/, hooks/, types/, etc.). Code compiles and runs locally using `npm run start`. |
| TR002 | Native Drag-and-Drop Implementation | As a developer, I want to implement drag-and-drop using native browser events so I have full control and no external dependencies. | Drag-and-drop uses native browser events only (mousedown, mousemove, mouseup, etc.). No external drag-drop libraries are used (react-dnd, interact.js, konva.js, etc.). Implementation uses React core features only. |
| TR003 | localStorage Persistence | As a developer, I want to use localStorage for persistence so the application works offline without API dependencies. | localStorage is used as the persistence layer. No API integration is required. Data persists across page refreshes. State syncs with localStorage on every change (debounced for performance, immediate for critical operations). |
| TR004 | Custom Implementations | As a developer, I want custom implementations for UI components so I have full control and no external dependencies. | The 3-dot menu dropdown is a custom implementation. Toast notifications are custom implementations. Drag-and-drop uses native browser events. No external UI libraries are used for these features. |
| TR005 | Browser Support | As a user, I want the application to work in major browsers so I can use it regardless of my browser choice. | The application supports major browser versions: Chrome, Firefox, Safari, Edge (latest versions). Modern browser features are used (localStorage, ES6+). |
| TR006 | Desktop-Only Design | As a developer, I want to focus on desktop experience first so I can deliver a polished desktop application. | The application is designed for desktop only. No mobile/tablet support is required at this time. Layout is fixed-width (three columns, 33% each). |
| TR007 | Code Execution | As a developer, I want the code to run locally so I can develop and test easily. | Code compiles and runs locally using `npm run start`. No build configuration issues. Application starts and functions correctly in local development environment. |

---

## Non-Functional Requirements

| Requirement ID | Description | User Story | Expected Behavior/Outcome |
|----------------|-------------|------------|---------------------------|
| NFR001 | Accessibility with ARIA Labels | As a user with assistive technologies, I want the application to be accessible so I can use it effectively. | Basic ARIA labels are provided for all interactive elements (buttons, drag handles), task cards, and menu items. The application is accessible to screen readers. Keyboard navigation is supported (Tab, Enter, Space keys). |
| NFR002 | Error Handling with Toast Notifications | As a user, I want to be informed when errors occur so I understand what went wrong. | If localStorage fails (quota exceeded, disabled, corrupted data), a toast error notification is shown to the user. The application handles errors gracefully without breaking. If localStorage data is corrupted on load, an error toast is shown on load and the application handles it gracefully. |
| NFR003 | Performance | As a user, I want the application to perform well regardless of the number of tasks so I can work efficiently. | There are no limitations on the number of tasks per column. The application handles large numbers of tasks without performance degradation. No specific performance benchmarks are required at this time, but the application should feel responsive. |
| NFR004 | Unit Testing | As a developer, I want comprehensive tests so I can ensure the application works correctly. | Unit tests are implemented using React Testing Library. Tests cover components, functions, and utility methods. Testing is added at the end of development. Critical paths are tested (task CRUD, drag-and-drop, filtering, localStorage persistence, error handling). |
| NFR005 | Architecture Documentation | As a developer, I want architecture documentation so I can understand the system design and decisions. | An ARCHITECTURE.md document is created containing: chosen architectural pattern, component hierarchy diagram, state management explanation, and explanation of why drag-drop was implemented the chosen way. Documentation includes decision rationale for major choices. |

---

## Edge Cases and Constraints

| Requirement ID | Description | User Story | Expected Behavior/Outcome |
|----------------|-------------|------------|---------------------------|
| EC001 | Empty Columns | As a user, I want empty columns to display normally so the board layout remains consistent. | If a column is empty, it displays normally with no special handling required. Empty columns show the column header and remain available for dropping tasks. |
| EC002 | Concurrent Drag Operations | As a user, I want to drag one task at a time so the interface remains clear and predictable. | It is not possible for a user to drag multiple tasks simultaneously. Only one drag operation can occur at a time. The system prevents concurrent drag operations. |
| EC003 | localStorage Failures | As a user, I want the application to continue working even if localStorage fails so I don't lose functionality. | If localStorage quota is exceeded, a toast error is shown and the application continues with in-memory state. If localStorage is disabled, a toast error is shown and the application continues with in-memory state. If localStorage data is corrupted, an error toast is shown on load and the application handles it gracefully (resets to empty state or recovers if possible). |
| EC004 | Data Validation | As a user, I want invalid data to be handled gracefully so the application doesn't break. | Task titles are validated (cannot be empty). Invalid data in localStorage is handled gracefully (shows error toast, resets to empty state if necessary). The application never crashes due to invalid data. |

---

## Success Criteria

### Must-Have Features

All features described in this document are **must-haves**:

- ✅ Three fixed columns (To Do, In Progress, Done)
- ✅ Add task functionality (button in To Do column)
- ✅ Drag-and-drop to move tasks (primary method)
- ✅ Move buttons in 3-dot menu (secondary method)
- ✅ Delete task functionality (with confirmation dialog)
- ✅ Task reordering within columns
- ✅ Column filtering (dropdown at top)
- ✅ localStorage persistence (source of truth)
- ✅ Visual feedback during drag-and-drop
- ✅ Error handling with toast notifications
- ✅ Accessibility with ARIA labels
- ✅ Unit tests (React Testing Library)
- ✅ ARCHITECTURE.md documentation

### Evaluation Criteria

- Code compiles and runs locally (`npm run start`)
- All functional requirements are implemented
- All non-functional requirements are met
- Code follows React best practices
- Tests are comprehensive (30-40% coverage on critical paths)
- Documentation is complete

---

## Out of Scope

The following features are explicitly **out of scope** for this version:

- API integration
- User authentication
- Multiple boards
- Task descriptions or additional metadata
- Due dates, priorities, assignees
- Mobile/tablet support
- Undo/redo functionality
- Task search (beyond column filtering)
- Task comments or attachments
- Collaboration features

---

## Assumptions

1. Users are familiar with Kanban board interfaces (Trello/Jira).
2. Desktop environment is the primary use case.
3. Modern browsers with localStorage support are available.
4. No network connectivity is required (localStorage only).

---

## Future Considerations (Not in Current Scope)

The following features may be considered for future versions:

- Mobile/tablet responsive design
- API integration for cloud persistence
- Task descriptions and additional metadata
- User authentication and multi-user support
- Undo/redo functionality
- Advanced filtering and search
- Task comments and attachments

---

## Related Documents

- **Technical Requirements:** See `technical-requirements.md` for detailed technical decisions, architecture, and implementation details.
- **Architecture Documentation:** See `ARCHITECTURE.md` (to be created after implementation) for component hierarchy, state management, and design decisions.

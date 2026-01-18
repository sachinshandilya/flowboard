# Task 006: Task CRUD Operations

## Objective
Implement Create, Read, Update, and Delete operations for tasks.

## Requirements
- Create AddTaskDialog component (Portal-based modal)
- Implement "Add Task" button in To Do column
- Create TaskMenu component (3-dot menu, Portal-based)
- Implement move task functionality (move left/right, move to specific column)
- Implement delete task functionality with confirmation dialog
- Create DeleteConfirmationDialog component
- Implement task reordering within columns (update order field)
- Add form validation (non-empty task title)

## Deliverables
- [ ] AddTaskDialog component created and functional
- [ ] "Add Task" button opens dialog and adds task to To Do column
- [ ] TaskMenu component created with move and delete options
- [ ] Move left/right functionality works
- [ ] Move to specific column functionality works
- [ ] Delete task with confirmation dialog works
- [ ] Task reordering within columns works (order field updates)
- [ ] Form validation prevents empty task titles
- [ ] All operations update state correctly

## Technical Notes
- AddTaskDialog: Portal-based, focus management, close on backdrop/Escape
- TaskMenu: Portal-based, positioned absolutely, keyboard navigation support
- DeleteConfirmationDialog: Shows before deletion, no undo functionality
- Task reordering: Update `order` field when moving tasks
- State updates: Use reducer actions (ADD_TASK, MOVE_TASK, DELETE_TASK)
- Menu options: Move Left (if not first column), Move Right (if not last column), Move to specific columns, Delete

## Dependencies
- Task 005: Basic UI Components Structure
- Task 004: State Management Setup

## Related Requirements
- FR003: Add Task to To Do Column
- FR005: Move Task via 3-Dot Menu
- FR006: Delete Task
- UX004: Add Task Button Placement
- UX005: 3-Dot Menu Implementation
- Section 6: UI Components

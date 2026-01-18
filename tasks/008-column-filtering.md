# Task 008: Column Filtering Functionality

## Objective
Implement column filtering functionality with dropdown at board level.

## Requirements
- Create FilterDropdown component
- Position dropdown at top of board (above all columns)
- Implement filter options: "All Columns", "To Do", "In Progress", "Done"
- Default filter: "All Columns"
- Filter tasks based on selected column
- Update filter state in reducer
- Use useMemo for filtered tasks computation

## Deliverables
- [ ] FilterDropdown component created
- [ ] Dropdown positioned at top of board
- [ ] Filter options display correctly
- [ ] Default filter is "All Columns"
- [ ] Filtering shows only tasks from selected column
- [ ] "All Columns" shows all tasks
- [ ] Filter state updates correctly
- [ ] Filtered tasks computed efficiently (useMemo)

## Technical Notes
- FilterDropdown: Custom dropdown implementation (no external libraries)
- Filter state: Stored in AppState (filter: ColumnType | 'all')
- Filtered tasks: Computed selector using useMemo (not separate state)
- Task filtering: Filter tasks array by columnId when filter is not 'all'
- Single source of truth: Tasks array, filter is computed state

## Dependencies
- Task 005: Basic UI Components Structure
- Task 004: State Management Setup

## Related Requirements
- FR007: Filter Tasks by Column
- UX001: Three-Column Layout
- Decision 9: Filtering as Computed State

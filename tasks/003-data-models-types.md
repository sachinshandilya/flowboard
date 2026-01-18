# Task 003: Data Models & TypeScript Types

## Objective
Define all data models, TypeScript interfaces, and enums required for the application.

## Requirements
- Define Task interface (id, title, columnId, order)
- Define ColumnType enum (TODO, IN_PROGRESS, DONE)
- Define AppState interface (tasks, filter, ui state)
- Define AppAction types for reducer
- Define Toast interface
- Create COLUMN_TYPES constant array

## Deliverables
- [ ] Task interface defined
- [ ] ColumnType enum defined
- [ ] AppState interface defined
- [ ] AppAction union type defined
- [ ] Toast interface defined
- [ ] COLUMN_TYPES constant array created
- [ ] All types exported from types/ directory

## Technical Notes
- Task ID: Use timestamp (`Date.now().toString()`)
- Task order: Explicit `order` field (number), not array index
- State shape: Flat array `Task[]` with `columnId` field
- Column types: Single source of truth from COLUMN_TYPES array

## Dependencies
- Task 002: TypeScript & TailwindCSS Configuration

## Related Requirements
- Section 2: Data Models
- Section 11: TypeScript Configuration
- Decision 2: Flat Array vs Nested Object
- Decision 3: Explicit Order Field vs Array Index
- Decision 8: Timestamp-based Task IDs

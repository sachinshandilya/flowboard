# Task 005: Basic UI Components Structure

## Objective
Create the basic UI component structure for Board, Column, and TaskCard components.

## Requirements
- Create Board component (main container, three-column layout)
- Create Column component (displays column header, renders task cards)
- Create TaskCard component (displays task title, 3-dot menu button)
- Create ColumnHeader component
- Implement three-column layout (33% width each)
- Position 3-dot menu button on right side of task card
- Apply basic styling (TailwindCSS, Jira/Trello-inspired minimal design)

## Deliverables
- [ ] Board component created with three-column layout
- [ ] Column component created (mapped from COLUMN_TYPES)
- [ ] TaskCard component created
- [ ] ColumnHeader component created
- [ ] Three columns display correctly (To Do, In Progress, Done)
- [ ] Basic styling applied (white cards, subtle shadows, rounded corners)
- [ ] Components render without errors (using mock/empty data)

## Technical Notes
- Map columns from COLUMN_TYPES constant array
- TaskCard: Simple display of title and 3-dot menu button (menu functionality in next task)
- Use React.memo for Column and TaskCard (performance optimization)
- Portal-based components (modals, menus) will be added in later tasks
- No functionality yet - just structure and styling

## Dependencies
- Task 004: State Management Setup
- Task 002: TypeScript & TailwindCSS Configuration

## Related Requirements
- Section 3: Component Architecture
- UX001: Three-Column Layout
- UX002: Task Card Design
- Decision 7: Portal-based Modals and Menus (will be implemented later)

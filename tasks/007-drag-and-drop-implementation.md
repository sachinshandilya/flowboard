# Task 007: Drag-and-Drop Implementation

## Objective
Implement native drag-and-drop functionality using custom mouse events.

## Requirements
- Implement drag start (mousedown on task card)
- Implement drag move (mousemove) with ghost preview
- Implement drag end (mouseup) with drop zone detection
- Create visual feedback (ghost preview, drop zone highlighting, opacity changes)
- Implement drop zone detection algorithm
- Handle task movement between columns
- Handle task reordering within columns
- Optimize performance (requestAnimationFrame, throttling)

## Deliverables
- [ ] Drag start functionality (mousedown sets draggedTaskId)
- [ ] Ghost preview element follows cursor
- [ ] Drop zone highlighting (column borders, insertion indicators)
- [ ] Opacity changes during drag (dragged task 0.3, hovered tasks 0.7)
- [ ] Drop zone detection calculates correct column and insertion index
- [ ] Tasks can be dragged between columns
- [ ] Tasks can be reordered within columns
- [ ] Visual feedback matches Jira/Trello-like experience
- [ ] Performance optimizations applied (requestAnimationFrame, throttling)

## Technical Notes
- Use native browser events: mousedown, mousemove, mouseup (no HTML5 Drag API)
- Ghost preview: Fixed position, follows cursor, opacity 0.5, slight scale
- Drop zone detection: Use getBoundingClientRect(), calculate mouse Y position
- Insertion points: Show line between tasks, allow drop at top/bottom
- Empty columns: Show drop zone indicator in center
- State updates: SET_DRAG_STATE action for UI state, MOVE_TASK for final drop
- Performance: Throttle mousemove (16ms = 60fps), use requestAnimationFrame

## Dependencies
- Task 006: Task CRUD Operations
- Task 005: Basic UI Components Structure

## Related Requirements
- FR004: Move Task via Drag-and-Drop
- UX003: Visual Feedback During Drag
- TR002: Native Drag-and-Drop Implementation
- Section 4: Drag-and-Drop Implementation
- Decision 4: Custom Drag-and-Drop vs HTML5 API

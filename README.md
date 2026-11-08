# Task 3: JavaScript Logic & State Management (To-Do List App)

## Overview
A client-side task management application built to master vanilla DOM manipulation, event delegation architecture, state-driven rendering, and data persistence via `window.localStorage`.

---

## Key Features & Evaluation Criteria

### 1. Full CRUD (Create, Read, Update, Delete)
- **Create:** Add tasks with title, priority (Low, Medium, High), category, and due date.
- **Read:** Render tasks dynamically with responsive badges, remaining item count, and empty state illustrations.
- **Update:**
  - Toggle completion checkbox to transition task between active and completed.
  - Double-click task title or click the edit (`✎`) button to trigger inline DOM editing with <kbd>Enter</kbd> (save) and <kbd>Esc</kbd> (cancel) shortcuts.
- **Delete:** Individual task deletion (`🗑`) or bulk deletion via the "Clear completed" control.

### 2. Automatic Persistence (`window.localStorage`)
- Every mutation (add, edit, toggle, delete, clear) immediately synchronizes with `localStorage`.
- Automatically restores prior session state upon browser reloads.

### 3. Advanced Multi-Criteria Filtering
- **Status Tabs:** "All", "Active", and "Completed" filters.
- **Real-Time Search:** Dynamic substring match across task titles and categories.

### 4. Dynamic DOM & Event Delegation
- Single delegated event listener attached to the parent `<ul>` element. Handles dynamic child additions/removals with maximum memory efficiency.

### 5. Accessibility
- Tab-navigable inputs.
- ARIA live status region for assistive technology announcements.

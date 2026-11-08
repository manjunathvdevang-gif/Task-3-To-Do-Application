/**
 * State-Driven To-Do List Application
 * Features: Full CRUD, LocalStorage Persistence, Delegated Events, Dynamic DOM, Advanced Filtering
 */

(function () {
  'use strict';

  // --- Constants & Storage ---
  const STORAGE_KEY = 'todo_app_tasks_v1';
  const THEME_KEY = 'todo_app_theme';

  // Default seed tasks if storage is empty
  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Audit portfolio website for WCAG AA 100% compliance',
      completed: true,
      priority: 'high',
      category: 'Accessibility',
      dueDate: '2026-10-15',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'task-2',
      title: 'Architect CSS Grid layout for multi-page showcase',
      completed: true,
      priority: 'medium',
      category: 'Design',
      dueDate: '2026-10-20',
      createdAt: Date.now() - 86400000
    },
    {
      id: 'task-3',
      title: 'Connect live REST Weather API with async/await and error boundaries',
      completed: false,
      priority: 'high',
      category: 'Development',
      dueDate: '2026-11-10',
      createdAt: Date.now()
    },
    {
      id: 'task-4',
      title: 'Deploy Capstone E-Commerce Single Page Application to production',
      completed: false,
      priority: 'medium',
      category: 'Deployment',
      dueDate: '2026-11-15',
      createdAt: Date.now() + 1000
    }
  ];

  // --- Application State ---
  const state = {
    tasks: loadTasksFromStorage(),
    filter: 'all', // 'all' | 'active' | 'completed'
    searchQuery: '',
    editingTaskId: null
  };

  // --- LocalStorage Layer ---
  function loadTasksFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      return DEFAULT_TASKS;
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }

  // --- DOM Elements ---
  const elements = {
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    prioritySelect: document.getElementById('priority-select'),
    categorySelect: document.getElementById('category-select'),
    dueDateInput: document.getElementById('due-date-input'),
    taskList: document.getElementById('task-list'),
    searchInput: document.getElementById('search-input'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    itemsLeftCount: document.getElementById('items-left-count'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    liveRegion: document.getElementById('live-region')
  };

  // Helper for Screen Reader Announcements
  function announceToScreenReader(message) {
    if (elements.liveRegion) {
      elements.liveRegion.textContent = message;
    }
  }

  // --- CRUD Operations ---

  // 1. CREATE: Add new task
  function addTask(title, priority = 'medium', category = 'General', dueDate = '') {
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: title.trim(),
      completed: false,
      priority: priority,
      category: category,
      dueDate: dueDate,
      createdAt: Date.now()
    };

    state.tasks.unshift(newTask);
    saveTasksToStorage();
    render();
    announceToScreenReader(`Task "${newTask.title}" added successfully.`);
  }

  // 2. READ: Get filtered tasks based on state
  function getFilteredTasks() {
    return state.tasks.filter((task) => {
      // Status filter
      if (state.filter === 'active' && task.completed) return false;
      if (state.filter === 'completed' && !task.completed) return false;

      // Search query filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        return matchesTitle || matchesCategory;
      }

      return true;
    });
  }

  // 3. UPDATE: Toggle complete or modify fields
  function toggleTaskCompletion(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasksToStorage();
      render();
      announceToScreenReader(`Task "${task.title}" marked as ${task.completed ? 'completed' : 'active'}.`);
    }
  }

  function updateTaskTitle(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      deleteTask(id);
      return;
    }

    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.title = trimmed;
      state.editingTaskId = null;
      saveTasksToStorage();
      render();
      announceToScreenReader(`Task title updated to "${trimmed}".`);
    }
  }

  // 4. DELETE: Remove task
  function deleteTask(id) {
    const taskIndex = state.tasks.findIndex((t) => t.id === id);
    if (taskIndex > -1) {
      const removed = state.tasks.splice(taskIndex, 1)[0];
      saveTasksToStorage();
      render();
      announceToScreenReader(`Task "${removed.title}" deleted.`);
    }
  }

  function clearCompletedTasks() {
    const countBefore = state.tasks.length;
    state.tasks = state.tasks.filter((t) => !t.completed);
    const removedCount = countBefore - state.tasks.length;
    if (removedCount > 0) {
      saveTasksToStorage();
      render();
      announceToScreenReader(`Cleared ${removedCount} completed tasks.`);
    }
  }

  // --- Dynamic DOM Element Generator ---
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // Check if this task is being edited
    const isEditing = state.editingTaskId === task.id;

    if (isEditing) {
      li.innerHTML = `
        <div class="task-left" style="width: 100%;">
          <input type="text" class="inline-edit-input" value="${escapeHtml(task.title)}" aria-label="Edit task title">
        </div>
        <div class="task-actions">
          <button type="button" class="action-btn save-btn" data-action="save-edit" title="Save changes" aria-label="Save changes">✓</button>
          <button type="button" class="action-btn cancel-btn" data-action="cancel-edit" title="Cancel edit" aria-label="Cancel edit">✕</button>
        </div>
      `;
      // Auto focus inline input
      setTimeout(() => {
        const input = li.querySelector('.inline-edit-input');
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
      return li;
    }

    // Normal Read Mode
    li.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''} 
          data-action="toggle" 
          aria-label="Mark task '${escapeHtml(task.title)}' as ${task.completed ? 'incomplete' : 'complete'}"
        >
        <div class="task-details">
          <span class="task-title" data-action="start-edit" title="Double click to edit">${escapeHtml(task.title)}</span>
          <div class="task-tags">
            <span class="badge badge-${task.priority}">${task.priority}</span>
            <span class="badge badge-category">${escapeHtml(task.category)}</span>
            ${task.dueDate ? `<span class="badge-date">📅 ${escapeHtml(task.dueDate)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button type="button" class="action-btn edit-btn" data-action="start-edit" title="Edit task" aria-label="Edit task">✎</button>
        <button type="button" class="action-btn delete-btn" data-action="delete" title="Delete task" aria-label="Delete task">🗑</button>
      </div>
    `;

    return li;
  }

  // --- Render Function ---
  function render() {
    const filteredTasks = getFilteredTasks();
    elements.taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.innerHTML = `
        <div class="empty-icon" aria-hidden="true">${state.searchQuery ? '🔍' : '✨'}</div>
        <p><strong>${state.searchQuery ? 'No matching tasks found' : 'No tasks in this view'}</strong></p>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">${state.searchQuery ? 'Try clearing your search query' : 'Add a new task using the form above!'}</p>
      `;
      elements.taskList.appendChild(emptyDiv);
    } else {
      const fragment = document.createDocumentFragment();
      filteredTasks.forEach((task) => {
        fragment.appendChild(createTaskElement(task));
      });
      elements.taskList.appendChild(fragment);
    }

    // Update Remaining Active Count
    const activeCount = state.tasks.filter((t) => !t.completed).length;
    elements.itemsLeftCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;

    // Update Filter Tab UI
    elements.filterTabs.forEach((tab) => {
      const filter = tab.dataset.filter;
      if (filter === state.filter) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });
  }

  // --- Delegated Event Listeners on `elements.taskList` ---
  // Using event delegation: single listener on parent handles all dynamic child elements
  elements.taskList.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    const taskId = taskItem.dataset.id;
    const action = actionEl.dataset.action;

    if (action === 'toggle') {
      toggleTaskCompletion(taskId);
    } else if (action === 'delete') {
      deleteTask(taskId);
    } else if (action === 'start-edit') {
      state.editingTaskId = taskId;
      render();
    } else if (action === 'save-edit') {
      const input = taskItem.querySelector('.inline-edit-input');
      if (input) {
        updateTaskTitle(taskId, input.value);
      }
    } else if (action === 'cancel-edit') {
      state.editingTaskId = null;
      render();
    }
  });

  // Double click on title to trigger edit
  elements.taskList.addEventListener('dblclick', (e) => {
    const titleEl = e.target.closest('.task-title');
    if (titleEl) {
      const taskItem = titleEl.closest('.task-item');
      if (taskItem) {
        state.editingTaskId = taskItem.dataset.id;
        render();
      }
    }
  });

  // Delegated Keydown handling (Enter to save inline edit, Esc to cancel)
  elements.taskList.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('inline-edit-input')) {
      const taskItem = e.target.closest('.task-item');
      const taskId = taskItem.dataset.id;

      if (e.key === 'Enter') {
        e.preventDefault();
        updateTaskTitle(taskId, e.target.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        state.editingTaskId = null;
        render();
      }
    }
  });

  // --- Form Submit Handler ---
  elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.taskInput.value.trim();
    if (!title) return;

    const priority = elements.prioritySelect.value;
    const category = elements.categorySelect.value;
    const dueDate = elements.dueDateInput.value;

    addTask(title, priority, category, dueDate);

    // Reset Form
    elements.taskForm.reset();
    elements.taskInput.focus();
  });

  // --- Filter Tabs Event Listeners ---
  elements.filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.filter = tab.dataset.filter;
      render();
    });
  });

  // --- Search Input Listener ---
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    render();
  });

  // --- Clear Completed Tasks ---
  elements.clearCompletedBtn.addEventListener('click', () => {
    clearCompletedTasks();
  });

  // --- Theme Toggler ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    elements.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // --- Helper: HTML Sanitizer ---
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initialization ---
  initTheme();
  render();
})();

/**
 * Creates a new task
 */
export const createTask = (title, category, deadline) => ({
  id: Date.now(),
  title,
  category,
  deadline: deadline.toISOString().split("T")[0],
});

/**
 * Adds a task immutably
 */
export const addTask = (tasks, task) => [...tasks, task];

/**
 * Deletes a task by ID
 */
export const deleteTask = (tasks, id) => tasks.filter((t) => t.id !== id);

/**
 * Updates a task by ID (pure)
 */
export const updateTask = (tasks, id, updates) =>
  tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));

/**
 * Filters tasks by a predicate
 */
export const filterTasks = (tasks, predicate) => tasks.filter(predicate);

/**
 * Sorts tasks immutably
 */
export const sortTasks = (tasks, key, direction = "asc") =>
  [...tasks].sort((a, b) => {
    if (key === "deadline") {
      return direction === "asc"
        ? new Date(a.deadline) - new Date(b.deadline)
        : new Date(b.deadline) - new Date(a.deadline);
    }
    if (key === "title") {
      return direction === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    return 0;
  });

import axios from 'axios';

/**
 * PM Task Service
 * Handles all task management operations for Project Managers
 */

// ============================================
// TASK CRUD OPERATIONS
// ============================================

/**
 * Create a new task in a project
 * @param {string} projectId - Project ID
 * @param {object} taskData - Task details
 * @returns {Promise} Created task
 */
export const createTask = async (projectId, taskData) => {
  try {
    const response = await axios.post(`/api/pm/projects/${projectId}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

/**
 * Get all tasks for a project
 * @param {string} projectId - Project ID
 * @param {object} filters - Optional filters (status, assignee, priority)
 * @returns {Promise} List of tasks
 */
export const getProjectTasks = async (projectId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.type) params.append('type', filters.type); // main, subtask, all
    
    const queryString = params.toString();
    const url = `/api/pm/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Get project tasks error:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} taskId - Task ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const response = await axios.put(`/api/pm/tasks/${taskId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await axios.delete(`/api/pm/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};

// ============================================
// PROJECT SETTINGS
// ============================================

/**
 * Update project settings (e.g., allowTeamLeaderSubtasks)
 * @param {string} projectId - Project ID
 * @param {object} settings - Settings to update
 * @returns {Promise} Updated project
 */
export const updateProjectSettings = async (projectId, settings) => {
  try {
    const response = await axios.put(`/api/pm/projects/${projectId}/settings`, settings);
    return response.data;
  } catch (error) {
    console.error('Update project settings error:', error);
    throw error;
  }
};

// ============================================
// TASK DEPENDENCIES
// ============================================

/**
 * Add a dependency to a task
 * @param {string} taskId - Task ID
 * @param {string} dependencyId - ID of task that this task depends on
 * @returns {Promise} Updated task
 */
export const addTaskDependency = async (taskId, dependencyId) => {
  try {
    const response = await axios.post(`/api/pm/tasks/${taskId}/dependencies`, {
      dependencyId
    });
    return response.data;
  } catch (error) {
    console.error('Add task dependency error:', error);
    throw error;
  }
};

/**
 * Remove a dependency from a task
 * @param {string} taskId - Task ID
 * @param {string} dependencyId - ID of dependency to remove
 * @returns {Promise} Updated task
 */
export const removeTaskDependency = async (taskId, dependencyId) => {
  try {
    const response = await axios.delete(`/api/pm/tasks/${taskId}/dependencies/${dependencyId}`);
    return response.data;
  } catch (error) {
    console.error('Remove task dependency error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate blocking status based on dependencies
 * @param {array} dependencies - Array of dependency tasks
 * @returns {string} Blocking status (not_blocked, waiting, blocked)
 */
export const calculateBlockingStatus = (dependencies = []) => {
  if (!dependencies || dependencies.length === 0) {
    return 'not_blocked';
  }

  const hasBlockedDependency = dependencies.some(dep => 
    dep.status !== 'completed' && dep.status !== 'review'
  );

  if (hasBlockedDependency) {
    const allInProgress = dependencies.every(dep => 
      dep.status === 'in_progress' || dep.status === 'completed' || dep.status === 'review'
    );
    return allInProgress ? 'waiting' : 'blocked';
  }

  return 'not_blocked';
};

/**
 * Validate task data before submission
 * @param {object} taskData - Task data to validate
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export const validateTaskData = (taskData) => {
  const errors = [];

  // Required fields
  if (!taskData.title || !taskData.title.trim()) {
    errors.push('Task title is required');
  }

  // Title length
  if (taskData.title && taskData.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }

  // Story points
  if (taskData.storyPoints !== undefined && taskData.storyPoints !== null) {
    const validPoints = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    if (!validPoints.includes(parseInt(taskData.storyPoints))) {
      errors.push('Story points must be a Fibonacci number');
    }
  }

  // Estimated hours
  if (taskData.estimatedHours !== undefined && taskData.estimatedHours !== null) {
    const hours = parseFloat(taskData.estimatedHours);
    if (isNaN(hours) || hours < 0) {
      errors.push('Estimated hours must be a positive number');
    }
  }

  // Priority
  if (taskData.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(taskData.priority)) {
      errors.push('Invalid priority value');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format task data for API submission
 * @param {object} taskData - Raw task data from form
 * @returns {object} Formatted task data
 */
export const formatTaskData = (taskData) => {
  const formatted = {
    title: taskData.title?.trim(),
    description: taskData.description?.trim() || '',
    priority: taskData.priority || 'medium',
    storyPoints: parseInt(taskData.storyPoints) || 0,
    estimatedHours: parseFloat(taskData.estimatedHours) || 0,
    requiredSpecialization: taskData.requiredSpecialization || 'any'
  };

  // Optional fields
  if (taskData.assignee) {
    formatted.assignee = taskData.assignee;
  }

  if (taskData.dueDate) {
    formatted.dueDate = taskData.dueDate;
  }

  if (taskData.status) {
    formatted.status = taskData.status;
  }

  if (taskData.dependencies && Array.isArray(taskData.dependencies)) {
    formatted.dependencies = taskData.dependencies;
  }

  return formatted;
};

/**
 * Group tasks by status
 * @param {array} tasks - Array of tasks
 * @returns {object} Tasks grouped by status
 */
export const groupTasksByStatus = (tasks = []) => {
  return {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed')
  };
};

/**
 * Filter tasks by type (main tasks vs subtasks)
 * @param {array} tasks - Array of tasks
 * @param {string} type - 'main', 'subtask', or 'all'
 * @returns {array} Filtered tasks
 */
export const filterTasksByType = (tasks = [], type = 'all') => {
  if (type === 'main') {
    return tasks.filter(t => !t.isSubtask);
  }
  if (type === 'subtask') {
    return tasks.filter(t => t.isSubtask);
  }
  return tasks;
};

/**
 * Get task statistics
 * @param {array} tasks - Array of tasks
 * @returns {object} Task statistics
 */
export const getTaskStats = (tasks = []) => {
  const mainTasks = tasks.filter(t => !t.isSubtask);
  const subtasks = tasks.filter(t => t.isSubtask);

  return {
    total: tasks.length,
    mainTasks: mainTasks.length,
    subtasks: subtasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    blocked: tasks.filter(t => t.blockingStatus === 'blocked').length,
    waiting: tasks.filter(t => t.blockingStatus === 'waiting').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }).length
  };
};

/**
 * Sort tasks by priority
 * @param {array} tasks - Array of tasks
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} Sorted tasks
 */
export const sortTasksByPriority = (tasks = [], order = 'desc') => {
  const priorityOrder = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    return order === 'desc' ? bPriority - aPriority : aPriority - bPriority;
  });
};

/**
 * Check if task can be deleted
 * @param {object} task - Task to check
 * @returns {object} { canDelete: boolean, reason: string }
 */
export const canDeleteTask = (task) => {
  // Can always delete, but warn if it has subtasks or is a dependency
  const warnings = [];

  if (task.subtasks && task.subtasks.length > 0) {
    warnings.push(`This task has ${task.subtasks.length} subtask(s) that will also be deleted`);
  }

  if (task.blockedBy && task.blockedBy.length > 0) {
    warnings.push(`${task.blockedBy.length} task(s) depend on this task and will be unblocked`);
  }

  return {
    canDelete: true,
    warnings,
    requiresConfirmation: warnings.length > 0
  };
};

/**
 * Get display text for blocking status
 * @param {string} blockingStatus - Blocking status value
 * @returns {object} { label: string, color: string, icon: string }
 */
export const getBlockingStatusDisplay = (blockingStatus) => {
  const displays = {
    not_blocked: {
      label: 'Not Blocked',
      color: '#10b981',
      icon: 'check'
    },
    waiting: {
      label: 'Waiting',
      color: '#f59e0b',
      icon: 'clock'
    },
    blocked: {
      label: 'Blocked',
      color: '#ef4444',
      icon: 'lock'
    }
  };

  return displays[blockingStatus] || displays.not_blocked;
};

/**
 * Get priority color
 * @param {string} priority - Priority value
 * @returns {string} Color hex code
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#7c3aed'
  };
  return colors[priority] || colors.medium;
};

/**
 * Get status color
 * @param {string} status - Status value
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  const colors = {
    todo: '#6b7280',
    in_progress: '#3b82f6',
    review: '#8b5cf6',
    completed: '#10b981'
  };
  return colors[status] || colors.todo;
};

export default {
  // CRUD
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  
  // Settings
  updateProjectSettings,
  
  // Dependencies
  addTaskDependency,
  removeTaskDependency,
  
  // Helpers
  calculateBlockingStatus,
  validateTaskData,
  formatTaskData,
  groupTasksByStatus,
  filterTasksByType,
  getTaskStats,
  sortTasksByPriority,
  canDeleteTask,
  getBlockingStatusDisplay,
  getPriorityColor,
  getStatusColor
};


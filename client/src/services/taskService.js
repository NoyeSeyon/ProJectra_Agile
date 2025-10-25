import api from './api';

/**
 * Task Service
 * Handles all task-related API calls
 */

// Get all tasks with filters
export const getTasks = async (filters = {}) => {
  const response = await api.get('/api/tasks', { params: filters });
  return response.data;
};

// Get single task by ID
export const getTaskById = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}`);
  return response.data;
};

// Get tasks by project
export const getTasksByProject = async (projectId, filters = {}) => {
  const response = await api.get('/api/tasks', { 
    params: { ...filters, projectId } 
  });
  return response.data;
};

// Get my assigned tasks
export const getMyTasks = async (filters = {}) => {
  const response = await api.get('/api/tasks', {
    params: { ...filters, assignee: 'me' }
  });
  return response.data;
};

// Create new task
export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks', taskData);
  return response.data;
};

// Update task
export const updateTask = async (taskId, updates) => {
  const response = await api.put(`/api/tasks/${taskId}`, updates);
  return response.data;
};

// Update task status (for Kanban drag-and-drop)
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.put(`/api/tasks/${taskId}`, { status });
  return response.data;
};

// Delete (archive) task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data;
};

// Add comment to task
export const addComment = async (taskId, text) => {
  const response = await api.post(`/api/tasks/${taskId}/comments`, { text });
  return response.data;
};

// Get task statistics
export const getTaskStats = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await api.get('/api/tasks/stats', { params });
  return response.data;
};

export default {
  getTasks,
  getTaskById,
  getTasksByProject,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  getTaskStats
};

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Sprint Service
 * Handles all sprint/agile management API calls
 */

// Create new sprint
export const createSprint = async (sprintData) => {
  const response = await axios.post(`${API_URL}/api/sprints`, sprintData);
  return response.data;
};

// Get all sprints for a project
export const getProjectSprints = async (projectId, status = null) => {
  const params = status ? { status } : {};
  const response = await axios.get(`${API_URL}/api/sprints/project/${projectId}`, { params });
  return response.data;
};

// Get sprint details
export const getSprint = async (sprintId) => {
  const response = await axios.get(`${API_URL}/api/sprints/${sprintId}`);
  return response.data;
};

// Update sprint
export const updateSprint = async (sprintId, updates) => {
  const response = await axios.put(`${API_URL}/api/sprints/${sprintId}`, updates);
  return response.data;
};

// Start sprint
export const startSprint = async (sprintId) => {
  const response = await axios.post(`${API_URL}/api/sprints/${sprintId}/start`);
  return response.data;
};

// Complete sprint
export const completeSprint = async (sprintId, retrospective = {}) => {
  const response = await axios.post(`${API_URL}/api/sprints/${sprintId}/complete`, { retrospective });
  return response.data;
};

// Get burndown chart data
export const getSprintBurndown = async (sprintId) => {
  const response = await axios.get(`${API_URL}/api/sprints/${sprintId}/burndown`);
  return response.data;
};

// Add tasks to sprint
export const addTasksToSprint = async (sprintId, taskIds) => {
  const response = await axios.post(`${API_URL}/api/sprints/${sprintId}/tasks`, { taskIds });
  return response.data;
};

/**
 * Helper Functions
 */

// Calculate sprint progress percentage
export const calculateSprintProgress = (sprint) => {
  if (!sprint.plannedStoryPoints) return 0;
  return Math.round((sprint.completedStoryPoints / sprint.plannedStoryPoints) * 100);
};

// Get sprint status label and color
export const getSprintStatus = (sprint) => {
  const statusConfig = {
    planning: { label: 'Planning', color: '#6b7280' },
    active: { label: 'Active', color: '#10b981' },
    completed: { label: 'Completed', color: '#3b82f6' },
    cancelled: { label: 'Cancelled', color: '#ef4444' }
  };
  return statusConfig[sprint.status] || statusConfig.planning;
};

// Calculate days remaining in sprint
export const getDaysRemaining = (endDate) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Get sprint duration in days
export const getSprintDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if sprint can be started
export const canStartSprint = (sprint) => {
  return sprint.status === 'planning' && sprint.tasks && sprint.tasks.length > 0;
};

// Check if sprint can be completed
export const canCompleteSprint = (sprint) => {
  return sprint.status === 'active';
};

export default {
  createSprint,
  getProjectSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  getSprintBurndown,
  addTasksToSprint,
  calculateSprintProgress,
  getSprintStatus,
  getDaysRemaining,
  getSprintDuration,
  canStartSprint,
  canCompleteSprint
};

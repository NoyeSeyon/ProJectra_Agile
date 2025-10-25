import api from './api';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

// Get user dashboard analytics
export const getUserAnalytics = async () => {
  const response = await api.get('/api/analytics/user');
  return response.data;
};

// Get project analytics
export const getProjectAnalytics = async (projectId) => {
  const response = await api.get(`/api/analytics/project/${projectId}`);
  return response.data;
};

// Get team analytics (for PMs)
export const getTeamAnalytics = async () => {
  const response = await api.get('/api/analytics/team');
  return response.data;
};

// Get organization analytics (for Admins)
export const getOrganizationAnalytics = async () => {
  const response = await api.get('/api/analytics/organization');
  return response.data;
};

// Get system-wide analytics (for Super Admins)
export const getSystemAnalytics = async () => {
  const response = await api.get('/api/analytics/system');
  return response.data;
};

// Get task statistics
export const getTaskStats = async (filters = {}) => {
  const response = await api.get('/api/analytics/tasks', { params: filters });
  return response.data;
};

// Get project progress
export const getProjectProgress = async (projectId) => {
  const response = await api.get(`/api/analytics/project/${projectId}/progress`);
  return response.data;
};

// Get sprint burndown (if using sprints)
export const getSprintBurndown = async (sprintId) => {
  const response = await api.get(`/api/analytics/sprint/${sprintId}/burndown`);
  return response.data;
};

// Get team velocity
export const getTeamVelocity = async (teamId, period = '30d') => {
  const response = await api.get(`/api/analytics/team/${teamId}/velocity`, {
    params: { period }
  });
  return response.data;
};

// Get user performance
export const getUserPerformance = async (userId, period = '30d') => {
  const response = await api.get(`/api/analytics/user/${userId}/performance`, {
    params: { period }
  });
  return response.data;
};

// Get budget analytics
export const getBudgetAnalytics = async (projectId) => {
  const response = await api.get(`/api/analytics/project/${projectId}/budget`);
  return response.data;
};

// Get time tracking analytics
export const getTimeTrackingAnalytics = async (filters = {}) => {
  const response = await api.get('/api/analytics/time-tracking', {
    params: filters
  });
  return response.data;
};

export default {
  getUserAnalytics,
  getProjectAnalytics,
  getTeamAnalytics,
  getOrganizationAnalytics,
  getSystemAnalytics,
  getTaskStats,
  getProjectProgress,
  getSprintBurndown,
  getTeamVelocity,
  getUserPerformance,
  getBudgetAnalytics,
  getTimeTrackingAnalytics
};


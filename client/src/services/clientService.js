import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Client Service
 * Handles all client portal API calls
 */

// Get client dashboard data
export const getClientDashboard = async () => {
  const response = await axios.get(`${API_URL}/api/client/dashboard`);
  return response.data;
};

// Get client's projects
export const getClientProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await axios.get(`${API_URL}/api/client/projects?${params}`);
  return response.data;
};

// Get project progress details
export const getProjectProgress = async (projectId) => {
  const response = await axios.get(`${API_URL}/api/client/project/${projectId}/progress`);
  return response.data;
};

// Get project timeline
export const getProjectTimeline = async (projectId) => {
  const response = await axios.get(`${API_URL}/api/client/project/${projectId}/timeline`);
  return response.data;
};

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_URL}/api/client/feedback`, feedbackData);
  return response.data;
};

// Get reports
export const getReports = async (projectId = null) => {
  const params = projectId ? `?projectId=${projectId}` : '';
  const response = await axios.get(`${API_URL}/api/client/reports${params}`);
  return response.data;
};

/**
 * Helper Functions
 */

// Format project status for display
export const formatProjectStatus = (status) => {
  const statusMap = {
    planning: { label: 'Planning', color: '#6b7280' },
    active: { label: 'Active', color: '#10b981' },
    on_hold: { label: 'On Hold', color: '#f59e0b' },
    completed: { label: 'Completed', color: '#3b82f6' },
    cancelled: { label: 'Cancelled', color: '#ef4444' }
  };
  return statusMap[status] || { label: status, color: '#6b7280' };
};

// Calculate days remaining
export const getDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format budget display
export const formatBudget = (amount, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return formatter.format(amount);
};

// Get budget alert level
export const getBudgetAlertLevel = (percentageUsed) => {
  if (percentageUsed >= 95) return { level: 'critical', color: '#ef4444' };
  if (percentageUsed >= 80) return { level: 'warning', color: '#f59e0b' };
  if (percentageUsed >= 70) return { level: 'caution', color: '#eab308' };
  return { level: 'normal', color: '#10b981' };
};

// Format timeline progress
export const getTimelineStatus = (timelineProgress, taskProgress) => {
  const diff = taskProgress - timelineProgress;
  if (diff >= 10) return { status: 'ahead', message: 'Ahead of schedule', color: '#10b981' };
  if (diff <= -10) return { status: 'behind', message: 'Behind schedule', color: '#ef4444' };
  return { status: 'on_track', message: 'On track', color: '#3b82f6' };
};

export default {
  getClientDashboard,
  getClientProjects,
  getProjectProgress,
  getProjectTimeline,
  submitFeedback,
  getReports,
  formatProjectStatus,
  getDaysRemaining,
  formatBudget,
  getBudgetAlertLevel,
  getTimelineStatus
};


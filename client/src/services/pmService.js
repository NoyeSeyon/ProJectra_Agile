import api from './api';

/**
 * PM Service
 * Handles all Project Manager related API calls
 */

// Get PM Dashboard Data
export const getPMDashboard = async () => {
  const response = await api.get('/api/pm/dashboard');
  return response.data;
};

// Get PM's Projects
export const getPMProjects = async (filters = {}) => {
  const response = await api.get('/api/pm/projects', { params: filters });
  return response.data;
};

// Get PM's Team Members
export const getPMTeam = async () => {
  const response = await api.get('/api/pm/team');
  return response.data;
};

// Get PM Analytics
export const getPMAnalytics = async (timeRange = '30') => {
  const response = await api.get('/api/pm/analytics', { 
    params: { timeRange } 
  });
  return response.data;
};

// Check PM Capacity
export const checkPMCapacity = async () => {
  const response = await api.get('/api/pm/capacity');
  return response.data;
};

export default {
  getPMDashboard,
  getPMProjects,
  getPMTeam,
  getPMAnalytics,
  checkPMCapacity
};


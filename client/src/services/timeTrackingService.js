import axios from 'axios';

const API_BASE = '/api/time-tracking';

/**
 * Time Tracking Service
 * Handles all time tracking related API calls
 */

// Log time to a task
export const logTime = async (timeData) => {
  try {
    const response = await axios.post(`${API_BASE}/log`, timeData);
    return response.data;
  } catch (error) {
    console.error('Error logging time:', error);
    throw error.response?.data || error;
  }
};

// Get time logs for a task
export const getTaskTimeLogs = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE}/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task time logs:', error);
    throw error.response?.data || error;
  }
};

// Get time logs for a project
export const getProjectTimeLogs = async (projectId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    
    const response = await axios.get(
      `${API_BASE}/project/${projectId}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project time logs:', error);
    throw error.response?.data || error;
  }
};

// Get time logs for a user
export const getUserTimeLogs = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.projectId) params.append('projectId', filters.projectId);
    
    const response = await axios.get(
      `${API_BASE}/user/${userId}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user time logs:', error);
    throw error.response?.data || error;
  }
};

// Update a time log
export const updateTimeLog = async (taskId, logId, updates) => {
  try {
    const response = await axios.put(`${API_BASE}/log/${taskId}/${logId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating time log:', error);
    throw error.response?.data || error;
  }
};

// Delete a time log
export const deleteTimeLog = async (taskId, logId) => {
  try {
    const response = await axios.delete(`${API_BASE}/log/${taskId}/${logId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting time log:', error);
    throw error.response?.data || error;
  }
};

// Helper: Calculate time statistics
export const calculateTimeStats = (logs) => {
  const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);
  const billableHours = logs
    .filter(log => log.billable)
    .reduce((sum, log) => sum + (log.hours || 0), 0);
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const thisWeekLogs = logs.filter(log => new Date(log.date) >= weekAgo);
  const thisMonthLogs = logs.filter(log => new Date(log.date) >= monthAgo);
  
  const weekHours = thisWeekLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
  const monthHours = thisMonthLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
  
  return {
    total: Math.round(totalHours * 10) / 10,
    billable: Math.round(billableHours * 10) / 10,
    nonBillable: Math.round((totalHours - billableHours) * 10) / 10,
    week: Math.round(weekHours * 10) / 10,
    month: Math.round(monthHours * 10) / 10,
    logCount: logs.length
  };
};

// Helper: Group logs by date
export const groupLogsByDate = (logs) => {
  const grouped = {};
  
  logs.forEach(log => {
    const dateKey = new Date(log.date).toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        logs: [],
        totalHours: 0
      };
    }
    grouped[dateKey].logs.push(log);
    grouped[dateKey].totalHours += log.hours || 0;
  });
  
  return Object.values(grouped).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

// Helper: Group logs by task
export const groupLogsByTask = (logs) => {
  const grouped = {};
  
  logs.forEach(log => {
    const taskId = log.task?._id || 'unknown';
    if (!grouped[taskId]) {
      grouped[taskId] = {
        task: log.task,
        logs: [],
        totalHours: 0
      };
    }
    grouped[taskId].logs.push(log);
    grouped[taskId].totalHours += log.hours || 0;
  });
  
  return Object.values(grouped).sort((a, b) => b.totalHours - a.totalHours);
};

// Helper: Format hours
export const formatHours = (hours) => {
  if (hours === 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Helper: Get date range presets
export const getDateRangePresets = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    today: {
      label: 'Today',
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    },
    thisWeek: {
      label: 'This Week',
      startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    },
    thisMonth: {
      label: 'This Month',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    },
    lastMonth: {
      label: 'Last Month',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    },
    all: {
      label: 'All Time',
      startDate: null,
      endDate: null
    }
  };
};

const timeTrackingService = {
  logTime,
  getTaskTimeLogs,
  getProjectTimeLogs,
  getUserTimeLogs,
  updateTimeLog,
  deleteTimeLog,
  calculateTimeStats,
  groupLogsByDate,
  groupLogsByTask,
  formatHours,
  getDateRangePresets
};

export default timeTrackingService;


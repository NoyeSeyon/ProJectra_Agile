import api from './api';

// Dashboard Statistics
export const getDashboardStats = async () => {
  const { data } = await api.get('/api/dashboard/stats');
  return data;
};

// Recent Projects
export const getRecentProjects = async (limit = 5) => {
  const { data } = await api.get('/api/projects', {
    params: { limit, sort: '-updatedAt' }
  });
  return data;
};

// Recent Tasks
export const getRecentTasks = async (limit = 10) => {
  const { data } = await api.get('/api/tasks', {
    params: { limit, sort: '-createdAt' }
  });
  return data;
};

// Upcoming Tasks/Deadlines
export const getUpcomingDeadlines = async (days = 7) => {
  const { data } = await api.get('/api/tasks/upcoming', {
    params: { days }
  });
  return data;
};

// Recent Activities
export const getRecentActivities = async (limit = 10) => {
  const { data} = await api.get('/api/activities/recent', {
    params: { limit }
  });
  return data;
};

// Project Progress
export const getProjectProgress = async () => {
  const { data } = await api.get('/api/dashboard/project-progress');
  return data;
};

// Get all dashboard data at once
export const getDashboardData = async () => {
  try {
    const [stats, projects, tasks, deadlines, activities, progress] = await Promise.all([
      getDashboardStats(),
      getRecentProjects(5),
      getRecentTasks(10),
      getUpcomingDeadlines(7),
      getRecentActivities(10),
      getProjectProgress()
    ]);

    return {
      stats: stats.data || {},
      projects: projects.data || [],
      tasks: tasks.data || [],
      deadlines: deadlines.data || [],
      activities: activities.data || [],
      progress: progress.data || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getRecentProjects,
  getRecentTasks,
  getUpcomingDeadlines,
  getRecentActivities,
  getProjectProgress,
  getDashboardData
};


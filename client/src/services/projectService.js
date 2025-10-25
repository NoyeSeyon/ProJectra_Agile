import api from './api';

// Get all projects for organization
export const getProjects = async (params = {}) => {
  const response = await api.get('/api/projects', { params });
  return response.data;
};

export const projectService = {
  // Get all projects for organization
  getProjects: async (organizationId, params = {}) => {
    const response = await api.get(`/api/projects?organization=${organizationId}`, { params });
    return response.data;
  },

  // Get single project
  getProject: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
  },

  // Archive project
  archiveProject: async (projectId) => {
    const response = await api.patch(`/api/projects/${projectId}/archive`);
    return response.data;
  },

  // Restore project
  restoreProject: async (projectId) => {
    const response = await api.patch(`/api/projects/${projectId}/restore`);
    return response.data;
  },

  // Add member to project
  addMember: async (projectId, userId, role = 'member') => {
    const response = await api.post(`/api/projects/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  },

  // Remove member from project
  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/api/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  // Update project progress
  updateProgress: async (projectId, progress) => {
    const response = await api.patch(`/api/projects/${projectId}/progress`, { progress });
    return response.data;
  },

  // Get project analytics
  getAnalytics: async (projectId, params = {}) => {
    const response = await api.get(`/api/projects/${projectId}/analytics`, { params });
    return response.data;
  },

  // Get project weight calculation
  calculateWeight: async (projectData) => {
    const response = await api.post('/api/projects/calculate-weight', projectData);
    return response.data;
  }
};


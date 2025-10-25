import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from './useAuth';

export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProject(projectId);
      setProject(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const updateProject = async (projectData) => {
    try {
      setLoading(true);
      const response = await projectService.updateProject(projectId, projectData);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    try {
      await projectService.deleteProject(projectId);
      setProject(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
      throw err;
    }
  };

  const archiveProject = async () => {
    try {
      const response = await projectService.archiveProject(projectId);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive project');
      throw err;
    }
  };

  const restoreProject = async () => {
    try {
      const response = await projectService.restoreProject(projectId);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore project');
      throw err;
    }
  };

  const addMember = async (userId, role = 'member') => {
    try {
      const response = await projectService.addMember(projectId, userId, role);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
      throw err;
    }
  };

  const removeMember = async (userId) => {
    try {
      const response = await projectService.removeMember(projectId, userId);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
      throw err;
    }
  };

  const updateProgress = async (progress) => {
    try {
      const response = await projectService.updateProgress(projectId, progress);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress');
      throw err;
    }
  };

  const getAnalytics = async (params = {}) => {
    try {
      const response = await projectService.getAnalytics(projectId, params);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      throw err;
    }
  };

  const canUserAccess = () => {
    if (!project || !user) return false;
    return project.canUserAccess(user._id, user.role);
  };

  const isMember = () => {
    if (!project || !user) return false;
    return project.isMember(user._id);
  };

  const getMemberRole = () => {
    if (!project || !user) return null;
    return project.getMemberRole(user._id);
  };

  return {
    project,
    loading,
    error,
    fetchProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    addMember,
    removeMember,
    updateProgress,
    getAnalytics,
    canUserAccess,
    isMember,
    getMemberRole
  };
};

export const useProjects = (organizationId, params = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchProjects = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects(organizationId, {
        ...params,
        page: pagination.page,
        limit: pagination.limit
      });
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [organizationId, params, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      setProjects(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await projectService.updateProject(projectId, projectData);
      setProjects(prev => prev.map(p => p._id === projectId ? response.data : p));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
      throw err;
    }
  };

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setPage,
    setLimit
  };
};


import axios from 'axios';

const API_BASE = '/api/team-leader';

/**
 * Team Leader Service
 * Handles all Team Leader specific API calls
 */

// Get Team Leader dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error.response?.data || error;
  }
};

// Get projects where user is Team Leader
export const getTeamLeaderProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team leader projects:', error);
    throw error.response?.data || error;
  }
};

// Get tasks assigned to Team Leader
export const getTeamLeaderTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await axios.get(`${API_BASE}/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team leader tasks:', error);
    throw error.response?.data || error;
  }
};

// Create subtask (Team Leader only)
export const createSubtask = async (mainTaskId, subtaskData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/tasks/${mainTaskId}/subtasks`,
      subtaskData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating subtask:', error);
    throw error.response?.data || error;
  }
};

// Update subtask
export const updateSubtask = async (mainTaskId, subtaskId, updates) => {
  try {
    const response = await axios.put(
      `${API_BASE}/tasks/${mainTaskId}/subtasks/${subtaskId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error('Error updating subtask:', error);
    throw error.response?.data || error;
  }
};

// Assign subtask to team member
export const assignSubtask = async (mainTaskId, subtaskId, userId) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/tasks/${mainTaskId}/subtasks/${subtaskId}/assign`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning subtask:', error);
    throw error.response?.data || error;
  }
};

// Get team performance metrics
export const getTeamPerformance = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE}/team/performance/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team performance:', error);
    throw error.response?.data || error;
  }
};

// Get subtasks for a main task
export const getSubtasks = async (mainTaskId) => {
  try {
    const response = await axios.get(`${API_BASE}/tasks/${mainTaskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    throw error.response?.data || error;
  }
};

// Bulk create subtasks
export const bulkCreateSubtasks = async (mainTaskId, subtasksArray) => {
  try {
    const response = await axios.post(
      `${API_BASE}/tasks/${mainTaskId}/subtasks/bulk`,
      { subtasks: subtasksArray }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk creating subtasks:', error);
    throw error.response?.data || error;
  }
};

// Delete subtask
export const deleteSubtask = async (mainTaskId, subtaskId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/tasks/${mainTaskId}/subtasks/${subtaskId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting subtask:', error);
    throw error.response?.data || error;
  }
};

// Get team members in projects where user is Team Leader
export const getTeamMembers = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE}/team/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error.response?.data || error;
  }
};

// Get all team members across all TL projects
export const getAllTeamMembers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/team/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all team members:', error);
    throw error.response?.data || error;
  }
};

// Helper: Check if user can create subtasks for a project
export const canCreateSubtasks = (user, project) => {
  if (!user || !project) return false;
  
  // User must be a Team Leader role
  if (user.role !== 'team_leader') return false;
  
  // Check if user is the Team Leader for this specific project
  const isTeamLeader = project.teamLeader && 
    (project.teamLeader._id === user.id || project.teamLeader === user.id);
  
  if (!isTeamLeader) return false;
  
  // Check if subtask creation is allowed by PM
  const subtasksAllowed = project.settings?.allowTeamLeaderSubtasks !== false;
  
  return subtasksAllowed;
};

// Helper: Check subtask permission for a project
export const checkSubtaskPermission = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE}/projects/${projectId}`);
    const project = response.data.data?.project || response.data.project;
    
    if (!project) {
      return { allowed: false, reason: 'Project not found' };
    }
    
    const allowed = project.settings?.allowTeamLeaderSubtasks !== false;
    
    return {
      allowed,
      reason: allowed ? null : 'Subtask creation disabled by Project Manager',
      project
    };
  } catch (error) {
    console.error('Error checking subtask permission:', error);
    return {
      allowed: false,
      reason: 'Failed to check permissions',
      error: error.response?.data || error
    };
  }
};

// Helper: Calculate subtask completion percentage
export const calculateSubtaskCompletion = (subtasks) => {
  if (!subtasks || subtasks.length === 0) return 0;
  
  const completed = subtasks.filter(
    st => st.status === 'completed' || st.status === 'done'
  ).length;
  
  return Math.round((completed / subtasks.length) * 100);
};

// Helper: Get subtask statistics
export const getSubtaskStats = (subtasks) => {
  if (!subtasks || subtasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      completionRate: 0
    };
  }
  
  const completed = subtasks.filter(st => st.status === 'completed').length;
  const inProgress = subtasks.filter(st => st.status === 'in_progress').length;
  const todo = subtasks.filter(st => st.status === 'todo').length;
  
  return {
    total: subtasks.length,
    completed,
    inProgress,
    todo,
    completionRate: Math.round((completed / subtasks.length) * 100)
  };
};

// Helper: Group subtasks by status
export const groupSubtasksByStatus = (subtasks) => {
  const grouped = {
    todo: [],
    in_progress: [],
    review: [],
    completed: []
  };
  
  if (!subtasks || subtasks.length === 0) return grouped;
  
  subtasks.forEach(subtask => {
    const status = subtask.status || 'todo';
    if (grouped[status]) {
      grouped[status].push(subtask);
    }
  });
  
  return grouped;
};

// Helper: Group subtasks by assignee
export const groupSubtasksByAssignee = (subtasks) => {
  const grouped = {};
  
  if (!subtasks || subtasks.length === 0) return grouped;
  
  subtasks.forEach(subtask => {
    const assigneeId = subtask.assignee?._id || 'unassigned';
    const assigneeName = subtask.assignee 
      ? `${subtask.assignee.firstName} ${subtask.assignee.lastName}`
      : 'Unassigned';
    
    if (!grouped[assigneeId]) {
      grouped[assigneeId] = {
        assignee: subtask.assignee,
        name: assigneeName,
        subtasks: [],
        count: 0
      };
    }
    
    grouped[assigneeId].subtasks.push(subtask);
    grouped[assigneeId].count++;
  });
  
  return Object.values(grouped);
};

// Helper: Validate subtask data
export const validateSubtaskData = (subtaskData) => {
  const errors = [];
  
  if (!subtaskData.title || subtaskData.title.trim() === '') {
    errors.push('Subtask title is required');
  }
  
  if (subtaskData.title && subtaskData.title.length > 200) {
    errors.push('Subtask title must be less than 200 characters');
  }
  
  if (subtaskData.description && subtaskData.description.length > 1000) {
    errors.push('Subtask description must be less than 1000 characters');
  }
  
  if (subtaskData.storyPoints && (subtaskData.storyPoints < 0 || subtaskData.storyPoints > 89)) {
    errors.push('Story points must be between 0 and 89');
  }
  
  if (subtaskData.estimatedHours && subtaskData.estimatedHours < 0) {
    errors.push('Estimated hours cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper: Calculate team workload
export const calculateTeamWorkload = (members, tasks) => {
  const workload = {};
  
  members.forEach(member => {
    const memberTasks = tasks.filter(
      task => task.assignee?._id === member._id
    );
    
    const totalTasks = memberTasks.length;
    const completedTasks = memberTasks.filter(
      task => task.status === 'completed'
    ).length;
    const inProgressTasks = memberTasks.filter(
      task => task.status === 'in_progress'
    ).length;
    
    const totalHours = memberTasks.reduce(
      (sum, task) => sum + (task.timeTracking?.estimatedHours || 0), 0
    );
    const loggedHours = memberTasks.reduce(
      (sum, task) => sum + (task.timeTracking?.loggedHours || 0), 0
    );
    
    workload[member._id] = {
      member,
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate: totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      totalHours: Math.round(totalHours * 10) / 10,
      loggedHours: Math.round(loggedHours * 10) / 10,
      remainingHours: Math.round((totalHours - loggedHours) * 10) / 10
    };
  });
  
  return workload;
};

const teamLeaderService = {
  getDashboardStats,
  getTeamLeaderProjects,
  getTeamLeaderTasks,
  createSubtask,
  updateSubtask,
  assignSubtask,
  getTeamPerformance,
  getSubtasks,
  bulkCreateSubtasks,
  deleteSubtask,
  getTeamMembers,
  getAllTeamMembers,
  canCreateSubtasks,
  calculateSubtaskCompletion,
  getSubtaskStats,
  groupSubtasksByStatus,
  groupSubtasksByAssignee,
  validateSubtaskData,
  calculateTeamWorkload
};

export default teamLeaderService;


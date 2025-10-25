import api from './api';

// User Management
export const getOrganizationUsers = async (filters = {}) => {
  const { data } = await api.get('/api/admin/users', { params: filters });
  return data;
};

export const inviteUser = async (userData) => {
  const { data } = await api.post('/api/admin/users/invite', userData);
  return data;
};

export const changeUserRole = async (userId, role) => {
  const { data } = await api.put(`/api/admin/users/${userId}/role`, { role });
  return data;
};

export const toggleUserStatus = async (userId) => {
  const { data } = await api.patch(`/api/admin/users/${userId}/status`);
  return data;
};

// PM Management
export const assignPM = async (userId, maxProjects) => {
  const { data } = await api.post('/api/admin/assign-pm', { userId, maxProjects });
  return data;
};

export const unassignPM = async (userId) => {
  const { data } = await api.delete(`/api/admin/unassign-pm/${userId}`);
  return data;
};

export const getPMs = async () => {
  const { data } = await api.get('/api/admin/pms');
  return data;
};

export const updatePMCapacity = async (userId, maxProjects) => {
  const { data } = await api.put(`/api/admin/pm/${userId}/capacity`, { maxProjects });
  return data;
};

export const getPMProjects = async (userId) => {
  const { data } = await api.get(`/api/admin/pm/${userId}/projects`);
  return data;
};

// Analytics
export const getOrganizationAnalytics = async () => {
  const { data } = await api.get('/api/admin/analytics');
  return data;
};

export default {
  getOrganizationUsers,
  inviteUser,
  changeUserRole,
  toggleUserStatus,
  assignPM,
  unassignPM,
  getPMs,
  updatePMCapacity,
  getPMProjects,
  getOrganizationAnalytics,
};


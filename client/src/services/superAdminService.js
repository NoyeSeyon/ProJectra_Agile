import api from './api';

// Analytics
export const getSystemAnalytics = async () => {
  const response = await api.get('/api/super-admin/analytics');
  return response.data;
};

// Organization Management
export const getAllOrganizations = async (params = {}) => {
  const response = await api.get('/api/super-admin/organizations', { params });
  return response.data;
};

export const getOrganizationDetails = async (id) => {
  const response = await api.get(`/api/super-admin/organizations/${id}`);
  return response.data;
};

export const createOrganization = async (data) => {
  const response = await api.post('/api/super-admin/organizations', data);
  return response.data;
};

export const updateOrganization = async (id, data) => {
  const response = await api.put(`/api/super-admin/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id) => {
  const response = await api.delete(`/api/super-admin/organizations/${id}`);
  return response.data;
};

// Admin Management
export const getAllAdmins = async (params = {}) => {
  const response = await api.get('/api/super-admin/admins', { params });
  return response.data;
};

export const createAdmin = async (data) => {
  const response = await api.post('/api/super-admin/create-admin', data);
  return response.data;
};

export const updateAdmin = async (id, data) => {
  const response = await api.put(`/api/super-admin/admins/${id}`, data);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await api.delete(`/api/super-admin/admins/${id}`);
  return response.data;
};

export const assignAdminToOrganization = async (data) => {
  const response = await api.post('/api/super-admin/assign-admin', data);
  return response.data;
};

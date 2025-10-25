import api from './api';

/**
 * Settings Service
 * Handles all settings-related API calls
 */

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/api/settings/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/settings/profile', profileData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.post('/api/settings/change-password', passwordData);
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (avatarUrl) => {
  const response = await api.post('/api/settings/avatar', { avatarUrl });
  return response.data;
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  const response = await api.get('/api/settings/notifications');
  return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/api/settings/notifications', { preferences });
  return response.data;
};

// Get organization settings (admin only)
export const getOrganizationSettings = async () => {
  const response = await api.get('/api/settings/organization');
  return response.data;
};

// Update organization settings (admin only)
export const updateOrganizationSettings = async (orgData) => {
  const response = await api.put('/api/settings/organization', orgData);
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getNotificationPreferences,
  updateNotificationPreferences,
  getOrganizationSettings,
  updateOrganizationSettings
};


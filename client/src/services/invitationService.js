import api from './api';

/**
 * Invitation Service
 * Handles all invitation-related API calls
 */

// Create/Send invitation
export const sendInvitation = async (invitationData) => {
  const response = await api.post('/api/invitations', invitationData);
  return response.data;
};

// Get all organization invitations
export const getInvitations = async (filters = {}) => {
  const response = await api.get('/api/invitations', { params: filters });
  return response.data;
};

// Validate invitation token
export const validateInvitation = async (token, email) => {
  const response = await api.get(`/api/invitations/validate/${token}`, {
    params: { email }
  });
  return response.data;
};

// Cancel invitation
export const cancelInvitation = async (invitationId) => {
  const response = await api.delete(`/api/invitations/${invitationId}`);
  return response.data;
};

// Resend invitation
export const resendInvitation = async (invitationId) => {
  const response = await api.post(`/api/invitations/${invitationId}/resend`);
  return response.data;
};

export default {
  sendInvitation,
  getInvitations,
  validateInvitation,
  cancelInvitation,
  resendInvitation
};


import api from './api';

export const memberService = {
  // Get all members for organization
  getMembers: async (organizationId, params = {}) => {
    const response = await api.get(`/api/users?organization=${organizationId}`, { params });
    return response.data;
  },

  // Get single member
  getMember: async (memberId) => {
    const response = await api.get(`/api/users/${memberId}`);
    return response.data;
  },

  // Update member
  updateMember: async (memberId, memberData) => {
    const response = await api.put(`/api/users/${memberId}`, memberData);
    return response.data;
  },

  // Update member role
  updateRole: async (memberId, role) => {
    const response = await api.patch(`/api/users/${memberId}/role`, { role });
    return response.data;
  },

  // Update member specialization
  updateSpecialization: async (memberId, specialization) => {
    const response = await api.patch(`/api/users/${memberId}/specialization`, { specialization });
    return response.data;
  },

  // Update member capacity
  updateCapacity: async (memberId, capacity) => {
    const response = await api.patch(`/api/users/${memberId}/capacity`, capacity);
    return response.data;
  },

  // Get member workload
  getWorkload: async (memberId) => {
    const response = await api.get(`/api/users/${memberId}/workload`);
    return response.data;
  },

  // Get member projects
  getMemberProjects: async (memberId) => {
    const response = await api.get(`/api/users/${memberId}/projects`);
    return response.data;
  },

  // Get member skills
  getSkills: async (memberId) => {
    const response = await api.get(`/api/users/${memberId}/skills`);
    return response.data;
  },

  // Update member skills
  updateSkills: async (memberId, skills) => {
    const response = await api.put(`/api/users/${memberId}/skills`, { skills });
    return response.data;
  },

  // Get members by specialization
  getBySpecialization: async (organizationId, specialization) => {
    const response = await api.get(`/api/users/specialization/${specialization}?organization=${organizationId}`);
    return response.data;
  },

  // Get available members for project
  getAvailableMembers: async (projectId, requirements = {}) => {
    const response = await api.post(`/api/users/available?project=${projectId}`, requirements);
    return response.data;
  },

  // Deactivate member
  deactivateMember: async (memberId) => {
    const response = await api.patch(`/api/users/${memberId}/deactivate`);
    return response.data;
  },

  // Activate member
  activateMember: async (memberId) => {
    const response = await api.patch(`/api/users/${memberId}/activate`);
    return response.data;
  },

  // Get member analytics
  getAnalytics: async (memberId) => {
    const response = await api.get(`/api/users/${memberId}/analytics`);
    return response.data;
  }
};


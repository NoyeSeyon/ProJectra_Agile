import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Register with invitation
  registerWithInvite: async (userData, inviteToken) => {
    const response = await api.post('/api/auth/register/invite', {
      ...userData,
      inviteToken
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};


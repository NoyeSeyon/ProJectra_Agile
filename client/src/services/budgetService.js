import axios from 'axios';

const API_BASE = '/api/budget';

/**
 * Budget Service
 * Handles all budget tracking related API calls
 */

// Get project budget status
export const getProjectBudget = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project budget:', error);
    throw error.response?.data || error;
  }
};

// Update project budget
export const updateProjectBudget = async (projectId, budgetData) => {
  try {
    const response = await axios.put(`${API_BASE}/project/${projectId}`, budgetData);
    return response.data;
  } catch (error) {
    console.error('Error updating project budget:', error);
    throw error.response?.data || error;
  }
};

// Log an expense
export const logExpense = async (expenseData) => {
  try {
    const response = await axios.post(`${API_BASE}/expense`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error logging expense:', error);
    throw error.response?.data || error;
  }
};

// Get budget alerts
export const getBudgetAlerts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    throw error.response?.data || error;
  }
};

// Helper: Get budget status color
export const getBudgetStatusColor = (percentage) => {
  if (percentage >= 95) return 'critical'; // Red
  if (percentage >= 80) return 'warning'; // Orange
  if (percentage >= 70) return 'caution'; // Yellow
  return 'good'; // Green
};

// Helper: Get budget status label
export const getBudgetStatusLabel = (percentage) => {
  if (percentage >= 95) return 'Critical';
  if (percentage >= 80) return 'Warning';
  if (percentage >= 70) return 'Caution';
  return 'On Track';
};

// Helper: Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    LKR: 'Rs'
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol}${formatted}`;
};

// Helper: Calculate percentage
export const calculateBudgetPercentage = (spent, planned) => {
  if (!planned || planned === 0) return 0;
  return Math.round((spent / planned) * 100);
};

const budgetService = {
  getProjectBudget,
  updateProjectBudget,
  logExpense,
  getBudgetAlerts,
  getBudgetStatusColor,
  getBudgetStatusLabel,
  formatCurrency,
  calculateBudgetPercentage
};

export default budgetService;


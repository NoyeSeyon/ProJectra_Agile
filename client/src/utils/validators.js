// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// Organization name validation
export const isValidOrganizationName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Project name validation
export const isValidProjectName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Task title validation
export const isValidTaskTitle = (title) => {
  return title && title.trim().length >= 2 && title.trim().length <= 200;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Story points validation
export const isValidStoryPoints = (points) => {
  return Number.isInteger(points) && points >= 0 && points <= 100;
};

// Priority validation
export const isValidPriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  return validPriorities.includes(priority);
};

// Status validation
export const isValidStatus = (status, type = 'task') => {
  const validStatuses = {
    task: ['todo', 'in_progress', 'review', 'completed', 'cancelled'],
    project: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    sprint: ['planning', 'active', 'completed', 'cancelled']
  };
  
  return validStatuses[type]?.includes(status) || false;
};

// Role validation
export const isValidRole = (role) => {
  const validRoles = [
    'projectra_admin', 'admin', 'project_manager', 
    'team_leader', 'member', 'client', 'guest'
  ];
  return validRoles.includes(role);
};

// Specialization validation
export const isValidSpecialization = (specialization) => {
  const validSpecializations = [
    'ui_ux_designer', 'software_engineer', 'qa_engineer', 
    'devops_engineer', 'product_manager', 'business_analyst', 
    'data_analyst', 'marketing_specialist', 'general'
  ];
  return validSpecializations.includes(specialization);
};

// Form validation helpers
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.requiredMessage || `${field} is required`;
    } else if (value && rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    } else if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
    } else if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must be no more than ${rule.maxLength} characters`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


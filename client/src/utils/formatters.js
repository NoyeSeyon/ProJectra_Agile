// Date formatting
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Time formatting
export const formatTime = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleTimeString('en-US', { ...defaultOptions, ...options });
};

// DateTime formatting
export const formatDateTime = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
};

// Relative time formatting
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

// Currency formatting
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return '';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number);
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  
  return `${Number(value).toFixed(decimals)}%`;
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Duration formatting
export const formatDuration = (hours) => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
};

// Name formatting
export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown User';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Initials formatting
export const formatInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return 'U';
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}`;
};

// Role formatting
export const formatRole = (role) => {
  const roleMap = {
    'projectra_admin': 'Projectra Admin',
    'admin': 'Admin',
    'project_manager': 'Project Manager',
    'team_leader': 'Team Leader',
    'member': 'Member',
    'client': 'Client',
    'guest': 'Guest'
  };
  
  return roleMap[role] || role;
};

// Specialization formatting
export const formatSpecialization = (specialization) => {
  const specMap = {
    'ui_ux_designer': 'UI/UX Designer',
    'software_engineer': 'Software Engineer',
    'qa_engineer': 'QA Engineer',
    'devops_engineer': 'DevOps Engineer',
    'product_manager': 'Product Manager',
    'business_analyst': 'Business Analyst',
    'data_analyst': 'Data Analyst',
    'marketing_specialist': 'Marketing Specialist',
    'general': 'General'
  };
  
  return specMap[specialization] || specialization;
};

// Priority formatting
export const formatPriority = (priority) => {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  
  return priorityMap[priority] || priority;
};

// Status formatting
export const formatStatus = (status) => {
  const statusMap = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'review': 'Review',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'planning': 'Planning',
    'active': 'Active',
    'on_hold': 'On Hold'
  };
  
  return statusMap[status] || status;
};

// Progress formatting
export const formatProgress = (progress) => {
  if (progress === null || progress === undefined) return '0%';
  return `${Math.round(progress)}%`;
};

// Story points formatting
export const formatStoryPoints = (points) => {
  if (points === null || points === undefined) return '0';
  return `${points} pts`;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Convert to title case
export const toTitleCase = (text) => {
  if (!text) return '';
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};


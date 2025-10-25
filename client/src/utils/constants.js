// User roles
export const ROLES = {
  PROJECTRA_ADMIN: 'projectra_admin',
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_LEADER: 'team_leader',
  MEMBER: 'member',
  CLIENT: 'client',
  GUEST: 'guest'
};

// Member specializations
export const SPECIALIZATIONS = {
  UI_UX_DESIGNER: 'ui_ux_designer',
  SOFTWARE_ENGINEER: 'software_engineer',
  QA_ENGINEER: 'qa_engineer',
  DEVOPS_ENGINEER: 'devops_engineer',
  PRODUCT_MANAGER: 'product_manager',
  BUSINESS_ANALYST: 'business_analyst',
  DATA_ANALYST: 'data_analyst',
  MARKETING_SPECIALIST: 'marketing_specialist',
  GENERAL: 'general'
};

// Task priorities
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Task statuses
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Project statuses
export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Sprint statuses
export const SPRINT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Task types
export const TASK_TYPES = {
  TASK: 'task',
  BUG: 'bug',
  FEATURE: 'feature',
  EPIC: 'epic',
  STORY: 'story',
  SUBTASK: 'subtask'
};

// Agile methodologies
export const AGILE_METHODOLOGIES = {
  SCRUM: 'scrum',
  KANBAN: 'kanban',
  SCRUMBAN: 'scrumban'
};

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_COMPLETED: 'project_completed',
  SPRINT_STARTED: 'sprint_started',
  SPRINT_COMPLETED: 'sprint_completed',
  SPRINT_OVERDUE: 'sprint_overdue',
  TEAM_INVITATION: 'team_invitation',
  TEAM_JOINED: 'team_joined',
  TEAM_LEFT: 'team_left',
  COMMENT_ADDED: 'comment_added',
  MENTION: 'mention',
  STATUS_CHANGE: 'status_change',
  DEADLINE_REMINDER: 'deadline_reminder',
  MILESTONE_REACHED: 'milestone_reached',
  BUDGET_ALERT: 'budget_alert',
  SYSTEM_UPDATE: 'system_update',
  SECURITY_ALERT: 'security_alert',
  INTEGRATION_CONNECTED: 'integration_connected',
  REPORT_READY: 'report_ready',
  EXPORT_COMPLETED: 'export_completed',
  BACKUP_COMPLETED: 'backup_completed'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Activity types
export const ACTIVITY_TYPES = {
  USER: 'user',
  PROJECT: 'project',
  TASK: 'task',
  SPRINT: 'sprint',
  TEAM: 'team',
  ORGANIZATION: 'organization',
  SYSTEM: 'system',
  SECURITY: 'security',
  INTEGRATION: 'integration',
  COMMUNICATION: 'communication'
};

// Activity actions
export const ACTIVITY_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  COMPLETED: 'completed',
  STARTED: 'started',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
  RESTORED: 'restored',
  COMMENTED: 'commented',
  ATTACHED: 'attached',
  DETACHED: 'detached',
  MOVED: 'moved',
  JOINED: 'joined',
  LEFT: 'left',
  INVITED: 'invited',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  LOGGED_IN: 'logged_in',
  LOGGED_OUT: 'logged_out',
  PASSWORD_CHANGED: 'password_changed',
  ROLE_CHANGED: 'role_changed',
  FEATURE_ENABLED: 'feature_enabled',
  FEATURE_DISABLED: 'feature_disabled',
  INTEGRATION_CONNECTED: 'integration_connected',
  NOTIFICATION_SENT: 'notification_sent',
  REPORT_GENERATED: 'report_generated',
  EXPORT_CREATED: 'export_created'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_INVITE: '/api/auth/register/invite',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout'
  },
  USERS: '/api/users',
  ORGANIZATIONS: '/api/organizations',
  PROJECTS: '/api/projects',
  TASKS: '/api/tasks',
  SPRINTS: '/api/sprints',
  TEAMS: '/api/teams',
  KANBAN: '/api/kanban',
  ANALYTICS: '/api/analytics',
  INVITATIONS: '/api/invitations',
  SETTINGS: '/api/settings',
  SUPER_ADMIN: '/api/super-admin'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  ORGANIZATION: 'organization'
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de'
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter',
  RADAR: 'radar',
  GAUGE: 'gauge'
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  ACTIVITY: 10000, // 10 seconds
  NOTIFICATIONS: 5000, // 5 seconds
  REAL_TIME: 1000 // 1 second
};

// Default values
export const DEFAULTS = {
  SPRINT_DURATION: 2, // weeks
  SPRINT_CAPACITY: 40, // hours
  MAX_PROJECTS_PER_MEMBER: 4,
  DEFAULT_WORKING_HOURS: 40,
  STORY_POINTS_SCALE: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
};

// Color schemes
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  PRIORITY: {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    URGENT: '#EF4444'
  },
  STATUS: {
    TODO: '#6B7280',
    IN_PROGRESS: '#3B82F6',
    REVIEW: '#8B5CF6',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444'
  }
};


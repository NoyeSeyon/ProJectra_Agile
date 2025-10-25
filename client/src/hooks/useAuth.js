import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const useAuthState = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin' || user?.role === 'projectra_admin',
    isProjectManager: user?.role === 'project_manager',
    isTeamLeader: user?.role === 'team_leader',
    isMember: user?.role === 'member',
    isClient: user?.role === 'client',
    isGuest: user?.role === 'guest'
  };
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (resource, action) => {
    if (!user) return false;
    
    // Projectra Admin has all permissions
    if (user.role === 'projectra_admin') return true;
    
    // Admin has all permissions within their organization
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const permissions = {
      project_manager: {
        users: ['read'],
        projects: ['create', 'read', 'update', 'delete'],
        tasks: ['create', 'read', 'update', 'delete'],
        analytics: ['read'],
        settings: ['read']
      },
      team_leader: {
        projects: ['read'],
        tasks: ['create', 'read', 'update', 'delete'],
        analytics: ['read']
      },
      member: {
        projects: ['read'],
        tasks: ['read', 'update'],
        analytics: ['read']
      },
      client: {
        projects: ['read'],
        analytics: ['read']
      },
      guest: {
        projects: ['read']
      }
    };
    
    const rolePermissions = permissions[user.role] || {};
    const resourcePermissions = rolePermissions[resource] || [];
    
    return resourcePermissions.includes(action) || resourcePermissions.includes('manage');
  };
  
  const canAccessOrganization = (orgId) => {
    if (!user) return false;
    return user.organization === orgId;
  };
  
  const canManageUsers = () => {
    return hasPermission('users', 'manage');
  };
  
  const canManageProjects = () => {
    return hasPermission('projects', 'manage');
  };
  
  const canManageTasks = () => {
    return hasPermission('tasks', 'manage');
  };
  
  const canViewAnalytics = () => {
    return hasPermission('analytics', 'read');
  };
  
  const canManageSettings = () => {
    return hasPermission('settings', 'manage');
  };
  
  return {
    hasPermission,
    canAccessOrganization,
    canManageUsers,
    canManageProjects,
    canManageTasks,
    canViewAnalytics,
    canManageSettings
  };
};


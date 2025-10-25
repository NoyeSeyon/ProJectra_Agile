import axios from 'axios';

const API_BASE_URL = '/api/pm';

/**
 * PM Team Management Service
 * Centralized API calls for member management operations
 */

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Add a member to a project
 * @param {string} projectId - Project ID
 * @param {object} memberData - { userId, specialization }
 * @returns {Promise} - API response with updated project
 */
export const addMember = async (projectId, memberData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectId}/members`,
      memberData
    );
    return response.data;
  } catch (error) {
    console.error('Add member error:', error);
    throw error;
  }
};

/**
 * Remove a member from a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to remove
 * @returns {Promise} - API response with updated project and tasks reassigned count
 */
export const removeMember = async (projectId, userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/projects/${projectId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Remove member error:', error);
    throw error;
  }
};

/**
 * Update team leader for a project
 * @param {string} projectId - Project ID
 * @param {string} teamLeaderId - New team leader user ID (null to remove)
 * @returns {Promise} - API response with updated project
 */
export const updateTeamLeader = async (projectId, teamLeaderId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/projects/${projectId}/team-leader`,
      { teamLeaderId }
    );
    return response.data;
  } catch (error) {
    console.error('Update team leader error:', error);
    throw error;
  }
};

/**
 * Update member specialization
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {string} specialization - New specialization
 * @returns {Promise} - API response with updated project
 */
export const updateMemberSpecialization = async (projectId, userId, specialization) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/projects/${projectId}/members/${userId}/specialization`,
      { specialization }
    );
    return response.data;
  } catch (error) {
    console.error('Update member specialization error:', error);
    throw error;
  }
};

/**
 * Get all members across PM's projects
 * @returns {Promise} - API response with members list and stats
 */
export const getAllMembers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/members`);
    return response.data;
  } catch (error) {
    console.error('Get all members error:', error);
    throw error;
  }
};

/**
 * Get members for a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise} - API response with project members
 */
export const getProjectMembers = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    // Extract members from project data
    const project = response.data.project;
    return {
      teamLeader: project.teamLeader,
      members: project.members,
      manager: project.manager
    };
  } catch (error) {
    console.error('Get project members error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a user has capacity for more projects
 * @param {number} currentProjects - Current project count
 * @param {number} maxProjects - Maximum allowed projects (default 5)
 * @returns {boolean}
 */
export const hasProjectCapacity = (currentProjects, maxProjects = 5) => {
  return currentProjects < maxProjects;
};

/**
 * Check if a user has capacity to be a team leader
 * @param {number} currentTLProjects - Current TL project count
 * @param {number} maxTLProjects - Maximum allowed TL projects (default 1)
 * @returns {boolean}
 */
export const hasTeamLeaderCapacity = (currentTLProjects, maxTLProjects = 1) => {
  return currentTLProjects < maxTLProjects;
};

/**
 * Calculate capacity percentage
 * @param {number} current - Current project count
 * @param {number} max - Maximum projects (default 5)
 * @returns {number} - Percentage (0-100)
 */
export const calculateCapacityPercentage = (current, max = 5) => {
  return Math.round((current / max) * 100);
};

/**
 * Get capacity status
 * @param {number} percentage - Capacity percentage
 * @returns {string} - 'normal' | 'warning' | 'critical'
 */
export const getCapacityStatus = (percentage) => {
  if (percentage >= 100) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'normal';
};

/**
 * Get capacity color
 * @param {number} percentage - Capacity percentage
 * @returns {string} - Color code
 */
export const getCapacityColor = (percentage) => {
  if (percentage >= 100) return '#ef4444'; // Red
  if (percentage >= 80) return '#f59e0b'; // Orange
  return '#10b981'; // Green
};

/**
 * Format member data for display
 * @param {object} member - Member object
 * @returns {object} - Formatted member
 */
export const formatMember = (member) => {
  return {
    ...member,
    fullName: `${member.firstName} ${member.lastName}`,
    initials: `${member.firstName?.[0]}${member.lastName?.[0]}`.toUpperCase(),
    capacityPercentage: calculateCapacityPercentage(
      member.capacity?.current || member.projectCount,
      member.capacity?.max || 5
    )
  };
};

/**
 * Group members by specialization
 * @param {array} members - Array of members
 * @returns {object} - Members grouped by specialization
 */
export const groupBySpecialization = (members) => {
  return members.reduce((groups, member) => {
    const spec = member.specialization || 'general';
    if (!groups[spec]) {
      groups[spec] = [];
    }
    groups[spec].push(member);
    return groups;
  }, {});
};

/**
 * Filter members by capacity
 * @param {array} members - Array of members
 * @param {string} status - 'available' | 'warning' | 'full'
 * @returns {array} - Filtered members
 */
export const filterByCapacity = (members, status) => {
  return members.filter(member => {
    const percentage = calculateCapacityPercentage(
      member.capacity?.current || member.projectCount,
      member.capacity?.max || 5
    );
    
    switch (status) {
      case 'available':
        return percentage < 80;
      case 'warning':
        return percentage >= 80 && percentage < 100;
      case 'full':
        return percentage >= 100;
      default:
        return true;
    }
  });
};

/**
 * Sort members by various criteria
 * @param {array} members - Array of members
 * @param {string} sortBy - 'name' | 'projects' | 'capacity' | 'specialization'
 * @param {string} order - 'asc' | 'desc'
 * @returns {array} - Sorted members
 */
export const sortMembers = (members, sortBy = 'name', order = 'asc') => {
  const sorted = [...members].sort((a, b) => {
    let compareA, compareB;

    switch (sortBy) {
      case 'name':
        compareA = `${a.firstName} ${a.lastName}`.toLowerCase();
        compareB = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'projects':
        compareA = a.projectCount || a.capacity?.current || 0;
        compareB = b.projectCount || b.capacity?.current || 0;
        break;
      case 'capacity':
        compareA = calculateCapacityPercentage(
          a.projectCount || a.capacity?.current || 0,
          a.capacity?.max || 5
        );
        compareB = calculateCapacityPercentage(
          b.projectCount || b.capacity?.current || 0,
          b.capacity?.max || 5
        );
        break;
      case 'specialization':
        compareA = (a.specialization || 'general').toLowerCase();
        compareB = (b.specialization || 'general').toLowerCase();
        break;
      default:
        compareA = a.firstName.toLowerCase();
        compareB = b.firstName.toLowerCase();
    }

    if (order === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  return sorted;
};

/**
 * Search members by name or email
 * @param {array} members - Array of members
 * @param {string} searchTerm - Search term
 * @returns {array} - Filtered members
 */
export const searchMembers = (members, searchTerm) => {
  if (!searchTerm) return members;

  const term = searchTerm.toLowerCase();
  return members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });
};

/**
 * Get member statistics
 * @param {array} members - Array of members
 * @returns {object} - Statistics
 */
export const getMemberStats = (members) => {
  const totalMembers = members.length;
  const totalProjects = members.reduce((sum, m) => sum + (m.projectCount || 0), 0);
  const avgProjectsPerMember = totalMembers > 0 ? (totalProjects / totalMembers).toFixed(1) : 0;
  
  const teamLeaders = members.filter(m => m.teamLeaderProjectCount > 0).length;
  const atCapacity = members.filter(m => {
    const percentage = calculateCapacityPercentage(
      m.projectCount || m.capacity?.current || 0,
      m.capacity?.max || 5
    );
    return percentage >= 100;
  }).length;

  return {
    totalMembers,
    totalProjects,
    avgProjectsPerMember,
    teamLeaders,
    atCapacity,
    availableMembers: totalMembers - atCapacity
  };
};

/**
 * Validate member before adding to project
 * @param {object} member - Member object
 * @param {boolean} asTeamLeader - Is being added as TL
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateMemberAddition = (member, asTeamLeader = false) => {
  // Check project capacity
  const projectCount = member.projectCount || member.capacity?.current || 0;
  if (projectCount >= 5) {
    return {
      valid: false,
      message: 'This member has reached maximum project capacity (5 projects)'
    };
  }

  // Check TL capacity if adding as team leader
  if (asTeamLeader) {
    const tlCount = member.teamLeaderProjectCount || 0;
    if (tlCount >= 1) {
      return {
        valid: false,
        message: 'This member is already a Team Leader in another project (max 1)'
      };
    }
  }

  return {
    valid: true,
    message: 'Member can be added to the project'
  };
};

// Export all functions as default object
export default {
  addMember,
  removeMember,
  updateTeamLeader,
  updateMemberSpecialization,
  getAllMembers,
  getProjectMembers,
  hasProjectCapacity,
  hasTeamLeaderCapacity,
  calculateCapacityPercentage,
  getCapacityStatus,
  getCapacityColor,
  formatMember,
  groupBySpecialization,
  filterByCapacity,
  sortMembers,
  searchMembers,
  getMemberStats,
  validateMemberAddition
};


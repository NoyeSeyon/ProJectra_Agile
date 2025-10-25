import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Crown,
  Briefcase,
  Mail,
  X,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import './PMAllMembers.css';

const PMAllMembers = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, projects, capacity
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  // CRUD states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editedSpecialization, setEditedSpecialization] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Add member states
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedProjectForAdd, setSelectedProjectForAdd] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [pmProjects, setPmProjects] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalProjects: 0,
    averageProjectsPerMember: 0
  });

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [members, searchTerm, selectedSpecialization, sortBy, sortOrder]);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/pm/members');
      const { members: memberData, stats: statsData } = response.data.data;
      
      setMembers(memberData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...members];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const email = member.email.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      });
    }

    // Apply specialization filter
    if (selectedSpecialization) {
      filtered = filtered.filter(member => 
        member.specialization === selectedSpecialization
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'name':
          compareA = `${a.firstName} ${a.lastName}`.toLowerCase();
          compareB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'projects':
          compareA = a.projectCount;
          compareB = b.projectCount;
          break;
        case 'capacity':
          compareA = a.capacity.percentage;
          compareB = b.capacity.percentage;
          break;
        default:
          compareA = a.firstName;
          compareB = b.firstName;
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    setFilteredMembers(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleCloseModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general' || spec === 'None') return 'General';
    return spec;
  };

  const specializationOptions = [
    'UI/UX Designer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Data Analyst',
    'Product Manager',
    'Business Analyst'
  ];

  // Handle Edit Specialization
  const handleEditClick = () => {
    setEditedSpecialization(selectedMember?.specialization || '');
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!selectedMember || !editedSpecialization) return;
    
    const memberProject = selectedMember.projects[0];
    if (!memberProject) {
      alert('Member is not in any projects');
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(
        `/api/pm/projects/${memberProject._id}/members/${selectedMember._id}/specialization`,
        { specialization: editedSpecialization }
      );
      
      alert('Specialization updated successfully!');
      setShowEditModal(false);
      await fetchAllMembers();
    } catch (error) {
      console.error('Error updating specialization:', error);
      alert(error.response?.data?.message || 'Failed to update specialization');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Remove Member from All Projects
  const handleRemoveConfirm = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      let totalTasksReassigned = 0;
      
      // Remove member from all their projects
      for (const project of selectedMember.projects) {
        if (project.role !== 'Team Leader') {
          const response = await axios.delete(
            `/api/pm/projects/${project._id}/members/${selectedMember._id}`
          );
          totalTasksReassigned += response.data.tasksReassigned || 0;
        }
      }
      
      alert(
        `Member removed from all projects. ${totalTasksReassigned} task(s) reassigned to you.`
      );
      
      setShowDeleteModal(false);
      await fetchAllMembers();
      handleCloseModal();
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddMemberModal = async () => {
    try {
      setLoadingProjects(true);
      setShowAddMemberModal(true);
      
      // Fetch PM's projects and available users
      const [projectsRes, usersRes] = await Promise.all([
        axios.get('/api/pm/projects'),
        axios.get('/api/pm/available-members')
      ]);
      
      setPmProjects(projectsRes.data.data.projects || []);
      setAvailableUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load projects and users');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedUsers([]);
    setSelectedProjectForAdd('');
  };

  const handleAddMembersToProject = async () => {
    if (!selectedProjectForAdd || selectedUsers.length === 0) {
      alert('Please select a project and at least one member');
      return;
    }

    try {
      setActionLoading(true);
      let successCount = 0;
      
      // Add each selected user to the project
      for (const userId of selectedUsers) {
        try {
          await axios.post(`/api/pm/projects/${selectedProjectForAdd}/members`, {
            userId
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add user ${userId}:`, error);
        }
      }
      
      alert(`Successfully added ${successCount} member(s) to the project`);
      handleCloseAddMemberModal();
      await fetchAllMembers();
    } catch (error) {
      console.error('Error adding members:', error);
      alert(error.response?.data?.message || 'Failed to add members');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 100) return 'critical';
    if (percentage >= 80) return 'warning';
    return 'normal';
  };

  const getAllSpecializations = () => {
    const specs = new Set();
    members.forEach(member => {
      if (member.specialization && member.specialization !== 'general') {
        specs.add(member.specialization);
      }
    });
    return Array.from(specs).sort();
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (loading) {
    return (
      <div className="pm-all-members">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-all-members">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>All Team Members</h1>
            <p>Manage and view all members across your projects</p>
          </div>
        </div>
        <button className="btn-add-member" onClick={handleOpenAddMemberModal}>
          <UserPlus size={20} />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalMembers}</span>
            <span className="stat-label">Total Members</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.averageProjectsPerMember}</span>
            <span className="stat-label">Avg Projects/Member</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-dropdown">
          <Filter size={20} />
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {getAllSpecializations().map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="results-count">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Members Table */}
      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                <span>Member</span>
                <SortIcon field="name" />
              </th>
              <th>Specialization</th>
              <th onClick={() => handleSort('projects')} className="sortable">
                <span>Projects</span>
                <SortIcon field="projects" />
              </th>
              <th onClick={() => handleSort('capacity')} className="sortable">
                <span>Capacity</span>
                <SortIcon field="capacity" />
              </th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member._id} className="member-row">
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div className="member-details">
                        <div className="member-name">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="member-email">
                          <Mail size={14} />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-specialization">
                      {getSpecializationDisplay(member.specialization)}
                    </span>
                  </td>
                  <td>
                    <div className="projects-cell">
                      <span className="project-count">{member.projectCount}</span>
                      <span className="project-label">project{member.projectCount !== 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td>
                    <div className="capacity-cell">
                      <div className={`capacity-bar ${getCapacityColor(member.capacity.percentage)}`}>
                        <div 
                          className="capacity-fill" 
                          style={{ width: `${Math.min(member.capacity.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="capacity-text">
                        {member.capacity.current}/{member.capacity.max}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="role-badges">
                      {member.teamLeaderProjectCount > 0 && (
                        <span className="badge badge-tl">
                          <Crown size={14} />
                          TL ({member.teamLeaderProjectCount})
                        </span>
                      )}
                      {member.projectCount - member.teamLeaderProjectCount > 0 && (
                        <span className="badge badge-member">
                          Member ({member.projectCount - member.teamLeaderProjectCount})
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn-view-details"
                      onClick={() => handleMemberClick(member)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state-row">
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No members found</p>
                    <span>Try adjusting your filters</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="member-header-info">
                <div className="member-avatar large">
                  {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                </div>
                <div>
                  <h3>{selectedMember.firstName} {selectedMember.lastName}</h3>
                  <p className="member-email">
                    <Mail size={16} />
                    {selectedMember.email}
                  </p>
                </div>
              </div>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Action Buttons */}
              <div className="member-actions">
                <button className="btn-action btn-edit" onClick={handleEditClick}>
                  <Edit2 size={16} />
                  Edit Specialization
                </button>
              </div>

              {/* Member Stats */}
              <div className="member-stats-grid">
                <div className="member-stat">
                  <span className="stat-label">Specialization</span>
                  <span className="stat-value">
                    {getSpecializationDisplay(selectedMember.specialization)}
                  </span>
                </div>
                <div className="member-stat">
                  <span className="stat-label">Total Projects</span>
                  <span className="stat-value">{selectedMember.projectCount}</span>
                </div>
                <div className="member-stat">
                  <span className="stat-label">As Team Leader</span>
                  <span className="stat-value">{selectedMember.teamLeaderProjectCount}</span>
                </div>
                <div className="member-stat">
                  <span className="stat-label">Capacity</span>
                  <span className="stat-value">
                    {selectedMember.capacity.current}/{selectedMember.capacity.max}
                  </span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="capacity-section">
                <h4>Workload Capacity</h4>
                <div className={`capacity-bar-large ${getCapacityColor(selectedMember.capacity.percentage)}`}>
                  <div 
                    className="capacity-fill" 
                    style={{ width: `${Math.min(selectedMember.capacity.percentage, 100)}%` }}
                  >
                    <span className="capacity-percentage">{selectedMember.capacity.percentage}%</span>
                  </div>
                </div>
                {selectedMember.capacity.percentage >= 100 && (
                  <div className="alert alert-warning">
                    <AlertCircle size={16} />
                    This member is at full capacity
                  </div>
                )}
              </div>

              {/* Project Assignments */}
              <div className="projects-section">
                <h4>Project Assignments ({selectedMember.projects.length})</h4>
                <div className="projects-list">
                  {selectedMember.projects.map((project) => (
                    <div key={project._id} className="project-item">
                      <div className="project-info">
                        <div className="project-name">{project.name}</div>
                        <div className="project-meta">
                          <span className={`status-badge status-${project.status}`}>
                            {project.status}
                          </span>
                          <span className="role-badge">
                            {project.role === 'Team Leader' ? (
                              <>
                                <Crown size={14} />
                                Team Leader
                              </>
                            ) : (
                              'Member'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button 
                className="btn-delete-member" 
                onClick={() => setShowDeleteModal(true)}
                title="Delete member from all projects"
              >
                <Trash2 size={18} />
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Specialization Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Specialization</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="member-name-text">
                {selectedMember.firstName} {selectedMember.lastName}
              </p>

              <div className="form-group">
                <label>Specialization *</label>
                <select
                  value={editedSpecialization}
                  onChange={(e) => setEditedSpecialization(e.target.value)}
                  disabled={actionLoading}
                  className="form-select"
                >
                  <option value="">Select specialization...</option>
                  {specializationOptions.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEditSave}
                disabled={actionLoading || !editedSpecialization}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Modal */}
      {showDeleteModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Member</h3>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete{' '}
                <strong>{selectedMember.firstName} {selectedMember.lastName}</strong> from{' '}
                <strong>all projects</strong>?
              </p>

              <div className="alert alert-warning">
                <AlertCircle size={18} />
                <div>
                  <strong>This will remove the member from:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                    {selectedMember.projects
                      .filter(p => p.role !== 'Team Leader')
                      .map(p => (
                        <li key={p._id}>{p.name}</li>
                      ))}
                  </ul>
                  <p style={{ marginTop: '0.5rem' }}>
                    All tasks will be reassigned to you.
                  </p>
                </div>
              </div>

              {selectedMember.projects.some(p => p.role === 'Team Leader') && (
                <div className="alert alert-warning">
                  <AlertCircle size={18} />
                  <strong>Note:</strong> This member is a Team Leader in some projects. 
                  They will NOT be removed from those projects.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleRemoveConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={handleCloseAddMemberModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Members to Project</h2>
              <button className="close-btn" onClick={handleCloseAddMemberModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {loadingProjects ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  {/* Project Selection */}
                  <div className="form-group">
                    <label>Select Project *</label>
                    <select
                      value={selectedProjectForAdd}
                      onChange={(e) => setSelectedProjectForAdd(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Choose a project...</option>
                      {pmProjects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name} ({project.members?.length || 0}/{project.maxTeamSize || 10} members)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Member Selection */}
                  <div className="form-group">
                    <label>Select Members * ({selectedUsers.length} selected)</label>
                    <div className="user-selection-grid">
                      {availableUsers.length === 0 ? (
                        <p className="no-data">No available members to add</p>
                      ) : (
                        availableUsers.map((user) => {
                          const isSelected = selectedUsers.includes(user._id);
                          const capacityPercentage = (user.capacity?.currentProjects / user.capacity?.maxProjects) * 100;
                          const capacityColor = getCapacityColor(capacityPercentage);

                          return (
                            <div
                              key={user._id}
                              className={`user-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleUserSelection(user._id)}
                            >
                              <div className="user-card-header">
                                <div className="user-avatar">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="user-info">
                                  <h4>{user.name}</h4>
                                  <p>{user.email}</p>
                                </div>
                                {isSelected && (
                                  <div className="selected-check">✓</div>
                                )}
                              </div>
                              <div className="user-card-meta">
                                {user.specialization && user.specialization !== 'general' && (
                                  <span className={`spec-badge spec-${user.specialization.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {user.specialization}
                                  </span>
                                )}
                                <span className={`capacity-badge ${capacityColor}`}>
                                  {user.capacity?.currentProjects || 0}/{user.capacity?.maxProjects || 5}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={handleCloseAddMemberModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddMembersToProject}
                disabled={actionLoading || !selectedProjectForAdd || selectedUsers.length === 0}
              >
                {actionLoading ? 'Adding...' : `Add ${selectedUsers.length} Member(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMAllMembers;


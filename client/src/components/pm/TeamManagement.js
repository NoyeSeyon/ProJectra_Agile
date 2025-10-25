import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Settings,
  AlertCircle,
  Trash2,
  Edit2,
  CheckCircle,
  X
} from 'lucide-react';
import axios from 'axios';
import './TeamManagement.css';

const TeamManagement = ({ projectId, project, onUpdate }) => {
  const [members, setMembers] = useState([]);
  const [teamLeader, setTeamLeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showChangeTLModal, setShowChangeTLModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  
  // Selected member/user
  const [selectedMember, setSelectedMember] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  
  // Loading states
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [changingTL, setChangingTL] = useState(false);
  const [updatingSpec, setUpdatingSpec] = useState(false);

  useEffect(() => {
    if (project) {
      setMembers(project.members || []);
      setTeamLeader(project.teamLeader || null);
    }
  }, [project]);

  // Fetch available users for adding
  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/pm/available-members');
      setAvailableUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching available users:', err);
      setError('Failed to load available users');
    }
  };

  // Open add member modal
  const handleAddMemberClick = async () => {
    await fetchAvailableUsers();
    setShowAddModal(true);
    setSelectedUserId('');
    setSelectedSpecialization('');
    setError('');
  };

  // Add member to project
  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setAdding(true);
      setError('');

      await axios.post(`/api/pm/projects/${projectId}/members`, {
        userId: selectedUserId,
        specialization: selectedSpecialization
      });

      setShowAddModal(false);
      setSelectedUserId('');
      setSelectedSpecialization('');
      
      // Refresh project data
      if (onUpdate) onUpdate();
      
      alert('Member added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  // Open remove modal
  const handleRemoveMemberClick = (member) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
    setError('');
  };

  // Remove member from project
  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setRemoving(true);
      setError('');

      const response = await axios.delete(
        `/api/pm/projects/${projectId}/members/${selectedMember.user._id}`
      );

      setShowRemoveModal(false);
      setSelectedMember(null);
      
      // Refresh project data
      if (onUpdate) onUpdate();
      
      const tasksReassigned = response.data.tasksReassigned || 0;
      alert(
        `Member removed successfully! ${tasksReassigned} task(s) have been reassigned to you.`
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  // Open change TL modal
  const handleChangeTLClick = async () => {
    await fetchAvailableUsers();
    setShowChangeTLModal(true);
    setSelectedUserId('');
    setError('');
  };

  // Change team leader
  const handleChangeTeamLeader = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setChangingTL(true);
      setError('');

      await axios.put(`/api/pm/projects/${projectId}/team-leader`, {
        teamLeaderId: selectedUserId
      });

      setShowChangeTLModal(false);
      setSelectedUserId('');
      
      // Refresh project data
      if (onUpdate) onUpdate();
      
      alert('Team leader updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team leader');
    } finally {
      setChangingTL(false);
    }
  };

  // Remove team leader
  const handleRemoveTeamLeader = async () => {
    if (!window.confirm('Are you sure you want to remove the team leader?')) {
      return;
    }

    try {
      setChangingTL(true);
      setError('');

      await axios.put(`/api/pm/projects/${projectId}/team-leader`, {
        teamLeaderId: null
      });

      setShowChangeTLModal(false);
      
      // Refresh project data
      if (onUpdate) onUpdate();
      
      alert('Team leader removed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove team leader');
    } finally {
      setChangingTL(false);
    }
  };

  // Open specialization modal
  const handleEditSpecializationClick = (member) => {
    setSelectedMember(member);
    setSelectedSpecialization(member.user.specialization || '');
    setShowSpecializationModal(true);
    setError('');
  };

  // Update member specialization
  const handleUpdateSpecialization = async () => {
    if (!selectedMember) return;

    try {
      setUpdatingSpec(true);
      setError('');

      await axios.put(
        `/api/pm/projects/${projectId}/members/${selectedMember.user._id}/specialization`,
        { specialization: selectedSpecialization }
      );

      setShowSpecializationModal(false);
      setSelectedMember(null);
      setSelectedSpecialization('');
      
      // Refresh project data
      if (onUpdate) onUpdate();
      
      alert('Specialization updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update specialization');
    } finally {
      setUpdatingSpec(false);
    }
  };

  // Get specialization display with filter
  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general' || spec === 'None') return null;
    return spec;
  };

  // Specialization options
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

  return (
    <div className="team-management">
      <div className="team-header">
        <div className="header-left">
          <Users size={24} />
          <h2>Team Management</h2>
        </div>
        <button className="btn-add-member" onClick={handleAddMemberClick}>
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Team Leader Section */}
      <div className="team-leader-section">
        <div className="section-header">
          <div className="header-title">
            <Crown size={20} />
            <h3>Team Leader</h3>
          </div>
          <button className="btn-change-tl" onClick={handleChangeTLClick}>
            <Settings size={16} />
            Change Team Leader
          </button>
        </div>

        {teamLeader ? (
          <div className="team-leader-card">
            <div className="member-avatar">
              <div className="avatar-placeholder">
                {teamLeader.firstName?.[0]}{teamLeader.lastName?.[0]}
              </div>
            </div>
            <div className="member-info">
              <div className="member-name">
                {teamLeader.firstName} {teamLeader.lastName}
              </div>
              <div className="member-email">{teamLeader.email}</div>
              {getSpecializationDisplay(teamLeader.specialization) && (
                <div className="member-specialization">
                  <span className="badge badge-specialization">
                    {teamLeader.specialization}
                  </span>
                </div>
              )}
            </div>
            <div className="member-badge">
              <Crown size={20} />
              <span>Team Leader</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Crown size={48} />
            <p>No Team Leader assigned</p>
            <span>Click "Change Team Leader" to assign one</span>
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <div className="team-members-section">
        <div className="section-header">
          <h3>Team Members ({members.length})</h3>
        </div>

        {members.length > 0 ? (
          <div className="members-grid">
            {members.map((member) => (
              <div key={member.user._id} className="member-card">
                <div className="member-avatar">
                  <div className="avatar-placeholder">
                    {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                  </div>
                </div>
                <div className="member-info">
                  <div className="member-name">
                    {member.user.firstName} {member.user.lastName}
                  </div>
                  <div className="member-email">{member.user.email}</div>
                  {getSpecializationDisplay(member.user.specialization) && (
                    <div className="member-specialization">
                      <span className="badge badge-specialization">
                        {member.user.specialization}
                      </span>
                    </div>
                  )}
                </div>
                <div className="member-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEditSpecializationClick(member)}
                    title="Edit Specialization"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleRemoveMemberClick(member)}
                    title="Remove Member"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <p>No team members yet</p>
            <span>Click "Add Member" to add team members to this project</span>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member to Project</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Select User *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={adding}
                >
                  <option value="">-- Select a user --</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email}) - {user.currentProjects}/5 projects
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Specialization (Optional)</label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  disabled={adding}
                >
                  <option value="">-- Select specialization --</option>
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
                onClick={() => setShowAddModal(false)}
                disabled={adding}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddMember}
                disabled={adding || !selectedUserId}
              >
                {adding ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Member</h3>
              <button className="btn-close" onClick={() => setShowRemoveModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <p className="confirm-text">
                Are you sure you want to remove{' '}
                <strong>
                  {selectedMember.user.firstName} {selectedMember.user.lastName}
                </strong>{' '}
                from this project?
              </p>

              <div className="alert alert-warning">
                <AlertCircle size={18} />
                All tasks assigned to this member will be reassigned to you.
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRemoveModal(false)}
                disabled={removing}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleRemoveMember}
                disabled={removing}
              >
                {removing ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Team Leader Modal */}
      {showChangeTLModal && (
        <div className="modal-overlay" onClick={() => setShowChangeTLModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Team Leader</h3>
              <button className="btn-close" onClick={() => setShowChangeTLModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {teamLeader && (
                <div className="current-tl">
                  <label>Current Team Leader:</label>
                  <div className="tl-info">
                    <Crown size={18} />
                    <span>
                      {teamLeader.firstName} {teamLeader.lastName}
                    </span>
                  </div>
                  <button
                    className="btn-remove-tl"
                    onClick={handleRemoveTeamLeader}
                    disabled={changingTL}
                  >
                    Remove Team Leader
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>Select New Team Leader *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={changingTL}
                >
                  <option value="">-- Select a user --</option>
                  {availableUsers
                    .filter((user) => user.hasTeamLeaderCapacity)
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} - {user.currentTeamLeaderProjects}/1 TL projects
                      </option>
                    ))}
                </select>
                <small className="form-hint">
                  Only users with team leader capacity are shown (max 1 TL project)
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowChangeTLModal(false)}
                disabled={changingTL}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleChangeTeamLeader}
                disabled={changingTL || !selectedUserId}
              >
                {changingTL ? 'Updating...' : 'Change Team Leader'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Specialization Modal */}
      {showSpecializationModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowSpecializationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Specialization</h3>
              <button className="btn-close" onClick={() => setShowSpecializationModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <p className="member-name-display">
                {selectedMember.user.firstName} {selectedMember.user.lastName}
              </p>

              <div className="form-group">
                <label>Specialization *</label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  disabled={updatingSpec}
                >
                  <option value="">-- Select specialization --</option>
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
                onClick={() => setShowSpecializationModal(false)}
                disabled={updatingSpec}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdateSpecialization}
                disabled={updatingSpec || !selectedSpecialization}
              >
                {updatingSpec ? 'Updating...' : 'Update Specialization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;


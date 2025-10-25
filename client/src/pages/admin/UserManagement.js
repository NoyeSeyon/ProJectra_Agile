import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Copy,
  Send,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  getOrganizationUsers,
  changeUserRole,
  toggleUserStatus
} from '../../services/adminService';
import {
  sendInvitation,
  getInvitations,
  resendInvitation,
  cancelInvitation
} from '../../services/invitationService';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitationsTab, setShowInvitationsTab] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizationUsers();
      setUsers(data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const data = await getInvitations({ status: 'all' });
      console.log('📧 Invitations fetched:', data);
      console.log('📧 Invitations array:', data.data?.invitations);
      setInvitations(data.data?.invitations || []);
    } catch (err) {
      console.error('❌ Error fetching invitations:', err);
      console.error('❌ Error response:', err.response?.data);
    }
  };

  const handleInviteUser = async (userData) => {
    try {
      const result = await sendInvitation(userData);
      setShowInviteModal(false);
      fetchUsers();
      fetchInvitations();
      
      // Show success with invite link
      if (result.data?.inviteLink) {
        alert(`Invitation sent successfully!\n\n${result.data.emailSent ? '✅ Email sent to ' + userData.email : '⚠️ Email not sent (check SMTP config)'}\n\nInvite Link:\n${result.data.inviteLink}`);
      } else {
        alert('Invitation sent successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const result = await resendInvitation(invitationId);
      fetchInvitations();
      alert(`Invitation resent!\n\n${result.data.emailSent ? '✅ Email sent' : '⚠️ Email not sent'}\n\nInvite Link:\n${result.data.inviteLink}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }
    try {
      await cancelInvitation(invitationId);
      fetchInvitations();
      alert('Invitation cancelled successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Invite link copied to clipboard!');
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    try {
      await changeUserRole(userId, newRole);
      fetchUsers();
      alert('User role updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers();
      alert('User status updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    
    const matchesSpecialization = filterSpecialization === 'all' || 
      user.specialization === filterSpecialization;
    
    return matchesSearch && matchesRole && matchesStatus && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="user-management loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage organization members, roles, and permissions</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          <Send size={20} />
          Send Invitation
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${!showInvitationsTab ? 'active' : ''}`}
          onClick={() => setShowInvitationsTab(false)}
        >
          <Users size={18} />
          Active Users ({users.length})
        </button>
        <button 
          className={`tab-btn ${showInvitationsTab ? 'active' : ''}`}
          onClick={() => {
            setShowInvitationsTab(true);
            fetchInvitations(); // Refresh when switching to this tab
          }}
        >
          <Mail size={18} />
          Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
        </button>
      </div>

      {!showInvitationsTab && (
        <>
          <div className="users-stats">
            <div className="stat-item">
              <Users size={20} />
              <span>{users.length} Total Users</span>
            </div>
            <div className="stat-item">
              <Shield size={20} />
              <span>{users.filter(u => u.role === 'admin').length} Admins</span>
            </div>
            <div className="stat-item">
              <UserPlus size={20} />
              <span>{users.filter(u => u.role === 'project_manager').length} PMs</span>
            </div>
            <div className="stat-item active">
              <ToggleRight size={20} />
              <span>{users.filter(u => u.isActive).length} Active</span>
            </div>
          </div>
        </>
      )}

      <div className="users-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="project_manager">Project Manager</option>
          <option value="team_leader">Team Leader</option>
          <option value="member">Member</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterSpecialization}
          onChange={(e) => setFilterSpecialization(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Specializations</option>
          <option value="general">General / No Specialization</option>
          <option value="UI/UX Designer">UI/UX Designer</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="QA Engineer">QA Engineer</option>
          <option value="DevOps Engineer">DevOps Engineer</option>
          <option value="Product Manager">Product Manager</option>
          <option value="Business Analyst">Business Analyst</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Marketing Specialist">Marketing Specialist</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
          <option value="Mobile Developer">Mobile Developer</option>
          <option value="Database Administrator">Database Administrator</option>
          <option value="System Administrator">System Administrator</option>
          <option value="Security Engineer">Security Engineer</option>
          <option value="AI/ML Engineer">AI/ML Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Cloud Architect">Cloud Architect</option>
          <option value="Technical Writer">Technical Writer</option>
        </select>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      {!showInvitationsTab && (
        <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <span className="user-name">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      className="role-select"
                      disabled={user.role === 'super_admin'}
                    >
                      <option value="admin">Admin</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td>
                    {(user.role === 'member' || user.role === 'team_leader') ? (
                      <span className="specialization-badge">
                        {user.specialization && user.specialization !== 'general' 
                          ? user.specialization 
                          : 'No Specialization'}
                      </span>
                    ) : (
                      <span className="specialization-na">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-toggle"
                        onClick={() => handleToggleStatus(user._id)}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        disabled={user.role === 'super_admin'}
                      >
                        {user.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  <div className="empty-state-table">
                    <Users size={48} />
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Invitations Table */}
      {showInvitationsTab && (
        <div className="invitations-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Invited By</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <tr key={invitation._id}>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} />
                        {invitation.email}
                      </div>
                    </td>
                    <td>
                      {invitation.metadata?.firstName || ''} {invitation.metadata?.lastName || ''}
                    </td>
                    <td>
                      <span className="role-badge">{invitation.role?.replace('_', ' ')}</span>
                    </td>
                    <td>
                      {invitation.invitedBy?.firstName} {invitation.invitedBy?.lastName}
                    </td>
                    <td>
                      <span className={`status-badge ${invitation.status}`}>
                        {invitation.status}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Clock size={14} />
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {invitation.status === 'pending' && (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => copyToClipboard(`${window.location.origin}/register?invite=${invitation.token}`)}
                              title="Copy Invite Link"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleResendInvitation(invitation._id)}
                              title="Resend Invitation"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => handleCancelInvitation(invitation._id)}
                              title="Cancel Invitation"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-row">
                    <div className="empty-state-table">
                      <Mail size={48} />
                      <p>No invitations sent yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
        />
      )}
    </div>
  );
};

// Invite User Modal Component
const InviteUserModal = ({ onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'member',
    specialization: 'general',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Send size={24} />
            Send Invitation
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="member">Member</option>
              <option value="team_leader">Team Leader</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {(formData.role === 'member' || formData.role === 'team_leader') && (
            <div className="form-group">
              <label>Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="general">General / No Specialization</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Marketing Specialist">Marketing Specialist</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="Database Administrator">Database Administrator</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Security Engineer">Security Engineer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Cloud Architect">Cloud Architect</option>
                <option value="Technical Writer">Technical Writer</option>
              </select>
              <small className="form-hint">Specialization will help in task assignment</small>
            </div>
          )}
          <div className="form-group">
            <label>Personal Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add a personal message to the invitation email..."
              rows="3"
              maxLength="500"
            />
            <small>{formData.message.length}/500 characters</small>
          </div>
          <div className="info-box">
            <Mail size={16} />
            <span>An invitation email will be sent with a secure registration link</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Send size={18} />
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;


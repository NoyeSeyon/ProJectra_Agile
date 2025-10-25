import React, { useState, useEffect } from 'react';
import { Plus, Mail, Copy, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MemberManagement = ({ organizationId }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
    firstName: '',
    lastName: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInvitations();
  }, [organizationId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/invitations');
      setInvitations(response.data.data.invitations);
      setError('');
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/invitations', inviteForm);
      
      setSuccess('Invitation sent successfully!');
      setInviteForm({
        email: '',
        role: 'member',
        firstName: '',
        lastName: '',
        message: ''
      });
      setShowInviteForm(false);
      
      // Reload invitations
      await loadInvitations();
      
      // Copy invite link to clipboard
      if (response.data.data.inviteLink) {
        navigator.clipboard.writeText(response.data.data.inviteLink);
        setSuccess('Invitation sent and link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to send invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const response = await axios.post(`/api/invitations/${invitationId}/resend`);
      
      // Copy new invite link to clipboard
      if (response.data.data.inviteLink) {
        navigator.clipboard.writeText(response.data.data.inviteLink);
        setSuccess('Invitation resent and link copied to clipboard!');
      }
      
      // Reload invitations
      await loadInvitations();
    } catch (err) {
      console.error('Failed to resend invitation:', err);
      setError(err.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      await axios.delete(`/api/invitations/${invitationId}`);
      setSuccess('Invitation cancelled successfully');
      
      // Reload invitations
      await loadInvitations();
    } catch (err) {
      console.error('Failed to cancel invitation:', err);
      setError(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'project_manager': return 'text-blue-600';
      case 'member': return 'text-green-600';
      case 'client': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Team Invitations</h3>
          <p className="text-sm text-gray-600">Manage team member invitations</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Invite Member
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4">Send Invitation</h4>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <select
                  required
                  className="input"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="member">Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div>
                <label className="label">First Name (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="label">Last Name (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="label">Message (Optional)</label>
              <textarea
                className="input"
                rows={3}
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Welcome to our team! We're excited to have you join us."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invitations List */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4">Pending Invitations</h4>
        {invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Mail size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {invitation.metadata?.firstName && invitation.metadata?.lastName
                        ? `${invitation.metadata.firstName} ${invitation.metadata.lastName}`
                        : invitation.email}
                    </p>
                    <p className="text-sm text-gray-500">{invitation.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                      <span className={`text-xs font-medium ${getRoleColor(invitation.role)}`}>
                        {invitation.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invitation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleResendInvitation(invitation._id)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                        title="Resend invitation"
                      >
                        <Copy size={14} />
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancelInvitation(invitation._id)}
                        className="btn btn-danger btn-sm flex items-center gap-1"
                        title="Cancel invitation"
                      >
                        <UserX size={14} />
                        Cancel
                      </button>
                    </>
                  )}
                  {invitation.status === 'accepted' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <UserCheck size={14} />
                      Joined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No invitations sent yet</p>
            <p className="text-sm text-gray-400">Invite team members to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;

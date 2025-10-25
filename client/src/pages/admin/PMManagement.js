import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  X,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import {
  getPMs,
  getOrganizationUsers,
  assignPM,
  unassignPM,
  updatePMCapacity
} from '../../services/adminService';
import './PMManagement.css';

const PMManagement = () => {
  const [pms, setPMs] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedPM, setSelectedPM] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pmsData, usersData] = await Promise.all([
        getPMs(),
        getOrganizationUsers({ role: 'member' })
      ]);
      setPMs(pmsData.data || []);
      setAvailableUsers(usersData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPM = async (userId, maxProjects) => {
    try {
      await assignPM(userId, maxProjects);
      setShowAssignModal(false);
      fetchData();
      alert('PM assigned successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign PM');
    }
  };

  const handleUnassignPM = async (userId) => {
    if (!window.confirm('Are you sure you want to remove PM role? This user must not have active projects.')) {
      return;
    }
    try {
      await unassignPM(userId);
      fetchData();
      alert('PM role removed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove PM role');
    }
  };

  const handleUpdateCapacity = async (maxProjects) => {
    try {
      await updatePMCapacity(selectedPM._id, maxProjects);
      setShowCapacityModal(false);
      setSelectedPM(null);
      fetchData();
      alert('PM capacity updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update capacity');
    }
  };

  const filteredPMs = pms.filter(pm => {
    const matchesSearch = 
      pm.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="pm-management loading">
        <div className="spinner"></div>
        <p>Loading PM data...</p>
      </div>
    );
  }

  return (
    <div className="pm-management">
      <div className="pm-header">
        <div>
          <h1>Project Manager Management</h1>
          <p>Assign and manage project managers in your organization</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAssignModal(true)}
        >
          <Plus size={20} />
          Assign New PM
        </button>
      </div>

      <div className="pm-stats">
        <div className="stat-box">
          <UserCog size={24} />
          <div>
            <h3>{pms.length}</h3>
            <p>Total PMs</p>
          </div>
        </div>
        <div className="stat-box">
          <Briefcase size={24} />
          <div>
            <h3>{pms.reduce((sum, pm) => sum + (pm.activeProjectsCount || 0), 0)}</h3>
            <p>Active Projects</p>
          </div>
        </div>
        <div className="stat-box">
          <TrendingUp size={24} />
          <div>
            <h3>
              {pms.length > 0 
                ? Math.round(pms.reduce((sum, pm) => sum + (pm.capacityUsage || 0), 0) / pms.length)
                : 0}%
            </h3>
            <p>Avg. Capacity Usage</p>
          </div>
        </div>
      </div>

      <div className="pm-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search PMs by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="pm-list">
        {filteredPMs.length > 0 ? (
          filteredPMs.map((pm) => (
            <div key={pm._id} className="pm-card">
              <div className="pm-avatar">
                {pm.firstName?.[0]}{pm.lastName?.[0]}
              </div>
              <div className="pm-info">
                <h3>{pm.firstName} {pm.lastName}</h3>
                <p>{pm.email}</p>
                <div className="pm-meta">
                  <span className="pm-projects">
                    <Briefcase size={14} />
                    {pm.activeProjectsCount || 0}/{pm.capacity?.maxProjects || 0} projects
                  </span>
                </div>
              </div>
              <div className="pm-capacity">
                <div className="capacity-bar-container">
                  <div 
                    className="capacity-bar"
                    style={{ width: `${Math.min(pm.capacityUsage || 0, 100)}%` }}
                  />
                </div>
                <span className="capacity-text">
                  {Math.round(pm.capacityUsage || 0)}% capacity
                </span>
              </div>
              <div className="pm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedPM(pm);
                    setShowCapacityModal(true);
                  }}
                  title="Update Capacity"
                >
                  <Edit size={16} />
                  Edit Capacity
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleUnassignPM(pm._id)}
                  title="Remove PM Role"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <UserCog size={64} />
            <h3>No Project Managers Yet</h3>
            <p>Assign your first PM to get started</p>
            <button 
              className="btn-primary"
              onClick={() => setShowAssignModal(true)}
            >
              <Plus size={20} />
              Assign PM
            </button>
          </div>
        )}
      </div>

      {/* Assign PM Modal */}
      {showAssignModal && (
        <AssignPMModal
          users={availableUsers}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignPM}
        />
      )}

      {/* Update Capacity Modal */}
      {showCapacityModal && selectedPM && (
        <UpdateCapacityModal
          pm={selectedPM}
          onClose={() => {
            setShowCapacityModal(false);
            setSelectedPM(null);
          }}
          onUpdate={handleUpdateCapacity}
        />
      )}
    </div>
  );
};

// Assign PM Modal Component
const AssignPMModal = ({ users, onClose, onAssign }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [maxProjects, setMaxProjects] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }
    onAssign(selectedUser, maxProjects);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Project Manager</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Search Users</label>
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Select User *</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Choose a user...</option>
              {filteredUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} - {user.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Maximum Projects *</label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxProjects}
              onChange={(e) => setMaxProjects(Number(e.target.value))}
              required
            />
            <small>Set the maximum number of projects this PM can manage (1-20)</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle size={18} />
              Assign as PM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Capacity Modal Component
const UpdateCapacityModal = ({ pm, onClose, onUpdate }) => {
  const [maxProjects, setMaxProjects] = useState(pm.capacity?.maxProjects || 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(maxProjects);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update PM Capacity</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="pm-info-display">
            <div className="pm-avatar">
              {pm.firstName?.[0]}{pm.lastName?.[0]}
            </div>
            <div>
              <h3>{pm.firstName} {pm.lastName}</h3>
              <p>{pm.email}</p>
              <span className="current-projects">
                Currently managing: {pm.activeProjectsCount || 0} projects
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Maximum Projects *</label>
            <input
              type="number"
              min={pm.activeProjectsCount || 1}
              max="20"
              value={maxProjects}
              onChange={(e) => setMaxProjects(Number(e.target.value))}
              required
            />
            <small>
              Must be at least {pm.activeProjectsCount || 0} (current active projects)
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle size={18} />
              Update Capacity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PMManagement;


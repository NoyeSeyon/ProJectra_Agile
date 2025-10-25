import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Users, DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './ProjectCreationModal.css';

const ProjectCreationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    priority: 'medium',
    weight: 5,
    budget: {
      planned: '',
      currency: 'USD',
      alertThreshold: 80
    },
    teamLeader: '',
    teamMembers: []
  });

  const [availableTeamLeaders, setAvailableTeamLeaders] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      console.log('🔄 Fetching available users...');
      
      // First, call debug endpoint to see all users
      const debugResponse = await axios.get('/api/pm/debug-users');
      console.log('🔍 DEBUG INFO:', debugResponse.data);
      
      // Fetch users who can be team leaders (members with capacity)
      const tlResponse = await axios.get('/api/pm/available-team-leaders');
      console.log('✅ Team Leaders Response:', tlResponse.data);
      setAvailableTeamLeaders(tlResponse.data.users || []);

      // Fetch all team members
      const membersResponse = await axios.get('/api/pm/available-members');
      console.log('✅ Members Response:', membersResponse.data);
      setAvailableMembers(membersResponse.data.users || []);

      if ((tlResponse.data.users || []).length === 0 && (membersResponse.data.users || []).length === 0) {
        console.warn('⚠️ No team members or team leaders found!');
        setError('No team members or team leaders found in your organization. Please check with your admin.');
      }
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load team members. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('budget.')) {
      const budgetField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        budget: { ...prev.budget, [budgetField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum end date (start date + 1 day or today, whichever is later)
  const getMinEndDate = () => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1); // End date must be at least 1 day after start
      return startDate.toISOString().split('T')[0];
    }
    return getTodayDate();
  };

  const handleWeightChange = (e) => {
    const weight = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, weight }));
  };

  const handleTeamMemberToggle = (userId) => {
    setFormData(prev => {
      const teamMembers = prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId];
      return { ...prev, teamMembers };
    });
  };

  const getComplexity = (weight) => {
    if (weight <= 3) return { label: 'Light', color: '#10b981' };
    if (weight <= 7) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'Heavy', color: '#ef4444' };
  };

  const complexity = getComplexity(formData.weight);

  const getTeamSizeLimit = (weight) => {
    if (weight <= 3) return 3;
    if (weight <= 7) return 6;
    return 10;
  };

  const teamSizeLimit = getTeamSizeLimit(formData.weight);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    // Date validation
    if (formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(formData.startDate);
      
      if (startDate < today) {
        setError('Start date cannot be in the past');
        return;
      }
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        setError('End date must be after start date');
        return;
      }
    }

    if (formData.teamMembers.length > teamSizeLimit) {
      setError(`Team size exceeds limit of ${teamSizeLimit} for this project weight`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        budget: {
          ...formData.budget,
          planned: parseFloat(formData.budget.planned) || 0
        }
      };

      await axios.post('/api/pm/projects', payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      priority: 'medium',
      weight: 5,
      budget: { planned: '', currency: 'USD', alertThreshold: 80 },
      teamLeader: '',
      teamMembers: []
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info Section */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Project description..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  title="Start date cannot be in the past"
                />
                <small>Cannot select past dates</small>
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={getMinEndDate()}
                  disabled={!formData.startDate}
                  title={formData.startDate ? "End date must be after start date" : "Please select start date first"}
                />
                <small>
                  {formData.startDate 
                    ? "Must be after start date" 
                    : "Select start date first"}
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Weight & Complexity */}
          <div className="form-section">
            <h3>
              <TrendingUp size={20} />
              Project Weight & Complexity
            </h3>
            
            <div className="weight-slider-container">
              <div className="weight-header">
                <label>Project Weight: {formData.weight}</label>
                <span 
                  className="complexity-badge"
                  style={{ backgroundColor: complexity.color }}
                >
                  {complexity.label}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={formData.weight}
                onChange={handleWeightChange}
                className="weight-slider"
                style={{
                  background: `linear-gradient(to right, ${complexity.color} 0%, ${complexity.color} ${formData.weight * 10}%, #e2e8f0 ${formData.weight * 10}%, #e2e8f0 100%)`
                }}
              />

              <div className="weight-labels">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>

              <div className="weight-info">
                <p>Team size limit for this weight: <strong>{teamSizeLimit} members</strong></p>
                <p className="weight-description">
                  {formData.weight <= 3 && "Light projects: Small tasks, quick delivery, minimal resources."}
                  {formData.weight > 3 && formData.weight <= 7 && "Medium projects: Standard scope, moderate complexity, balanced resources."}
                  {formData.weight > 7 && "Heavy projects: Large scale, high complexity, extensive resources required."}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Section */}
          <div className="form-section">
            <h3>
              <DollarSign size={20} />
              Budget Management
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Planned Budget</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="budget.planned"
                    value={formData.budget.planned}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <select
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleChange}
                    className="currency-select"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="LKR">LKR</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Alert Threshold (%)</label>
                <input
                  type="number"
                  name="budget.alertThreshold"
                  value={formData.budget.alertThreshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="80"
                />
                <small>Alert when budget reaches this percentage</small>
              </div>
            </div>
          </div>

          {/* Team Assignment Section */}
          <div className="form-section">
            <h3>
              <Users size={20} />
              Team Assignment
            </h3>

            <div className="form-group">
              <label>Team Leader</label>
              <select
                name="teamLeader"
                value={formData.teamLeader}
                onChange={handleChange}
                >
                  <option value="">Select Team Leader (Optional)</option>
                  {availableTeamLeaders.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                      {user.specialization && user.specialization !== 'general' && user.specialization !== 'None' 
                        ? ` - ${user.specialization}` 
                        : ''}
                      {user.currentProjects !== undefined && ` (${user.currentProjects}/5 projects)`}
                    </option>
                  ))}
                </select>
            </div>

            <div className="form-group">
              <label>
                Team Members (0/{teamSizeLimit} selected)
                <span className="member-count">
                  {formData.teamMembers.length} / {teamSizeLimit}
                </span>
              </label>
              
              <div className="member-selection">
                {availableMembers.length > 0 ? (
                  availableMembers.map(member => {
                    const isSelected = formData.teamMembers.includes(member._id);
                    const isAtCapacity = member.currentProjects >= 5;
                    const isDisabled = !isSelected && (isAtCapacity || formData.teamMembers.length >= teamSizeLimit);

                    return (
                      <div
                        key={member._id}
                        className={`member-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleTeamMemberToggle(member._id)}
                      >
                        <div className="member-info">
                          <div className="member-avatar">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <div className="member-details">
                            <h4>{member.firstName} {member.lastName}</h4>
                            {member.specialization && member.specialization !== 'general' && member.specialization !== 'None' && (
                              <p className="specialization">{member.specialization}</p>
                            )}
                            <p className="capacity">
                              {member.currentProjects || 0}/5 projects
                              {isAtCapacity && <span className="at-capacity"> (At Capacity)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="member-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            readOnly
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-members">No team members available</p>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;


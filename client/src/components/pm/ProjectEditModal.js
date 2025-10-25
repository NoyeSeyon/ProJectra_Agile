import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import './ProjectCreationModal.css';

const ProjectEditModal = ({ isOpen, onClose, project, onSuccess }) => {
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
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form with existing project data
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        weight: project.weight || 5,
        budget: {
          planned: project.budget?.planned || '',
          currency: project.budget?.currency || 'USD',
          alertThreshold: project.budget?.alertThreshold || 80
        }
      });
      setError('');
    }
  }, [project, isOpen]);

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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1);
      return startDate.toISOString().split('T')[0];
    }
    return getTodayDate();
  };

  const handleWeightChange = (e) => {
    const weight = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, weight }));
  };

  const getComplexity = (weight) => {
    if (weight <= 3) return { label: 'Light', color: '#10b981' };
    if (weight <= 7) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'Heavy', color: '#ef4444' };
  };

  const complexity = getComplexity(formData.weight);

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
      
      // Allow current start date (from existing project)
      const originalStartDate = project.startDate ? new Date(project.startDate) : null;
      if (originalStartDate) {
        originalStartDate.setHours(0, 0, 0, 0);
      }
      
      if (startDate < today && (!originalStartDate || startDate.getTime() !== originalStartDate.getTime())) {
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

    try {
      setLoading(true);

      // Create update payload
      const updateData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        priority: formData.priority,
        weight: formData.weight,
        budget: {
          planned: parseFloat(formData.budget.planned) || 0,
          currency: formData.budget.currency,
          alertThreshold: parseInt(formData.budget.alertThreshold) || 80
        }
      };

      // Call update API endpoint
      await axios.put(`/api/pm/projects/${project._id}`, updateData);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
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
                placeholder="Enter project description"
                rows={3}
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
                />
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
                />
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

          {/* Project Weight Section */}
          <div className="form-section">
            <h3>
              <TrendingUp size={18} />
              Project Complexity
            </h3>

            <div className="form-group">
              <label>Weight (1-10)</label>
              <div className="weight-slider-container">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.weight}
                  onChange={handleWeightChange}
                  className="weight-slider"
                />
                <div className="weight-display">
                  <span className="weight-value">{formData.weight}</span>
                  <span className="complexity-badge" style={{ background: complexity.color }}>
                    {complexity.label}
                  </span>
                </div>
              </div>
              <p className="form-hint">
                Light (1-3): Simple projects | Medium (4-7): Standard projects | Heavy (8-10): Complex projects
              </p>
            </div>
          </div>

          {/* Budget Section */}
          <div className="form-section">
            <h3>
              <DollarSign size={18} />
              Budget
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Planned Budget</label>
                <input
                  type="number"
                  name="budget.planned"
                  value={formData.budget.planned}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select name="budget.currency" value={formData.budget.currency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="LKR">LKR (Rs)</option>
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
              />
              <p className="form-hint">Alert when budget usage exceeds this percentage</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditModal;


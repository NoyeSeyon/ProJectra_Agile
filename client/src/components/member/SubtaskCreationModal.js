import React, { useState } from 'react';
import { X, Plus, Trash2, User, Clock, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './SubtaskCreationModal.css';

const SubtaskCreationModal = ({ task, project, onClose, onSuccess }) => {
  const [subtasks, setSubtasks] = useState([
    {
      title: '',
      description: '',
      assignee: '',
      estimatedHours: '',
      storyPoints: '',
      priority: 'medium',
      requiredSpecialization: 'any'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const specializations = [
    { value: 'any', label: 'Any Specialization' },
    { value: 'ui_ux_designer', label: 'UI/UX Designer' },
    { value: 'software_engineer', label: 'Software Engineer' },
    { value: 'qa_engineer', label: 'QA Engineer' },
    { value: 'devops_engineer', label: 'DevOps Engineer' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'business_analyst', label: 'Business Analyst' },
    { value: 'data_analyst', label: 'Data Analyst' },
    { value: 'marketing_specialist', label: 'Marketing Specialist' }
  ];

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21];

  const addSubtask = () => {
    setSubtasks([
      ...subtasks,
      {
        title: '',
        description: '',
        assignee: '',
        estimatedHours: '',
        storyPoints: '',
        priority: 'medium',
        requiredSpecialization: 'any'
      }
    ]);
  };

  const removeSubtask = (index) => {
    if (subtasks.length > 1) {
      setSubtasks(subtasks.filter((_, i) => i !== index));
    }
  };

  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validSubtasks = subtasks.filter(st => st.title.trim());
    if (validSubtasks.length === 0) {
      setError('At least one subtask must have a title');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Format subtasks for API
      const formattedSubtasks = validSubtasks.map(st => ({
        title: st.title,
        description: st.description,
        assignee: st.assignee || null,
        estimatedHours: parseFloat(st.estimatedHours) || 0,
        storyPoints: parseInt(st.storyPoints) || 0,
        priority: st.priority,
        requiredSpecialization: st.requiredSpecialization
      }));

      const response = await axios.post('/api/team-leader/subtasks', {
        mainTaskId: task._id,
        subtasks: formattedSubtasks
      });

      if (response.data.success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Create subtasks error:', err);
      setError(err.response?.data?.message || 'Failed to create subtasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container subtask-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Break Down Task into Subtasks</h2>
            <p className="modal-subtitle">
              Main Task: <strong>{task.title}</strong>
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="modal-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="subtasks-container">
            {subtasks.map((subtask, index) => (
              <div key={index} className="subtask-form">
                <div className="subtask-header">
                  <h4>Subtask {index + 1}</h4>
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeSubtask(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  {/* Title */}
                  <div className="form-group full-width">
                    <label>
                      Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                      placeholder="Enter subtask title..."
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={subtask.description}
                      onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                      placeholder="Enter subtask description..."
                      rows="2"
                    />
                  </div>

                  {/* Assignee */}
                  <div className="form-group">
                    <label>
                      <User size={14} />
                      Assign To
                    </label>
                    <select
                      value={subtask.assignee}
                      onChange={(e) => updateSubtask(index, 'assignee', e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {project.members?.map(member => (
                        <option key={member.user._id} value={member.user._id}>
                          {member.user.firstName} {member.user.lastName}
                          {member.user.specialization && member.user.specialization !== 'general' 
                            ? ` (${member.user.specialization.replace(/_/g, ' ')})` 
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Required Specialization */}
                  <div className="form-group">
                    <label>
                      <Zap size={14} />
                      Required Skill
                    </label>
                    <select
                      value={subtask.requiredSpecialization}
                      onChange={(e) => updateSubtask(index, 'requiredSpecialization', e.target.value)}
                    >
                      {specializations.map(spec => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Hours */}
                  <div className="form-group">
                    <label>
                      <Clock size={14} />
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={subtask.estimatedHours}
                      onChange={(e) => updateSubtask(index, 'estimatedHours', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Story Points */}
                  <div className="form-group">
                    <label>Story Points</label>
                    <select
                      value={subtask.storyPoints}
                      onChange={(e) => updateSubtask(index, 'storyPoints', e.target.value)}
                    >
                      <option value="">Select...</option>
                      {storyPointsOptions.map(points => (
                        <option key={points} value={points}>{points}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={subtask.priority}
                      onChange={(e) => updateSubtask(index, 'priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Subtask Button */}
          <button
            type="button"
            className="btn-add-subtask"
            onClick={addSubtask}
          >
            <Plus size={18} />
            Add Another Subtask
          </button>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : `Create ${subtasks.filter(st => st.title.trim()).length} Subtask(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubtaskCreationModal;


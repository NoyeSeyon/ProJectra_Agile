import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Flag,
  Clock,
  Target,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import './TaskManagementModal.css';

const TaskManagementModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  taskToEdit = null,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    storyPoints: 0,
    estimatedHours: 0,
    dueDate: '',
    requiredSpecialization: 'any',
    dependencies: []
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#7c3aed' }
  ];

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

  const specializationOptions = [
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

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectData();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        assignee: taskToEdit.assignee?._id || '',
        priority: taskToEdit.priority || 'medium',
        storyPoints: taskToEdit.storyPoints || 0,
        estimatedHours: taskToEdit.timeTracking?.estimatedHours || 0,
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
        requiredSpecialization: taskToEdit.requiredSpecialization || 'any',
        dependencies: taskToEdit.dependencies?.map(d => d._id || d) || []
      });
    }
  }, [taskToEdit]);

  const loadProjectData = async () => {
    try {
      setLoadingUsers(true);
      
      // Load project details to get team members and team leader
      const projectRes = await axios.get(`/api/pm/projects/${projectId}`);
      const project = projectRes.data.project;

      // Combine team leader and members
      const users = [];
      
      if (project.teamLeader) {
        users.push({
          ...project.teamLeader,
          isTeamLeader: true
        });
      }

      if (project.members) {
        project.members.forEach(member => {
          // Avoid duplicate if TL is also in members array
          if (!project.teamLeader || member.user._id !== project.teamLeader._id) {
            users.push({
              ...member.user,
              isTeamLeader: false
            });
          }
        });
      }

      setAvailableUsers(users);

      // Load existing tasks for dependencies (exclude current task if editing)
      const tasksRes = await axios.get(`/api/pm/projects/${projectId}/tasks`);
      const tasks = tasksRes.data.tasks || [];
      
      const filteredTasks = tasks.filter(task => 
        !task.isSubtask && task._id !== taskToEdit?._id
      );
      
      setAvailableTasks(filteredTasks);

    } catch (err) {
      console.error('Load project data error:', err);
      setError('Failed to load project data');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDependencyToggle = (taskId) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(taskId)
        ? prev.dependencies.filter(id => id !== taskId)
        : [...prev.dependencies, taskId]
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Task title is required');
        setLoading(false);
        return;
      }

      // Validate due date is not in the past
      if (formData.dueDate) {
        const selectedDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        
        if (selectedDate < today) {
          setError('Due date cannot be in the past');
          setLoading(false);
          return;
        }
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee || null,
        priority: formData.priority,
        storyPoints: parseInt(formData.storyPoints),
        estimatedHours: parseFloat(formData.estimatedHours) || 0,
        dueDate: formData.dueDate || null,
        requiredSpecialization: formData.requiredSpecialization,
        dependencies: formData.dependencies
      };

      if (taskToEdit) {
        // Update existing task
        await axios.put(`/api/pm/tasks/${taskToEdit._id}`, payload);
      } else {
        // Create new task
        await axios.post(`/api/pm/projects/${projectId}/tasks`, payload);
      }

      // Success
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        storyPoints: 0,
        estimatedHours: 0,
        dueDate: '',
        requiredSpecialization: 'any',
        dependencies: []
      });

    } catch (err) {
      console.error('Task save error:', err);
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general' || spec === 'None') return null;
    return spec;
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="task-modal-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label required">Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              className="form-input"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description..."
              className="form-textarea"
              rows="4"
              disabled={loading}
            />
          </div>

          {/* Row: Assignee & Priority */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Assignee
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="form-select"
                disabled={loading || loadingUsers}
              >
                <option value="">Unassigned</option>
                {availableUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                    {user.isTeamLeader ? ' (Team Leader)' : ''}
                    {getSpecializationDisplay(user.specialization) 
                      ? ` - ${getSpecializationDisplay(user.specialization)}` 
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Flag size={16} />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div 
                className="priority-indicator" 
                style={{ backgroundColor: priorityOptions.find(p => p.value === formData.priority)?.color }}
              />
            </div>
          </div>

          {/* Row: Story Points & Estimated Hours */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Story Points
              </label>
              <select
                name="storyPoints"
                value={formData.storyPoints}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {storyPointsOptions.map(points => (
                  <option key={points} value={points}>
                    {points === 0 ? 'Not Estimated' : `${points} points`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
                min="0"
                step="0.5"
                disabled={loading}
              />
            </div>
          </div>

          {/* Row: Due Date & Specialization */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
                min={getTodayDate()}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Specialization</label>
              <select
                name="requiredSpecialization"
                value={formData.requiredSpecialization}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {specializationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dependencies */}
          {!taskToEdit && availableTasks.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                Dependencies (Optional)
                <span className="form-hint">Select tasks that must be completed first</span>
              </label>
              <div className="dependencies-list">
                {availableTasks.map(task => (
                  <div key={task._id} className="dependency-item">
                    <label className="dependency-label">
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(task._id)}
                        onChange={() => handleDependencyToggle(task._id)}
                        disabled={loading}
                      />
                      <span className="dependency-title">{task.title}</span>
                      <span className={`status-badge status-${task.status}`}>
                        {task.status}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="task-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? 'Saving...' : (taskToEdit ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskManagementModal;


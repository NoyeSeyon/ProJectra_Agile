import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle,
  Play,
  Pause,
  BarChart3,
  List,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import {
  getProjectSprints,
  createSprint,
  startSprint,
  completeSprint,
  getDaysRemaining,
  getSprintDuration,
  calculateSprintProgress,
  getSprintStatus
} from '../../services/sprintService';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PMSprints.css';

const PMSprints = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, planning, completed

  useEffect(() => {
    if (projectId) {
      loadSprints();
    }
  }, [projectId, filter]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const statusFilter = filter !== 'all' ? filter : null;
      const response = await getProjectSprints(projectId, statusFilter);
      setSprints(response.data.sprints || []);
    } catch (err) {
      console.error('Load sprints error:', err);
      setError(err.response?.data?.message || 'Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await startSprint(sprintId);
      loadSprints();
      
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'Sprint started successfully!',
          duration: 3000
        }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          message: err.response?.data?.message || 'Failed to start sprint',
          duration: 5000
        }
      }));
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      await completeSprint(sprintId);
      loadSprints();
      
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'Sprint completed! Time for retrospective.',
          duration: 3000
        }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          message: err.response?.data?.message || 'Failed to complete sprint',
          duration: 5000
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading sprints..." />
      </div>
    );
  }

  const activeSprint = sprints.find(s => s.status === 'active');
  const plannedSprints = sprints.filter(s => s.status === 'planning');
  const completedSprints = sprints.filter(s => s.status === 'completed');

  return (
    <div className="pm-sprints">
      {/* Header */}
      <div className="sprints-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1><Target size={28} /> Sprint Management</h1>
            <p>Plan, track, and manage agile sprints</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          New Sprint
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter */}
      <div className="sprints-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Sprints ({sprints.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          <Play size={16} />
          Active ({sprints.filter(s => s.status === 'active').length})
        </button>
        <button
          className={`filter-btn ${filter === 'planning' ? 'active' : ''}`}
          onClick={() => setFilter('planning')}
        >
          <List size={16} />
          Planning ({sprints.filter(s => s.status === 'planning').length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <CheckCircle size={16} />
          Completed ({sprints.filter(s => s.status === 'completed').length})
        </button>
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <div className="active-sprint-section">
          <h2><Play size={24} /> Active Sprint</h2>
          <SprintCard
            sprint={activeSprint}
            onStart={handleStartSprint}
            onComplete={handleCompleteSprint}
            navigate={navigate}
          />
        </div>
      )}

      {/* Planned Sprints */}
      {plannedSprints.length > 0 && (
        <div className="sprint-section">
          <h2><List size={24} /> Planned Sprints</h2>
          <div className="sprints-grid">
            {plannedSprints.map(sprint => (
              <SprintCard
                key={sprint._id}
                sprint={sprint}
                onStart={handleStartSprint}
                onComplete={handleCompleteSprint}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="sprint-section">
          <h2><CheckCircle size={24} /> Completed Sprints</h2>
          <div className="sprints-grid">
            {completedSprints.map(sprint => (
              <SprintCard
                key={sprint._id}
                sprint={sprint}
                onStart={handleStartSprint}
                onComplete={handleCompleteSprint}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {sprints.length === 0 && (
        <div className="empty-state">
          <Target size={64} />
          <h3>No Sprints Yet</h3>
          <p>Create your first sprint to start agile planning</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Create Sprint
          </button>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <CreateSprintModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSprints();
          }}
        />
      )}
    </div>
  );
};

// Sprint Card Component
const SprintCard = ({ sprint, onStart, onComplete, navigate }) => {
  const status = getSprintStatus(sprint);
  const progress = calculateSprintProgress(sprint);
  const daysRemaining = getDaysRemaining(sprint.endDate);
  const duration = getSprintDuration(sprint.startDate, sprint.endDate);
  const isActive = sprint.status === 'active';
  const isPlanning = sprint.status === 'planning';
  const isCompleted = sprint.status === 'completed';

  return (
    <div className={`sprint-card ${sprint.status}`}>
      <div className="sprint-card-header">
        <div className="sprint-title">
          <h3>{sprint.name}</h3>
          <span className="sprint-status" style={{ backgroundColor: status.color }}>
            {status.label}
          </span>
        </div>
        {sprint.goal && <p className="sprint-goal">{sprint.goal}</p>}
      </div>

      <div className="sprint-stats">
        <div className="stat">
          <Calendar size={16} />
          <span>
            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="stat">
          <Clock size={16} />
          <span>{duration} days ({isActive ? `${daysRemaining} remaining` : 'Not started'})</span>
        </div>
        <div className="stat">
          <CheckCircle size={16} />
          <span>{sprint.tasks?.length || 0} tasks</span>
        </div>
      </div>

      {/* Progress */}
      <div className="sprint-progress">
        <div className="progress-header">
          <span>Story Points</span>
          <span className="progress-value">
            {sprint.completedStoryPoints || 0} / {sprint.plannedStoryPoints || 0}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-percent">{progress}% Complete</span>
      </div>

      {/* Actions */}
      <div className="sprint-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/pm/sprint/${sprint._id}`)}
        >
          <BarChart3 size={16} />
          View Details
        </button>
        
        {isPlanning && (
          <button
            className="btn-primary"
            onClick={() => onStart(sprint._id)}
            disabled={!sprint.tasks || sprint.tasks.length === 0}
          >
            <Play size={16} />
            Start Sprint
          </button>
        )}
        
        {isActive && (
          <button
            className="btn-success"
            onClick={() => onComplete(sprint._id)}
          >
            <CheckCircle size={16} />
            Complete Sprint
          </button>
        )}
      </div>
    </div>
  );
};

// Create Sprint Modal Component
const CreateSprintModal = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    plannedStoryPoints: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum end date (same as start date or today if start date is not set)
  const getMinEndDate = () => {
    if (formData.startDate) {
      return formData.startDate;
    }
    return getTodayDate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await createSprint({
        ...formData,
        projectId
      });
      
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'Sprint created successfully!',
          duration: 3000
        }
      }));
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sprint-modal">
        <div className="modal-header">
          <h2><Plus size={24} /> Create New Sprint</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Sprint Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 1, February Sprint"
              required
            />
          </div>

          <div className="form-group">
            <label>Sprint Goal</label>
            <textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What do you want to achieve in this sprint?"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={getTodayDate()}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={getMinEndDate()}
                disabled={!formData.startDate}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Planned Story Points</label>
            <input
              type="number"
              value={formData.plannedStoryPoints}
              onChange={(e) => setFormData({ ...formData, plannedStoryPoints: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PMSprints;


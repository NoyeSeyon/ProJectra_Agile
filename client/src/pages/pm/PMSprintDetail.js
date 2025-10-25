import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Edit,
  Plus,
  MessageSquare
} from 'lucide-react';
import {
  getSprint,
  startSprint,
  completeSprint,
  getSprintBurndown,
  addTasksToSprint,
  getDaysRemaining,
  getSprintDuration,
  calculateSprintProgress,
  getSprintStatus
} from '../../services/sprintService';
import axios from 'axios';
import BurndownChart from '../../components/sprint/BurndownChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PMSprintDetail.css';

const PMSprintDetail = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [burndownData, setBurndownData] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showRetrospectiveModal, setShowRetrospectiveModal] = useState(false);

  useEffect(() => {
    if (sprintId) {
      loadSprintData();
    }
  }, [sprintId]);

  const loadSprintData = async () => {
    try {
      setLoading(true);
      const [sprintResponse, burndownResponse] = await Promise.all([
        getSprint(sprintId),
        getSprintBurndown(sprintId)
      ]);

      setSprint(sprintResponse.data.sprint);
      setBurndownData(burndownResponse.data.burndown || []);

      // Load available tasks for the project if sprint is in planning
      if (sprintResponse.data.sprint.status === 'planning') {
        try {
          const projectId = sprintResponse.data.sprint.project._id || sprintResponse.data.sprint.project;
          console.log('🔍 Loading tasks for project:', projectId);
          
          // Fetch all tasks for this project
          const tasksResponse = await axios.get(`/api/pm/projects/${projectId}/tasks`);
          console.log('✅ Tasks response:', tasksResponse.data);
          
          const allTasks = tasksResponse.data.tasks || [];
          
          // Filter out tasks that are already in this sprint
          const sprintTaskIds = (sprintResponse.data.sprint.tasks || []).map(t => 
            typeof t === 'string' ? t : t._id
          );
          
          const available = allTasks.filter(task => !sprintTaskIds.includes(task._id));
          console.log(`📋 Available tasks: ${available.length} (Total: ${allTasks.length}, In sprint: ${sprintTaskIds.length})`);
          
          setAvailableTasks(available);
        } catch (taskErr) {
          console.error('❌ Error loading tasks:', taskErr);
          setAvailableTasks([]);
        }
      }
    } catch (err) {
      console.error('Load sprint error:', err);
      setError(err.response?.data?.message || 'Failed to load sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async () => {
    try {
      await startSprint(sprintId);
      loadSprintData();

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

  const handleCompleteSprint = () => {
    setShowRetrospectiveModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading sprint..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} />
        <h3>Failed to Load Sprint</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!sprint) return null;

  const status = getSprintStatus(sprint);
  const progress = calculateSprintProgress(sprint);
  const daysRemaining = getDaysRemaining(sprint.endDate);
  const duration = getSprintDuration(sprint.startDate, sprint.endDate);

  return (
    <div className="pm-sprint-detail">
      {/* Header */}
      <div className="sprint-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="sprint-title-row">
              <h1>{sprint.name}</h1>
              <span className="sprint-status" style={{ backgroundColor: status.color }}>
                {status.label}
              </span>
            </div>
            {sprint.goal && <p className="sprint-goal">{sprint.goal}</p>}
          </div>
        </div>

        <div className="header-actions">
          {sprint.status === 'planning' && (
            <>
              <button
                className="btn-secondary"
                onClick={() => setShowAddTaskModal(true)}
              >
                <Plus size={18} />
                Add Tasks
              </button>
              <button
                className="btn-primary"
                onClick={handleStartSprint}
                disabled={!sprint.tasks || sprint.tasks.length === 0}
              >
                <Play size={18} />
                Start Sprint
              </button>
            </>
          )}

          {sprint.status === 'active' && (
            <button
              className="btn-success"
              onClick={handleCompleteSprint}
            >
              <CheckCircle size={18} />
              Complete Sprint
            </button>
          )}

          {sprint.status === 'completed' && (
            <button
              className="btn-secondary"
              onClick={() => setShowRetrospectiveModal(true)}
            >
              <MessageSquare size={18} />
              View Retrospective
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="sprint-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Calendar />
          </div>
          <div className="stat-info">
            <p className="stat-label">Sprint Duration</p>
            <p className="stat-value">{duration} days</p>
            {sprint.status === 'active' && (
              <p className="stat-subtitle">{daysRemaining} days remaining</p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Target />
          </div>
          <div className="stat-info">
            <p className="stat-label">Story Points</p>
            <p className="stat-value">
              {sprint.completedStoryPoints || 0} / {sprint.plannedStoryPoints || 0}
            </p>
            <p className="stat-subtitle">{progress}% complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <CheckCircle />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tasks</p>
            <p className="stat-value">{sprint.tasks?.length || 0}</p>
            <p className="stat-subtitle">In this sprint</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
            <TrendingUp />
          </div>
          <div className="stat-info">
            <p className="stat-label">Velocity</p>
            <p className="stat-value">{sprint.velocity || 0}</p>
            <p className="stat-subtitle">Points per day</p>
          </div>
        </div>
      </div>

      {/* Burndown Chart */}
      {sprint.status !== 'planning' && (
        <div className="sprint-section">
          <BurndownChart
            burndownData={burndownData}
            plannedStoryPoints={sprint.plannedStoryPoints}
          />
        </div>
      )}

      {/* Sprint Tasks */}
      <div className="sprint-section">
        <div className="section-header">
          <h2>Sprint Backlog ({sprint.tasks?.length || 0} tasks)</h2>
        </div>

        {sprint.tasks && sprint.tasks.length > 0 ? (
          <div className="tasks-list">
            {sprint.tasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle size={48} />
            <p>No tasks in this sprint yet</p>
            {sprint.status === 'planning' && (
              <button
                className="btn-primary"
                onClick={() => setShowAddTaskModal(true)}
              >
                <Plus size={18} />
                Add Tasks
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Tasks Modal */}
      {showAddTaskModal && (
        <AddTasksModal
          sprint={sprint}
          availableTasks={availableTasks}
          onClose={() => setShowAddTaskModal(false)}
          onSuccess={() => {
            setShowAddTaskModal(false);
            loadSprintData();
          }}
        />
      )}

      {/* Retrospective Modal */}
      {showRetrospectiveModal && (
        <RetrospectiveModal
          sprint={sprint}
          onClose={() => setShowRetrospectiveModal(false)}
          onSuccess={() => {
            setShowRetrospectiveModal(false);
            loadSprintData();
          }}
        />
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#7c3aed'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: '#6b7280',
      in_progress: '#3b82f6',
      review: '#8b5cf6',
      completed: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h4>{task.title}</h4>
        <div className="task-badges">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-footer">
        <span className="story-points">
          <Target size={14} />
          {task.storyPoints || 0} points
        </span>
        {task.assignee && (
          <span className="assignee">
            <Users size={14} />
            {task.assignee.firstName} {task.assignee.lastName}
          </span>
        )}
      </div>
    </div>
  );
};

// Add Tasks Modal (Placeholder)
const AddTasksModal = ({ sprint, availableTasks, onClose, onSuccess }) => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTasks.length === 0) return;

    setLoading(true);
    try {
      await addTasksToSprint(sprint._id, selectedTasks);
      
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: `${selectedTasks.length} task(s) added to sprint`,
          duration: 3000
        }
      }));
      
      onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          message: err.response?.data?.message || 'Failed to add tasks',
          duration: 5000
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content add-tasks-modal">
        <div className="modal-header">
          <h2><Plus size={24} /> Add Tasks to Sprint</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tasks-selection">
            {availableTasks.length > 0 ? (
              availableTasks.map(task => (
                <label key={task._id} className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task._id)}
                    onChange={() => toggleTask(task._id)}
                  />
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <span className="task-meta">
                      {task.storyPoints || 0} points • {task.priority}
                    </span>
                  </div>
                </label>
              ))
            ) : (
              <div className="empty-state-small">
                <p>No available tasks to add</p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || selectedTasks.length === 0}
            >
              {loading ? 'Adding...' : `Add ${selectedTasks.length} Task(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Retrospective Modal (Placeholder)
const RetrospectiveModal = ({ sprint, onClose, onSuccess }) => {
  const [retrospectiveData, setRetrospectiveData] = useState({
    whatWentWell: sprint.retrospective?.whatWentWell || [],
    whatCouldImprove: sprint.retrospective?.whatCouldImprove || [],
    actionItems: sprint.retrospective?.actionItems || []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeSprint(sprint._id, retrospectiveData);
      
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'Sprint completed with retrospective!',
          duration: 3000
        }
      }));
      
      onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          message: err.response?.data?.message || 'Failed to save retrospective',
          duration: 5000
        }
      }));
    }
  };

  const isReadOnly = sprint.status === 'completed';

  return (
    <div className="modal-overlay">
      <div className="modal-content retrospective-modal">
        <div className="modal-header">
          <h2><MessageSquare size={24} /> Sprint Retrospective</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="retrospective-section">
            <h3>✅ What Went Well</h3>
            {retrospectiveData.whatWentWell.map((item, index) => (
              <p key={index} className="retro-item">• {item}</p>
            ))}
            {!isReadOnly && retrospectiveData.whatWentWell.length === 0 && (
              <p className="empty-text">Add positive highlights from this sprint</p>
            )}
          </div>

          <div className="retrospective-section">
            <h3>🔧 What Could Improve</h3>
            {retrospectiveData.whatCouldImprove.map((item, index) => (
              <p key={index} className="retro-item">• {item}</p>
            ))}
            {!isReadOnly && retrospectiveData.whatCouldImprove.length === 0 && (
              <p className="empty-text">Add areas for improvement</p>
            )}
          </div>

          <div className="retrospective-section">
            <h3>🎯 Action Items</h3>
            {retrospectiveData.actionItems.map((item, index) => (
              <div key={index} className="action-item">
                <input type="checkbox" checked={item.completed} disabled />
                <span>{item.description}</span>
              </div>
            ))}
            {!isReadOnly && retrospectiveData.actionItems.length === 0 && (
              <p className="empty-text">Add action items for next sprint</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn-primary">
                Complete Sprint
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PMSprintDetail;


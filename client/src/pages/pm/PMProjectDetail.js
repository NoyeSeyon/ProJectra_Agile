import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Target,
  Plus,
  Settings
} from 'lucide-react';
import axios from 'axios';
import BudgetTracker from '../../components/project/BudgetTracker';
import ExpenseModal from '../../components/budget/ExpenseModal';
import TeamManagement from '../../components/pm/TeamManagement';
import TaskManagementModal from '../../components/pm/TaskManagementModal';
import PMTaskList from '../../components/pm/PMTaskList';
import ProjectEditModal from '../../components/pm/ProjectEditModal';
import './PMProjectDetail.css';

const PMProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/api/pm/projects/${projectId}`),
        axios.get(`/api/pm/projects/${projectId}/tasks`)
      ]);

      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchProjectDetails(); // Refresh project data
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/pm/projects/${projectId}`);
      
      // Show success message and navigate back
      alert('Project deleted successfully!');
      navigate('/pm/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`/api/pm/tasks/${taskId}`);
      // Refresh tasks
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setTaskToEdit(null);
  };

  const handleTaskSuccess = () => {
    // Refresh project details and tasks
    fetchProjectDetails();
  };

  const handleToggleSubtaskPermission = async () => {
    if (!project) return;

    const newValue = !project.settings?.allowTeamLeaderSubtasks;
    const confirmMessage = newValue
      ? 'Enable Team Leaders to create subtasks in this project?'
      : 'Disable Team Leader subtask creation? This will prevent Team Leaders from breaking down tasks.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setUpdatingSettings(true);
      await axios.put(`/api/pm/projects/${projectId}/settings`, {
        allowTeamLeaderSubtasks: newValue
      });

      // Update local state
      setProject(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          allowTeamLeaderSubtasks: newValue
        }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      light: '#10b981',
      medium: '#f59e0b',
      heavy: '#ef4444'
    };
    return colors[complexity] || colors.medium;
  };

  const getBudgetStatus = () => {
    if (!project?.budget) return null;

    const { planned, spent, alertThreshold } = project.budget;
    const percentage = planned > 0 ? (spent / planned) * 100 : 0;
    const remaining = planned - spent;

    let status = 'good';
    let color = '#10b981';

    if (percentage >= 95) {
      status = 'critical';
      color = '#ef4444';
    } else if (percentage >= alertThreshold) {
      status = 'warning';
      color = '#f59e0b';
    } else if (percentage >= 70) {
      status = 'caution';
      color = '#fbbf24';
    }

    return { percentage, remaining, status, color };
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'to-do').length;
    const mainTasks = tasks.filter(t => !t.isSubtask).length;
    const subtasks = tasks.filter(t => t.isSubtask).length;

    return { total, completed, inProgress, todo, mainTasks, subtasks };
  };

  const getTotalTimeTracked = () => {
    return tasks.reduce((sum, task) => {
      return sum + (task.timeTracking?.loggedHours || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="pm-loading">
        <div className="pm-spinner"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <h2>{error || 'Project not found'}</h2>
        <button onClick={() => navigate('/pm/projects')} className="btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  const budgetStatus = getBudgetStatus();
  const taskStats = getTaskStats();
  const totalTimeTracked = getTotalTimeTracked();

  return (
    <div className="pm-project-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/pm/projects')}>
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="header-actions">
          <button className="btn-primary-sprint" onClick={() => navigate(`/pm/sprints/${projectId}`)} title="Manage Sprints">
            <Target size={20} />
            Sprints
          </button>
          <button className="btn-icon" onClick={handleEdit} title="Edit Project">
            <Edit size={20} />
          </button>
          <button className="btn-icon danger" onClick={handleDeleteClick} title="Delete Project">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <AlertTriangle size={48} color="#ef4444" />
              <h2>Delete Project?</h2>
            </div>
            <div className="delete-modal-body">
              <p>
                Are you sure you want to delete <strong>{project?.name}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone. All project data, tasks, and time logs will be permanently deleted.
              </p>
            </div>
            <div className="delete-modal-footer">
              <button 
                className="btn-secondary" 
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Overview */}
      <div className="project-overview">
        <div className="overview-header">
          <div>
            <h1>{project.name}</h1>
            <p className="project-description">{project.description}</p>
          </div>

          <div className="project-badges">
            <span className={`status-badge ${project.status}`}>
              {project.status}
            </span>
            <span className={`priority-badge ${project.priority}`}>
              {project.priority}
            </span>
            <span
              className="complexity-badge"
              style={{ backgroundColor: getComplexityColor(project.complexity) }}
            >
              Weight: {project.weight} ({project.complexity})
            </span>
          </div>
        </div>

        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Timeline</p>
              <p className="stat-value">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : 'Not set'}{' '}
                -{' '}
                {project.endDate
                  ? new Date(project.endDate).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Progress</p>
              <p className="stat-value">
                {taskStats.completed} / {taskStats.total} Tasks
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Time Tracked</p>
              <p className="stat-value">{totalTimeTracked.toFixed(1)} hours</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Team Size</p>
              <p className="stat-value">
                {project.members?.length || 0} Members
                {project.teamLeader && ' + 1 Leader'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        {/* Budget Tracker */}
        <div className="content-section budget-section">
          <BudgetTracker 
            projectId={projectId} 
            onAddExpense={() => setShowExpenseModal(true)}
          />
        </div>

        {/* Old budget code removed - replaced with BudgetTracker component */}
        {false && project.budget && budgetStatus && (
          <div className="content-section-old">
            <div className="budget-container">
              <div className="budget-chart">
                <svg viewBox="0 0 200 200" className="budget-circle">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={budgetStatus.color}
                    strokeWidth="20"
                    strokeDasharray={`${budgetStatus.percentage * 5.03} 502`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="budget-percentage">
                  <span className="percentage-value">{budgetStatus.percentage.toFixed(1)}%</span>
                  <span className="percentage-label">Spent</span>
                </div>
              </div>

              <div className="budget-details-old">
                <div className="budget-item">
                  <span className="budget-label">Planned Budget</span>
                  <span className="budget-value">
                    {project.budget.currency} {project.budget.planned.toLocaleString()}
                  </span>
                </div>
                <div className="budget-item">
                  <span className="budget-label">Spent</span>
                  <span className="budget-value">
                    {project.budget.currency} {project.budget.spent.toLocaleString()}
                  </span>
                </div>
                <div className="budget-item">
                  <span className="budget-label">Remaining</span>
                  <span className="budget-value" style={{ color: budgetStatus.color }}>
                    {project.budget.currency} {budgetStatus.remaining.toLocaleString()}
                  </span>
                </div>

                {budgetStatus.status === 'warning' && (
                  <div className="budget-alert warning">
                    <AlertTriangle size={16} />
                    <span>Budget alert threshold reached ({project.budget.alertThreshold}%)</span>
                  </div>
                )}

                {budgetStatus.status === 'critical' && (
                  <div className="budget-alert critical">
                    <AlertTriangle size={16} />
                    <span>Budget critically low! Over 95% spent.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Management Section */}
        <TeamManagement 
          projectId={projectId}
          project={project}
          onUpdate={fetchProjectDetails}
        />

        {/* Project Settings */}
        <div className="content-section settings-section">
          <h2>
            <Settings size={20} />
            Project Settings
          </h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Team Leader Subtask Creation</h3>
              <p>Allow Team Leaders to break down tasks into subtasks</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={project.settings?.allowTeamLeaderSubtasks !== false}
                onChange={handleToggleSubtaskPermission}
                disabled={updatingSettings}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Task Management */}
        <div className="content-section tasks-section">
          <div className="section-header">
            <h2>
              <BarChart3 size={20} />
              Tasks
            </h2>
            <button className="btn-create-task" onClick={handleCreateTask}>
              <Plus size={20} />
              Create Task
            </button>
          </div>

          <PMTaskList
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {/* Project Edit Modal */}
      {showEditModal && project && (
        <ProjectEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Task Management Modal */}
      {showTaskModal && (
        <TaskManagementModal
          isOpen={showTaskModal}
          onClose={handleTaskModalClose}
          projectId={projectId}
          taskToEdit={taskToEdit}
          onSuccess={handleTaskSuccess}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          projectId={projectId}
          projectBudget={project?.budget}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => {
            setShowExpenseModal(false);
            fetchProjectDetails(); // Reload to show updated budget
          }}
        />
      )}
    </div>
  );
};

export default PMProjectDetail;


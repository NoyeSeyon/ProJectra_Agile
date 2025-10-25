import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Target
} from 'lucide-react';
import {
  getProjectProgress,
  formatProjectStatus,
  getDaysRemaining,
  formatBudget,
  getBudgetAlertLevel
} from '../../services/clientService';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ClientProjectProgress.css';

const ClientProjectProgress = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProjectProgress();
    }
  }, [projectId]);

  const loadProjectProgress = async () => {
    try {
      setLoading(true);
      const response = await getProjectProgress(projectId);
      setData(response.data);
    } catch (err) {
      console.error('Load project progress error:', err);
      setError(err.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading project details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <h3>Failed to Load Project</h3>
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => navigate('/client/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const { project, taskStats, milestones, budgetStatus, timelineProgress, recentActivity } = data || {};
  const status = formatProjectStatus(project?.status);
  const daysLeft = getDaysRemaining(project?.endDate);
  const budgetAlert = getBudgetAlertLevel(budgetStatus?.percentageUsed || 0);

  return (
    <div className="client-project-progress">
      {/* Header */}
      <div className="progress-header">
        <button className="back-btn" onClick={() => navigate('/client/projects')}>
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="project-title-section">
          <div className="title-row">
            <h1>{project?.name}</h1>
            <span className="project-status-badge" style={{ backgroundColor: status.color }}>
              {status.label}
            </span>
          </div>
          {project?.description && <p className="project-description">{project.description}</p>}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <TrendingUp />
          </div>
          <div className="stat-details">
            <p className="stat-label">Overall Progress</p>
            <p className="stat-value">{project?.progress || 0}%</p>
            <div className="mini-progress">
              <div className="mini-progress-fill" style={{ width: `${project?.progress || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle />
          </div>
          <div className="stat-details">
            <p className="stat-label">Tasks Completed</p>
            <p className="stat-value">{taskStats?.completed || 0}/{taskStats?.total || 0}</p>
            <p className="stat-subtitle">{taskStats?.completionRate || 0}% complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Calendar />
          </div>
          <div className="stat-details">
            <p className="stat-label">Time Remaining</p>
            <p className="stat-value">{daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : 'Overdue') : 'N/A'}</p>
            <p className="stat-subtitle">Until {new Date(project?.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: budgetAlert.color }}>
            <DollarSign />
          </div>
          <div className="stat-details">
            <p className="stat-label">Budget Status</p>
            <p className="stat-value">{budgetStatus?.percentageUsed || 0}%</p>
            <p className="stat-subtitle">
              {formatBudget(budgetStatus?.spent || 0, budgetStatus?.currency)} spent
            </p>
          </div>
        </div>
      </div>

      <div className="progress-content">
        {/* Timeline & Budget */}
        <div className="main-content">
          {/* Timeline Progress */}
          <div className="section-card">
            <h2><Calendar size={20} /> Project Timeline</h2>
            <div className="timeline-viz">
              <div className="timeline-bar">
                <div className="timeline-progress" style={{ width: `${timelineProgress || 0}%` }} />
              </div>
              <div className="timeline-labels">
                <span>Start: {new Date(project?.startDate).toLocaleDateString()}</span>
                <span className="timeline-current">{timelineProgress || 0}% elapsed</span>
                <span>End: {new Date(project?.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {milestones && milestones.total > 0 && (
            <div className="section-card">
              <h2>
                <Target size={20} /> 
                Milestones ({milestones.completed}/{milestones.total})
              </h2>
              <div className="milestones-list">
                {milestones.list.map((milestone, index) => (
                  <div key={index} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                    <div className="milestone-icon">
                      {milestone.completed ? <CheckCircle size={20} /> : <div className="milestone-dot" />}
                    </div>
                    <div className="milestone-details">
                      <p className="milestone-title">{milestone.title}</p>
                      {milestone.description && (
                        <p className="milestone-description">{milestone.description}</p>
                      )}
                      <p className="milestone-date">
                        {milestone.completed 
                          ? `Completed ${new Date(milestone.completedAt).toLocaleDateString()}`
                          : `Due ${new Date(milestone.dueDate).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Details */}
          <div className="section-card">
            <h2><DollarSign size={20} /> Budget Breakdown</h2>
            <div className="budget-details">
              <div className="budget-chart">
                <svg viewBox="0 0 200 200" className="budget-circle">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={budgetAlert.color}
                    strokeWidth="20"
                    strokeDasharray={`${(budgetStatus?.percentageUsed || 0) * 5.65} 565`}
                    transform="rotate(-90 100 100)"
                  />
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="32" fontWeight="bold" fill="#1e293b">
                    {budgetStatus?.percentageUsed || 0}%
                  </text>
                </svg>
              </div>
              <div className="budget-info">
                <div className="budget-row">
                  <span className="budget-label">Planned Budget:</span>
                  <span className="budget-value">{formatBudget(budgetStatus?.planned || 0, budgetStatus?.currency)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Spent:</span>
                  <span className="budget-value spent">{formatBudget(budgetStatus?.spent || 0, budgetStatus?.currency)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Remaining:</span>
                  <span className="budget-value remaining">{formatBudget(budgetStatus?.remaining || 0, budgetStatus?.currency)}</span>
                </div>
                {budgetStatus?.percentageUsed >= 80 && (
                  <div className="budget-alert">
                    <AlertTriangle size={16} />
                    <span>Budget is at {budgetStatus.percentageUsed}% - nearing limit</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-content">
          {/* PM Contact */}
          {project?.manager && (
            <div className="section-card pm-card">
              <h3><Users size={18} /> Project Manager</h3>
              <div className="pm-info">
                <div className="pm-avatar">
                  {project.manager.firstName?.charAt(0)}{project.manager.lastName?.charAt(0)}
                </div>
                <div className="pm-details">
                  <p className="pm-name">{project.manager.firstName} {project.manager.lastName}</p>
                  <p className="pm-contact">
                    <Mail size={14} />
                    {project.manager.email}
                  </p>
                  {project.manager.phone && (
                    <p className="pm-contact">
                      <Phone size={14} />
                      {project.manager.phone}
                    </p>
                  )}
                </div>
              </div>
              <button className="btn-contact">
                <MessageSquare size={16} />
                Send Message
              </button>
            </div>
          )}

          {/* Task Summary */}
          <div className="section-card">
            <h3><CheckCircle size={18} /> Task Summary</h3>
            <div className="task-summary">
              <div className="task-row">
                <span className="task-status-dot todo"></span>
                <span className="task-label">To Do</span>
                <span className="task-count">{taskStats?.todo || 0}</span>
              </div>
              <div className="task-row">
                <span className="task-status-dot in-progress"></span>
                <span className="task-label">In Progress</span>
                <span className="task-count">{taskStats?.inProgress || 0}</span>
              </div>
              <div className="task-row">
                <span className="task-status-dot review"></span>
                <span className="task-label">Review</span>
                <span className="task-count">{taskStats?.review || 0}</span>
              </div>
              <div className="task-row">
                <span className="task-status-dot completed"></span>
                <span className="task-label">Completed</span>
                <span className="task-count">{taskStats?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectProgress;


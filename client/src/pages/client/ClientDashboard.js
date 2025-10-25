import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  getClientDashboard,
  formatProjectStatus,
  getDaysRemaining,
  formatBudget
} from '../../services/clientService';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getClientDashboard();
      setDashboard(response.data);
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} />
        <h3>Failed to Load Dashboard</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const { client, stats, projects, recentActivity, notifications } = dashboard || {};

  return (
    <div className="client-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome back, {client?.name?.split(' ')[0]}!</h1>
          <p>Here's an overview of your projects with {client?.company}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Projects</p>
            <p className="stat-value">{stats?.totalProjects || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Active Projects</p>
            <p className="stat-value">{stats?.activeProjects || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{stats?.completedProjects || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">On Hold</p>
            <p className="stat-value">{stats?.onHoldProjects || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Projects Section */}
        <div className="projects-section">
          <div className="section-header">
            <h2>
              <Briefcase size={20} />
              Your Projects
            </h2>
            <Link to="/client/projects" className="view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {projects && projects.length > 0 ? (
            <div className="projects-grid">
              {projects.slice(0, 6).map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>No projects assigned yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h2>
              <Activity size={20} />
              Recent Activity
            </h2>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.slice(0, 8).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project }) => {
  const status = formatProjectStatus(project.status);
  const daysLeft = getDaysRemaining(project.endDate);

  return (
    <Link to={`/client/project/${project._id}`} className="project-card">
      <div className="project-header">
        <h3>{project.name}</h3>
        <span className="project-status" style={{ backgroundColor: status.color }}>
          {status.label}
        </span>
      </div>

      {project.description && (
        <p className="project-description">{project.description.substring(0, 100)}...</p>
      )}

      <div className="project-progress">
        <div className="progress-header">
          <span>Progress</span>
          <span className="progress-value">{project.progress || 0}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="project-meta">
        {project.manager && (
          <div className="meta-item">
            <span className="meta-label">Manager:</span>
            <span className="meta-value">
              {project.manager.firstName} {project.manager.lastName}
            </span>
          </div>
        )}
        {daysLeft !== null && (
          <div className="meta-item">
            <Calendar size={14} />
            <span>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'task_update':
        return <CheckCircle size={16} />;
      case 'milestone':
        return <TrendingUp size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-item">
      <div className="activity-icon">{getActivityIcon()}</div>
      <div className="activity-content">
        <p className="activity-title">
          <strong>{activity.project?.name}</strong> • {activity.task?.title}
        </p>
        <p className="activity-meta">
          {activity.task?.status && (
            <span className="activity-status">{activity.task.status.replace('_', ' ')}</span>
          )}
          {activity.assignee && (
            <span className="activity-assignee">
              {activity.assignee.firstName} {activity.assignee.lastName}
            </span>
          )}
          <span className="activity-time">{formatTime(activity.timestamp)}</span>
        </p>
      </div>
    </div>
  );
};

export default ClientDashboard;


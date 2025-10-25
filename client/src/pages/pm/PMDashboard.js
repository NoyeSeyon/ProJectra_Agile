import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, CheckCircle, AlertCircle, TrendingUp,
  Calendar, DollarSign, Activity, Clock, Target, ArrowRight,
  Play, Pause, CheckSquare
} from 'lucide-react';
import { getPMDashboard } from '../../services/pmService';
import './PMDashboard.css';

const PMDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPMDashboard();
      setDashboard(response.data);
    } catch (err) {
      console.error('Failed to load PM dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pm-dashboard-loading">
        <div className="pm-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-error">
        <AlertCircle size={48} />
        <h3>Failed to Load Dashboard</h3>
        <p>{error}</p>
        <button onClick={loadDashboard} className="retry-btn">Try Again</button>
      </div>
    );
  }

  const { stats, recentProjects, criticalTasks, budget, pm } = dashboard || {};

  return (
    <div className="pm-dashboard">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div>
          <h2>Welcome back, {pm?.name?.split(' ')[0]}!</h2>
          <p>Here's what's happening with your projects today</p>
        </div>
        <Link to="/pm/projects?action=create" className="create-project-btn">
          <Briefcase size={20} />
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Briefcase size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalProjects || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <Activity size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats?.activeProjects || 0}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats?.completedProjects || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats?.teamSize || 0}</h3>
            <p>Team Members</p>
          </div>
        </div>

        <div className="stat-card cyan">
          <div className="stat-icon">
            <Target size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats?.capacityUsage || 0}%</h3>
            <p>Capacity Used</p>
          </div>
          <div className="capacity-bar-mini">
            <div 
              className="capacity-fill-mini" 
              style={{ width: `${Math.min(stats?.capacityUsage || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="stat-card indigo">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-info">
            <h3>${budget?.total?.toLocaleString() || 0}</h3>
            <p>Total Budget</p>
          </div>
          <div className="budget-progress">
            <span className="budget-spent">
              ${budget?.spent?.toLocaleString() || 0} spent
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Projects */}
        <div className="dashboard-section projects-section">
          <div className="section-header">
            <h3>
              <Briefcase size={20} />
              Recent Projects
            </h3>
            <Link to="/pm/projects" className="view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="projects-grid">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link 
                  to={`/projects/${project._id}`} 
                  key={project._id} 
                  className="project-card"
                >
                  <div className="project-header">
                    <h4>{project.name}</h4>
                    <span className={`status-badge ${project.status}`}>
                      {project.status === 'in-progress' && <Play size={12} />}
                      {project.status === 'planning' && <Pause size={12} />}
                      {project.status === 'completed' && <CheckSquare size={12} />}
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="project-desc">
                    {project.description?.substring(0, 80)}
                    {project.description?.length > 80 ? '...' : ''}
                  </p>

                  <div className="project-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>
                        {project.timeline?.start ? 
                          new Date(project.timeline.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                          : 'No start date'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <Users size={14} />
                      <span>{project.members?.length || 0} members</span>
                    </div>
                  </div>

                  {project.progress !== undefined && (
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">{project.progress || 0}% Complete</span>
                    </div>
                  )}

                  {project.client && (
                    <div className="project-client">
                      <div className="client-avatar">
                        {project.client.firstName?.[0]}{project.client.lastName?.[0]}
                      </div>
                      <span>{project.client.firstName} {project.client.lastName}</span>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <Briefcase size={48} />
                <p>No projects yet</p>
                <Link to="/pm/projects?action=create" className="create-first-btn">
                  Create Your First Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Critical Tasks */}
        <div className="dashboard-section tasks-section">
          <div className="section-header">
            <h3>
              <AlertCircle size={20} />
              Tasks Requiring Attention
            </h3>
            <Link to="/pm/projects" className="view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tasks-list">
            {criticalTasks && criticalTasks.length > 0 ? (
              criticalTasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <div className="task-title-row">
                      <h4>{task.title}</h4>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="task-project">{task.project?.name || 'Unknown Project'}</p>
                  </div>

                  <div className="task-meta">
                    {task.dueDate && (
                      <div className="task-due">
                        <Clock size={14} />
                        <span className={
                          new Date(task.dueDate) < new Date() ? 'overdue' :
                          new Date(task.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'urgent' : ''
                        }>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                    {task.assignee && (
                      <div className="task-assignee">
                        <div className="assignee-avatar">
                          {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                        </div>
                        <span>{task.assignee.firstName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <CheckCircle size={48} />
                <p>All caught up!</p>
                <span className="empty-desc">No critical tasks at the moment</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      {budget && budget.total > 0 && (
        <div className="budget-overview">
          <div className="section-header">
            <h3>
              <DollarSign size={20} />
              Budget Overview
            </h3>
            <div className="budget-stats">
              <span className="budget-percentage">
                {budget.percentageUsed}% Used
              </span>
            </div>
          </div>

          <div className="budget-bar">
            <div 
              className="budget-fill" 
              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            />
          </div>

          <div className="budget-details">
            <div className="budget-item">
              <span className="budget-label">Total Budget</span>
              <span className="budget-amount">${budget.total.toLocaleString()}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Spent</span>
              <span className="budget-amount spent">${budget.spent.toLocaleString()}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className="budget-amount remaining">${budget.remaining.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMDashboard;


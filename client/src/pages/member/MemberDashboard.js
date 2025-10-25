import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Crown,
  Users,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import './MemberDashboard.css';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { onProjectCreated, onProjectUpdated, onProjectDeleted } = useSocket();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time project updates
  useEffect(() => {
    const unsubscribeCreated = onProjectCreated((data) => {
      console.log('📦 Real-time: Project created/assigned', data);
      
      // Check if user is assigned to this project
      if (data.project && (
        data.project.members?.some(m => m._id === user?.id || m === user?.id) ||
        data.project.teamLeader?._id === user?.id ||
        data.project.teamLeader === user?.id
      )) {
        // Reload dashboard to update project count and list
        loadDashboardData();
        
        // Show toast notification
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'info',
            message: `New project assigned: ${data.project.name}`,
            duration: 5000
          }
        }));
      }
    });

    const unsubscribeUpdated = onProjectUpdated((data) => {
      console.log('📝 Real-time: Project updated', data);
      
      // Check if user is assigned to this project
      if (data.project && (
        data.project.members?.some(m => m._id === user?.id || m === user?.id) ||
        data.project.teamLeader?._id === user?.id ||
        data.project.teamLeader === user?.id
      )) {
        // Reload dashboard to update project data
        loadDashboardData();
      }
    });

    const unsubscribeDeleted = onProjectDeleted((data) => {
      console.log('🗑️ Real-time: Project deleted', data);
      
      // Reload dashboard to update project count and list
      loadDashboardData();
      
      // Show toast notification
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'warning',
          message: `Project removed: ${data.projectName || 'Unnamed'}`,
          duration: 5000
        }
      }));
    });

    return () => {
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeUpdated) unsubscribeUpdated();
      if (unsubscribeDeleted) unsubscribeDeleted();
    };
  }, [onProjectCreated, onProjectUpdated, onProjectDeleted, user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard data from Team Leader API (works for all members)
      const response = await axios.get('/api/team-leader/dashboard');
      
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard');
      // Set mock data for display
      setDashboardData({
        stats: {
          projectsAsTeamLeader: 0,
          mainTasks: 0,
          subtasksCreated: 0,
          teamSize: 0,
          tasksNeedingBreakdown: 0
        },
        projects: [],
        tasksNeedingBreakdown: [],
        recentSubtasks: []
      });
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

  const stats = dashboardData?.stats || {};
  const projects = dashboardData?.projects || [];
  const tasksNeedingBreakdown = dashboardData?.tasksNeedingBreakdown || [];

  // Check if user is Team Leader in any project
  const isTeamLeader = stats.projectsAsTeamLeader > 0;

  // Use totalProjects from backend stats (includes both TL and member projects)
  const currentProjects = stats.totalProjects || 0;
  const maxProjects = user?.capacity?.maxProjects || 5;
  const capacityPercentage = (currentProjects / maxProjects) * 100;
  
  // Debug logging
  console.log('📊 Dashboard Stats:', {
    totalProjects: stats.totalProjects,
    projectsAsTeamLeader: stats.projectsAsTeamLeader,
    isTeamLeader,
    userId: user?.id || user?._id,
    projects: projects.map(p => ({
      name: p.name,
      teamLeader: p.teamLeader?._id || p.teamLeader,
      isUserTL: (p.teamLeader?._id || p.teamLeader)?.toString() === (user?.id || user?._id)?.toString()
    }))
  });

  return (
    <div className="member-dashboard">
      {error && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{error} - Showing limited data</span>
        </div>
      )}

      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h2 className="welcome-title">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="welcome-subtitle">
            {isTeamLeader 
              ? `You're leading ${stats.projectsAsTeamLeader} project${stats.projectsAsTeamLeader > 1 ? 's' : ''}. Here's your overview.`
              : "Here's what's happening with your projects today."}
          </p>
        </div>
        <div className="welcome-capacity">
          <div className="capacity-label">Project Capacity</div>
          <div className="capacity-display">{currentProjects}/{maxProjects}</div>
          <div className="capacity-bar-small">
            <div 
              className="capacity-fill-small"
              style={{ 
                width: `${capacityPercentage}%`,
                backgroundColor: capacityPercentage >= 100 ? '#ef4444' : capacityPercentage >= 80 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon projects">
            <FolderKanban size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{currentProjects}</div>
            <div className="stat-label">Total Projects</div>
            {isTeamLeader && stats.projectsAsTeamLeader > 0 && (
              <div className="stat-badge">
                <Crown size={14} />
                <span>{stats.projectsAsTeamLeader} as Team Leader</span>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tasks">
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalActiveTasks || stats.mainTasks || 0}</div>
            <div className="stat-label">Active Tasks</div>
            <div className="stat-meta">
              <TrendingUp size={14} />
              <span>
                {stats.mainTasks > 0 && stats.assignedSubtasks > 0 
                  ? `${stats.mainTasks} main + ${stats.assignedSubtasks} subtasks`
                  : 'Across all projects'
                }
              </span>
            </div>
          </div>
        </div>

        {isTeamLeader && (
          <div className="stat-card">
            <div className="stat-icon subtasks">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.subtasksCreated || 0}</div>
              <div className="stat-label">Subtasks Created</div>
              <div className="stat-meta">
                <span>As Team Leader</span>
              </div>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon time">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">--</div>
            <div className="stat-label">Hours Logged</div>
            <div className="stat-meta">
              <span>This week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Needing Breakdown (Team Leader Only) */}
      {isTeamLeader && tasksNeedingBreakdown.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">
              <AlertCircle size={20} />
              Tasks Needing Breakdown
            </h3>
            <Link to="/member/tasks" className="section-link">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="tasks-list">
            {tasksNeedingBreakdown.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  <div className="task-project">
                    {task.project?.name || 'Unknown Project'}
                  </div>
                </div>
                <div className="task-actions">
                  <Link 
                    to={`/member/tasks?taskId=${task._id}`}
                    className="btn-break-down"
                  >
                    Break into Subtasks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">
            <FolderKanban size={20} />
            My Projects
          </h3>
          <Link to="/member/projects" className="section-link">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
                <div className="project-header">
                  <div className="project-name">{project.name}</div>
                  {project.teamLeader && project.teamLeader._id === user?.id && (
                    <div className="tl-badge-small">
                      <Crown size={14} />
                      Team Leader
                    </div>
                  )}
                </div>
                <div className="project-progress">
                  <div className="progress-label">
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
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                  <div className="meta-item">
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FolderKanban size={48} />
            <p>No projects assigned yet</p>
            <span>You'll see your projects here when assigned by a Project Manager</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/member/tasks" className="action-card">
            <CheckSquare size={24} />
            <span>View My Tasks</span>
          </Link>
          <Link to="/member/time-tracking" className="action-card">
            <Clock size={24} />
            <span>Log Time</span>
          </Link>
          <Link to="/member/team" className="action-card">
            <Users size={24} />
            <span>View Team</span>
          </Link>
          <Link to="/kanban" className="action-card">
            <CalendarDays size={24} />
            <span>Kanban Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;


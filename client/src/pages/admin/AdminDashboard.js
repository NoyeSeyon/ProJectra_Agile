import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  TrendingUp,
  UserPlus,
  UserCog,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { getOrganizationAnalytics } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizationAnalytics();
      setAnalytics(data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Set default empty data instead of showing error
      setAnalytics({
        users: { total: 0, projectManagers: 0, members: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        recentUsers: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Users',
      value: analytics?.users?.total || 0,
      color: 'blue',
      link: '/admin/users'
    },
    {
      icon: UserCog,
      label: 'Project Managers',
      value: analytics?.users?.projectManagers || 0,
      color: 'purple',
      link: '/admin/pm-management'
    },
    {
      icon: Users,
      label: 'Team Members',
      value: analytics?.users?.members || 0,
      color: 'green',
      link: '/admin/users'
    },
    {
      icon: Briefcase,
      label: 'Total Projects',
      value: analytics?.projects?.total || 0,
      color: 'orange',
      link: '/projects'
    },
    {
      icon: Activity,
      label: 'Active Projects',
      value: analytics?.projects?.active || 0,
      color: 'cyan',
      link: '/projects'
    },
    {
      icon: CheckCircle,
      label: 'Completed Projects',
      value: analytics?.projects?.completed || 0,
      color: 'success',
      link: '/projects'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your organization, users, and project managers</p>
        </div>
        <div className="quick-actions">
          <Link to="/admin/users" className="action-btn primary">
            <UserPlus size={20} />
            Invite User
          </Link>
          <Link to="/admin/pm-management" className="action-btn secondary">
            <UserCog size={20} />
            Manage PMs
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={32} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="section recent-users">
          <div className="section-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users" className="view-all">
              View All →
            </Link>
          </div>
          <div className="users-list">
            {analytics?.recentUsers?.length > 0 ? (
              analytics.recentUsers.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-avatar">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="user-details">
                    <h4>{user.firstName} {user.lastName}</h4>
                    <p>{user.email}</p>
                  </div>
                  <span className={`role-badge ${user.role}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className="user-date">
                    <Clock size={14} />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <p>No users yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="section quick-stats">
          <div className="section-header">
            <h2>Organization Insights</h2>
            <Link to="/analytics" className="view-all">
              <BarChart3 size={16} />
              Analytics →
            </Link>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-header">
                <TrendingUp size={20} />
                <span>Project Completion Rate</span>
              </div>
              <div className="insight-value">
                {analytics?.projects?.total > 0 
                  ? Math.round((analytics.projects.completed / analytics.projects.total) * 100)
                  : 0}%
              </div>
              <div className="insight-subtitle">
                {analytics?.projects?.completed} of {analytics?.projects?.total} completed
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <Activity size={20} />
                <span>Active Work</span>
              </div>
              <div className="insight-value">
                {analytics?.projects?.active}
              </div>
              <div className="insight-subtitle">
                Projects currently in progress
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <UserCog size={20} />
                <span>PM Coverage</span>
              </div>
              <div className="insight-value">
                {analytics?.users?.projectManagers > 0 && analytics?.projects?.active > 0
                  ? Math.round((analytics.projects.active / analytics.users.projectManagers) * 10) / 10
                  : 0}
              </div>
              <div className="insight-subtitle">
                Projects per PM average
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <Link to="/admin/pm-management" className="action-card">
          <UserCog size={32} />
          <h3>Manage Project Managers</h3>
          <p>Assign, update, and monitor PM roles and capacity</p>
        </Link>
        <Link to="/admin/users" className="action-card">
          <Users size={32} />
          <h3>User Management</h3>
          <p>Invite users, change roles, and manage access</p>
        </Link>
        <Link to="/analytics" className="action-card">
          <BarChart3 size={32} />
          <h3>View Analytics</h3>
          <p>Detailed insights and performance metrics</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;


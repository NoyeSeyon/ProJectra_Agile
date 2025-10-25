import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Users, BarChart3, Settings, LogOut,
  Menu, X, Bell, Gauge, MessageSquare, PlusCircle, Columns
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FloatingChatButtons from '../admin/FloatingChatButtons';
import './PMLayout.css';

const PMLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/pm/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', href: '/pm/projects', icon: Briefcase },
    { name: 'My Team', href: '/pm/team', icon: Users },
    { name: 'All Members', href: '/pm/members', icon: Users },
    { name: 'Kanban Board', href: '/pm/kanban', icon: Columns },
    { name: 'Analytics', href: '/pm/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/pm/settings', icon: Settings },
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get capacity info from user
  const activeProjects = user?.capacity?.currentProjects || 0;
  const maxProjects = user?.capacity?.maxProjects || 10;
  const capacityPercentage = (activeProjects / maxProjects) * 100;

  return (
    <div className="pm-layout">
      {/* Sidebar */}
      <aside className={`pm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Gauge size={32} className="sidebar-logo" />
          <h2>PM Portal</h2>
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Capacity Indicator */}
        <div className="capacity-card">
          <div className="capacity-header">
            <span className="capacity-label">Project Capacity</span>
            <span className="capacity-value">{activeProjects}/{maxProjects}</span>
          </div>
          <div className="capacity-bar">
            <div 
              className="capacity-fill" 
              style={{ 
                width: `${Math.min(capacityPercentage, 100)}%`,
                backgroundColor: capacityPercentage > 90 ? '#ef4444' : 
                                  capacityPercentage > 70 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
          <div className="capacity-status">
            {capacityPercentage >= 100 ? 'At Full Capacity' : 
             capacityPercentage >= 70 ? 'Near Capacity' : 'Available Slots'}
          </div>
        </div>

        {/* Quick Action */}
        <Link to="/pm/projects?action=create" className="quick-action-btn">
          <PlusCircle size={20} />
          <span>New Project</span>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-indicator"></span>
            <span>System Healthy</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-info">
              <h4>{user?.firstName} {user?.lastName}</h4>
              <p>Project Manager</p>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pm-main">
        {/* Top Header */}
        <header className="pm-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="header-info">
            <div className="header-title">
              <h1>{navigation.find(item => isActive(item.href))?.name || 'PM Portal'}</h1>
            </div>
            <div className="header-meta">
              <span className="org-name">{user?.organization?.name || 'Organization'}</span>
              <span className="separator">•</span>
              <span className="pm-name">{user?.firstName} {user?.lastName}</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Message/Chat Icon */}
            <button className="icon-btn" title="Messages">
              <MessageSquare size={20} />
            </button>

            {/* Notifications */}
            <button className="icon-btn" title="Notifications">
              <Bell size={20} />
              <span className="notification-badge">2</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="pm-content">
          {children}
        </main>

        {/* Floating Chat Buttons */}
        <FloatingChatButtons />
      </div>
    </div>
  );
};

export default PMLayout;


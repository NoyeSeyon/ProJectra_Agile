import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Columns
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FloatingChatButtons from './FloatingChatButtons';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'PM Management', href: '/admin/pm-management', icon: UserCog },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Kanban Board', href: '/admin/kanban', icon: Columns },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="admin-layout">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo & Close Button */}
        <div className="sidebar-header">
          <div className="logo-section">
            <Shield className="logo-icon" size={32} />
            <div className="logo-text">
              <h2>Admin Panel</h2>
              <p>Organization Management</p>
            </div>
          </div>
          <button 
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-indicator">
              <div className="status-dot active"></div>
              <span>System Healthy</span>
            </div>
            <p className="status-subtitle">All services operational</p>
          </div>

          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-info">
              <h4>{user?.firstName} {user?.lastName}</h4>
              <p className="user-role">Admin</p>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="header-title">
            <h1>{navigation.find(item => isActive(item.href))?.name || 'Admin'}</h1>
            <p className="organization-name">{user?.organization?.name}</p>
          </div>

          <div className="header-actions">
            {/* Notifications */}
            <button className="icon-btn" title="Notifications">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>

        {/* Floating Chat Buttons - AI & Slack */}
        <FloatingChatButtons />
      </div>
    </div>
  );
};

export default AdminLayout;


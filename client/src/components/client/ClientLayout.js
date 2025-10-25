import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  BarChart3,
  MessageSquare,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './ClientLayout.css';

const ClientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: Home },
    { name: 'My Projects', href: '/client/projects', icon: Briefcase },
    { name: 'Reports', href: '/client/reports', icon: BarChart3 },
    { name: 'Communication', href: '/client/communication', icon: MessageSquare },
    { name: 'Documents', href: '/client/documents', icon: FileText }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="client-layout">
      {/* Sidebar */}
      <div className={`client-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">C</div>
            <h2>Client Portal</h2>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

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

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.firstName} {user?.lastName}</p>
              <p className="user-role">Client</p>
              <p className="user-company">{user?.organization?.name}</p>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="client-main">
        {/* Top Bar */}
        <div className="client-topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="topbar-content">
            <h1 className="page-title">
              {navigation.find(item => isActive(item.href))?.name || 'Client Portal'}
            </h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="client-content">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default ClientLayout;


import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Columns
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FloatingChatButtons from '../admin/FloatingChatButtons';
import './MemberLayout.css';

const MemberLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', href: '/member/projects', icon: FolderKanban },
    { name: 'My Tasks', href: '/member/tasks', icon: CheckSquare },
    { name: 'Kanban Board', href: '/member/kanban', icon: Columns },
    { name: 'Team', href: '/member/team', icon: Users },
    { name: 'Time Tracking', href: '/member/time-tracking', icon: Clock },
    { name: 'Settings', href: '/member/settings', icon: Settings }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate project capacity (max 5)
  const currentProjects = user?.capacity?.currentProjects || 0;
  const maxProjects = user?.capacity?.maxProjects || 5;
  const capacityPercentage = (currentProjects / maxProjects) * 100;

  // Check if user is Team Leader in any project
  const isTeamLeader = user?.capacity?.currentTeamLeaderProjects > 0;

  return (
    <div className="member-layout">
      {/* Sidebar */}
      <aside className={`member-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">P</div>
            {sidebarOpen && <span className="logo-text">Projectra</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="user-info">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">
                {isTeamLeader ? (
                  <span className="role-badge team-leader">Team Leader</span>
                ) : (
                  <span className="role-badge member">Member</span>
                )}
              </div>
              {user?.specialization && user.specialization !== 'general' && (
                <div className="user-specialization">
                  {user.specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Capacity */}
        {sidebarOpen && (
          <div className="sidebar-capacity">
            <div className="capacity-header">
              <span>Projects</span>
              <span className="capacity-count">{currentProjects}/{maxProjects}</span>
            </div>
            <div className="capacity-bar">
              <div 
                className="capacity-fill"
                style={{ 
                  width: `${capacityPercentage}%`,
                  backgroundColor: capacityPercentage >= 100 ? '#ef4444' : capacityPercentage >= 80 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
            {currentProjects >= maxProjects && (
              <div className="capacity-warning">At maximum capacity</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="nav-text">{item.name}</span>
                    {active && <ChevronRight size={16} className="nav-arrow" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="member-main">
        {/* Header */}
        <header className="member-header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
              <div className="header-meta">
                <span className="org-name">{user?.organization?.name || 'Organization'}</span>
                {isTeamLeader && (
                  <>
                    <span className="separator">•</span>
                    <span className="tl-badge">Team Leader in {user?.capacity?.currentTeamLeaderProjects} project</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="member-content">
          {children}
        </main>
      </div>

      {/* Floating Chat Buttons (AI + Slack) */}
      <FloatingChatButtons />
    </div>
  );
};

export default MemberLayout;


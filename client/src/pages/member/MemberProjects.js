import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  Clock, 
  Crown,
  Calendar,
  TrendingUp,
  CheckSquare,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import './MemberProjects.css';

const MemberProjects = () => {
  const { user } = useAuth();
  const { onProjectCreated, onProjectUpdated, onProjectDeleted } = useSocket();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, roleFilter]);

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
        // Reload projects list
        loadProjects();
        
        // Show toast notification
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            message: `New project assigned: ${data.project.name}`,
            duration: 5000
          }
        }));
      }
    });

    const unsubscribeUpdated = onProjectUpdated((data) => {
      console.log('📝 Real-time: Project updated', data);
      
      // Update the project in the list if it exists
      setProjects(prevProjects => {
        const index = prevProjects.findIndex(p => p._id === data.project._id);
        if (index !== -1) {
          const updatedProjects = [...prevProjects];
          updatedProjects[index] = { ...updatedProjects[index], ...data.project };
          return updatedProjects;
        }
        return prevProjects;
      });
    });

    const unsubscribeDeleted = onProjectDeleted((data) => {
      console.log('🗑️ Real-time: Project deleted', data);
      
      // Remove project from list
      setProjects(prevProjects => prevProjects.filter(p => p._id !== data.projectId));
      
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

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/api/team-leader/projects');
      const projectsData = response.data.data.projects || [];
      
      setProjects(projectsData);
    } catch (err) {
      console.error('Load projects error:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Role filter (Team Leader vs Member)
    if (roleFilter === 'team_leader') {
      filtered = filtered.filter(project => 
        project.teamLeader && project.teamLeader._id === user?.id
      );
    } else if (roleFilter === 'member') {
      filtered = filtered.filter(project => 
        !project.teamLeader || project.teamLeader._id !== user?.id
      );
    }

    setFilteredProjects(filtered);
  };

  const getProjectRole = (project) => {
    if (project.teamLeader && project.teamLeader._id === user?.id) {
      return 'Team Leader';
    }
    return 'Member';
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#3b82f6',
      active: '#10b981',
      on_hold: '#f59e0b',
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  // Use actual project count from loaded projects
  const currentProjects = projects.length;
  const maxProjects = user?.capacity?.maxProjects || 5;
  
  // Count Team Leader projects - handle both string and object comparison
  const tlProjects = projects.filter(p => {
    if (!p.teamLeader) return false;
    
    // Handle both ObjectId object and string ID
    const teamLeaderId = p.teamLeader._id || p.teamLeader;
    const userId = user?.id || user?._id;
    
    // Convert both to strings for comparison
    return teamLeaderId?.toString() === userId?.toString();
  }).length;
  
  console.log('📊 Project Stats:', {
    totalProjects: currentProjects,
    tlProjects,
    memberProjects: currentProjects - tlProjects,
    userId: user?.id || user?._id,
    projects: projects.map(p => ({
      name: p.name,
      teamLeader: p.teamLeader?._id || p.teamLeader,
      isUserTL: (p.teamLeader?._id || p.teamLeader)?.toString() === (user?.id || user?._id)?.toString()
    }))
  });

  return (
    <div className="member-projects">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Header Stats */}
      <div className="projects-header">
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <FolderKanban size={24} />
            </div>
            <div>
              <div className="stat-value">{currentProjects}/{maxProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon tl">
              <Crown size={24} />
            </div>
            <div>
              <div className="stat-value">{tlProjects}</div>
              <div className="stat-label">As Team Leader</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon member">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{currentProjects - tlProjects}</div>
              <div className="stat-label">As Member</div>
            </div>
          </div>
        </div>

        {currentProjects >= maxProjects && (
          <div className="capacity-warning">
            <AlertCircle size={18} />
            <span>You are at maximum capacity ({maxProjects} projects)</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="team_leader">Team Leader</option>
            <option value="member">Member Only</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const role = getProjectRole(project);
            const isTeamLeader = role === 'Team Leader';

            return (
              <div key={project._id} className={`project-card ${isTeamLeader ? 'tl-project' : ''}`}>
                {/* Card Header */}
                <div className="card-header">
                  <div className="project-title">
                    <FolderKanban size={20} />
                    <h3>{project.name}</h3>
                  </div>
                  {isTeamLeader && (
                    <div className="tl-badge">
                      <Crown size={14} />
                      Team Leader
                    </div>
                  )}
                </div>

                {/* Project Description */}
                {project.description && (
                  <p className="project-description">
                    {project.description.length > 120
                      ? project.description.substring(0, 120) + '...'
                      : project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-value">{project.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${project.progress || 0}%`,
                        backgroundColor: getStatusColor(project.status)
                      }}
                    />
                  </div>
                </div>

                {/* Project Stats */}
                <div className="project-stats">
                  <div className="stat">
                    <Users size={16} />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                  <div className="stat">
                    <CheckSquare size={16} />
                    <span>{project.taskCount || 0} tasks</span>
                  </div>
                  <div className="stat">
                    <Clock size={16} />
                    <span>{project.weight || 5}/10</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="project-dates">
                  <div className="date-item">
                    <Calendar size={14} />
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="date-item">
                    <Calendar size={14} />
                    <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="card-footer">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: `${getStatusColor(project.status)}20`,
                      color: getStatusColor(project.status)
                    }}
                  >
                    {project.status.replace('_', ' ')}
                  </span>

                  <div className="card-actions">
                    <Link to="/member/tasks" className="btn-view">
                      View Tasks
                    </Link>
                  </div>
                </div>

                {/* Team Leader Features */}
                {isTeamLeader && (
                  <div className="tl-features">
                    <TrendingUp size={14} />
                    <span>You can create subtasks in this project</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FolderKanban size={64} />
          <h3>No projects found</h3>
          <p>
            {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You are not assigned to any projects yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberProjects;


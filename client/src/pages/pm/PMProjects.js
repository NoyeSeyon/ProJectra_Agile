import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Filter, Plus, Grid, List } from 'lucide-react';
import { getPMProjects } from '../../services/pmService';
import ProjectCreationModal from '../../components/pm/ProjectCreationModal';
import './PMProjects.css';

const PMProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await getPMProjects(filters);
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pm-loading"><div className="pm-spinner"></div></div>;
  }

  const handleProjectCreated = () => {
    loadProjects();
  };

  return (
    <div className="pm-projects">
      <ProjectCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">My Projects</h1>
            <p className="page-subtitle">{projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</p>
          </div>
          <button className="btn-new-project" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            New Project
          </button>
        </div>

        {/* Toolbar in Header */}
        <div className="header-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Container */}
      <div className="projects-container">
        <div className={`projects-${viewMode}`}>
          {projects.length > 0 ? (
            projects.map(project => (
              <Link to={`/pm/projects/${project._id}`} key={project._id} className="project-card">
                <div className="project-header">
                  <h3 className="project-title">{project.name}</h3>
                  <span className={`status-badge ${project.status}`}>
                    {project.status === 'in-progress' ? 'In Progress' : project.status}
                  </span>
                </div>
                <p className="project-description">{project.description || 'No description available'}</p>
                <div className="project-footer">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.taskStats?.completion || 0}%` }}></div>
                  </div>
                  <span className="progress-text">{project.taskStats?.completion || 0}% Complete</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <Briefcase size={64} />
              <h3>No Projects Yet</h3>
              <p>Create your first project to get started</p>
              <button className="btn-create-first" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                Create Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PMProjects;


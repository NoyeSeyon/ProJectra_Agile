import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Crown,
  ChevronDown,
  ChevronUp,
  Lock,
  Link2,
  ShieldOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import SubtaskCreationModal from '../../components/member/SubtaskCreationModal';
import axios from 'axios';
import './MemberTasks.css';

const MemberTasks = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, projectFilter, typeFilter]);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        handleBreakdown(task);
      }
    }
  }, [searchParams, tasks]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load projects
      const projectsRes = await axios.get('/api/team-leader/projects');
      const projectsData = projectsRes.data.data.projects || [];
      console.log('📋 Loaded projects:', projectsData.map(p => ({
        id: p._id,
        name: p.name,
        teamLeader: p.teamLeader?._id || p.teamLeader,
        allowTeamLeaderSubtasks: p.settings?.allowTeamLeaderSubtasks,
        settings: p.settings
      })));
      setProjects(projectsData);

      // Load tasks assigned to this user (both main tasks and subtasks)
      const tasksRes = await axios.get('/api/team-leader/my-tasks');
      const allTasks = tasksRes.data.data.tasks || [];
      console.log('📋 Loaded tasks:', allTasks.length);

      setTasks(allTasks);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Project
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.project === projectFilter);
    }

    // Type (main tasks vs subtasks)
    if (typeFilter === 'main') {
      filtered = filtered.filter(task => !task.isSubtask);
    } else if (typeFilter === 'subtask') {
      filtered = filtered.filter(task => task.isSubtask);
    }

    setFilteredTasks(filtered);
  };

  const toggleTaskExpansion = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleBreakdown = (task) => {
    setSelectedTask(task);
    setShowSubtaskModal(true);
  };

  const handleSubtasksCreated = () => {
    setShowSubtaskModal(false);
    setSelectedTask(null);
    loadData(); // Reload to show new subtasks
  };

  const canCreateSubtasks = (task) => {
    if (!user || !task) return false;
    
    // Get project - either from populated task.project or from projects array
    let project;
    if (task.project && typeof task.project === 'object' && task.project._id) {
      // Task has populated project
      project = task.project;
    } else {
      // Task has project ID, find in projects array
      const projectId = task.project?._id || task.project;
      project = projects.find(p => p._id === projectId);
    }
    
    if (!project) {
      console.log('🔍 canCreateSubtasks: No project found for task', task._id);
      return false;
    }
    
    // Compare team leader ID with current user ID
    const teamLeaderId = project.teamLeader?._id || project.teamLeader;
    const userId = user._id || user.id;
    const isTeamLeader = teamLeaderId && teamLeaderId.toString() === userId.toString();
    const subtasksAllowed = project?.settings?.allowTeamLeaderSubtasks !== false;
    
    console.log('🔍 canCreateSubtasks check:', {
      taskId: task._id,
      projectId: project._id,
      projectName: project.name,
      teamLeaderId,
      userId,
      isTeamLeader,
      subtasksAllowed,
      result: isTeamLeader && subtasksAllowed
    });
    
    return isTeamLeader && subtasksAllowed;
  };

  const isTeamLeaderButDisabled = (task) => {
    if (!user || !task) return false;
    
    // Get project - either from populated task.project or from projects array
    let project;
    if (task.project && typeof task.project === 'object' && task.project._id) {
      project = task.project;
    } else {
      const projectId = task.project?._id || task.project;
      project = projects.find(p => p._id === projectId);
    }
    
    if (!project) return false;
    
    const teamLeaderId = project.teamLeader?._id || project.teamLeader;
    const userId = user._id || user.id;
    const isTeamLeader = teamLeaderId && teamLeaderId.toString() === userId.toString();
    const subtasksAllowed = project?.settings?.allowTeamLeaderSubtasks !== false;
    return isTeamLeader && !subtasksAllowed;
  };

  const getBlockingStatusIcon = (blockingStatus) => {
    if (blockingStatus === 'blocked') {
      return <Lock size={16} className="blocking-icon blocked" title="Blocked by dependencies" />;
    }
    if (blockingStatus === 'waiting') {
      return <Clock size={16} className="blocking-icon waiting" title="Waiting on dependencies" />;
    }
    return null;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c3aed'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: '#6b7280',
      in_progress: '#3b82f6',
      review: '#8b5cf6',
      completed: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  const mainTasks = tasks.filter(t => !t.isSubtask);
  const subtasks = tasks.filter(t => t.isSubtask);

  return (
    <div className="member-tasks">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="tasks-stats">
        <div className="stat-card">
          <div className="stat-value">{mainTasks.length}</div>
          <div className="stat-label">Main Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{subtasks.length}</div>
          <div className="stat-label">Subtasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div className="tasks-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="main">Main Tasks</option>
            <option value="subtask">Subtasks</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="tasks-list">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks.has(task._id);
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const canBreakdown = !task.isSubtask && canCreateSubtasks(task);
            // Handle both populated project object and project ID
            const projectId = task.project?._id || task.project;
            const project = task.project?.name 
              ? task.project  // Already populated from API
              : projects.find(p => p._id === projectId);  // Fallback: lookup in projects array

            return (
              <div key={task._id} className={`task-item ${task.isSubtask ? 'subtask' : ''} ${task.blockingStatus || ''}`}>
                <div className="task-main">
                  {/* Task Header */}
                  <div className="task-header">
                    <div className="task-title-section">
                      {hasSubtasks && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleTaskExpansion(task._id)}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      )}
                      <div>
                        <div className="task-title">
                          {getBlockingStatusIcon(task.blockingStatus)}
                          {task.title}
                        </div>
                        <div className="task-meta">
                          <span className="project-name">{project?.name || 'Unknown Project'}</span>
                          {task.storyPoints > 0 && (
                            <>
                              <span className="separator">•</span>
                              <span>{task.storyPoints} pts</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="task-badges">
                      {task.blockingStatus === 'blocked' && (
                        <span className="blocking-badge blocked">
                          <Lock size={14} />
                          Blocked
                        </span>
                      )}
                      {task.blockingStatus === 'waiting' && (
                        <span className="blocking-badge waiting">
                          <Clock size={14} />
                          Waiting
                        </span>
                      )}
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="task-info">
                    {task.assignee && (
                      <div className="info-item">
                        <span className="info-label">Assignee:</span>
                        <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                      </div>
                    )}
                    {task.timeTracking && (
                      <div className="info-item">
                        <Clock size={14} />
                        <span>{task.timeTracking.loggedHours || 0}h / {task.timeTracking.estimatedHours || 0}h</span>
                      </div>
                    )}
                    {hasSubtasks && (
                      <div className="info-item">
                        <CheckSquare size={14} />
                        <span>{task.subtasks.length} subtasks</span>
                      </div>
                    )}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="info-item dependencies">
                        <Link2 size={14} />
                        <span>{task.dependencies.length} dependencies</span>
                      </div>
                    )}
                  </div>

                  {/* Dependencies List */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="dependencies-section">
                      <h4>Dependencies:</h4>
                      <div className="dependencies-list">
                        {task.dependencies.map((dep) => (
                          <div key={dep._id || dep} className="dependency-item">
                            <Link2 size={12} />
                            <span>{dep.title || dep}</span>
                            {dep.status && (
                              <span
                                className="status-badge mini"
                                style={{ backgroundColor: `${getStatusColor(dep.status)}20`, color: getStatusColor(dep.status) }}
                              >
                                {dep.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {canBreakdown && (
                    <div className="task-actions">
                      <button
                        className="btn-breakdown"
                        onClick={() => handleBreakdown(task)}
                      >
                        <Plus size={16} />
                        {hasSubtasks ? 'Add More Subtasks' : 'Break into Subtasks'}
                      </button>
                      <span className="tl-indicator">
                        <Crown size={14} />
                        Team Leader
                      </span>
                    </div>
                  )}
                  
                  {/* Team Leader - Subtasks Disabled Message */}
                  {isTeamLeaderButDisabled(task) && !hasSubtasks && (
                    <div className="task-actions disabled">
                      <div className="disabled-message">
                        <ShieldOff size={16} />
                        <span>Subtask creation disabled by Project Manager</span>
                      </div>
                      <span className="tl-indicator">
                        <Crown size={14} />
                        Team Leader
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded Subtasks */}
                {isExpanded && hasSubtasks && (
                  <div className="subtasks-list">
                    {task.subtasks.map(subtask => (
                      <div key={subtask._id} className="subtask-item">
                        <div className="subtask-title">{subtask.title}</div>
                        <div className="subtask-info">
                          {subtask.assignee && (
                            <span>{subtask.assignee.firstName} {subtask.assignee.lastName}</span>
                          )}
                          <span
                            className="status-badge small"
                            style={{ backgroundColor: `${getStatusColor(subtask.status)}20`, color: getStatusColor(subtask.status) }}
                          >
                            {subtask.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CheckSquare size={64} />
          <h3>No tasks found</h3>
          <p>
            {searchQuery || statusFilter !== 'all' || projectFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No tasks assigned to you yet'}
          </p>
        </div>
      )}

      {/* Subtask Creation Modal */}
      {showSubtaskModal && selectedTask && (
        <SubtaskCreationModal
          task={selectedTask}
          project={projects.find(p => p._id === selectedTask.project)}
          onClose={() => {
            setShowSubtaskModal(false);
            setSelectedTask(null);
          }}
          onSuccess={handleSubtasksCreated}
        />
      )}
    </div>
  );
};

export default MemberTasks;


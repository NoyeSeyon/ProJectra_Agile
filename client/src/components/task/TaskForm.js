import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Flag, Target, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const TaskForm = ({ task, onSubmit, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    dueDate: '',
    estimatedHours: 0,
    storyPoints: 0,
    projectId: '', // Changed from 'project' to match backend
    assignee: '' // Changed from 'assignedTo' to match backend
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        type: task.type || 'task',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        storyPoints: task.storyPoints || 0,
        projectId: task.project?._id || '',
        assignee: task.assignee?._id || ''
      });
    }
    loadProjects();
  }, [task]);

  // Load users when project is selected
  useEffect(() => {
    if (formData.projectId) {
      loadProjectMembers(formData.projectId);
    }
  }, [formData.projectId]);

  const loadProjects = async () => {
    try {
      console.log('🔄 Loading projects for user:', user?.role);
      
      let response;
      let projectList = [];
      
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Get their managed projects
        response = await axios.get('/api/pm/projects');
        projectList = response.data.data?.projects || response.data.projects || [];
        console.log('✅ PM Projects loaded:', projectList.length);
      } else if (user?.role === 'team_leader') {
        // Team Leader: Get assigned projects
        response = await axios.get('/api/team-leader/projects');
        const allProjects = response.data.data?.projects || response.data.projects || [];
        
        // Filter to show ONLY projects where user is Team Leader
        projectList = allProjects.filter(project => {
          const teamLeaderId = project.teamLeader?._id || project.teamLeader;
          return teamLeaderId && teamLeaderId.toString() === user._id.toString();
        });
        
        console.log('✅ Team Leader Projects (filtered):', projectList.length, 'out of', allProjects.length);
      } else if (user?.role === 'member') {
        // Member: Cannot create tasks, but show all projects for viewing
        response = await axios.get('/api/team-leader/projects');
        projectList = response.data.data?.projects || response.data.projects || [];
        console.log('✅ Member Projects loaded:', projectList.length);
      } else if (user?.role === 'admin' || user?.role === 'super_admin') {
        // Admin: Get all organization projects
        response = await axios.get('/api/projects');
        projectList = response.data?.projects || [];
        console.log('✅ Admin Projects loaded:', projectList.length);
      }
      
      setProjects(projectList);
    } catch (err) {
      console.error('❌ Failed to load projects:', err);
    }
  };

  const loadProjectMembers = async (projectId) => {
    try {
      console.log('🔄 Loading members for project:', projectId);
      
      // Find the selected project
      const selectedProject = projects.find(p => p._id === projectId);
      
      if (!selectedProject) {
        console.error('❌ Project not found:', projectId);
        setUsers([]);
        return;
      }
      
      let membersList = [];
      
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Get available members
        const response = await axios.get(`/api/pm/available-members`);
        membersList = response.data.data || [];
      } else if (user?.role === 'admin' || user?.role === 'super_admin') {
        // Admin: Get all users
        const response = await axios.get('/api/admin/users', { params: { role: 'member,team_leader' } });
        membersList = response.data.users || [];
      } else if (user?.role === 'team_leader') {
        // Team Leader: Get only members from selected project (exclude Team Leader)
        if (selectedProject.members && Array.isArray(selectedProject.members)) {
          // Filter to show only members, exclude team leader
          const teamLeaderId = selectedProject.teamLeader?._id || selectedProject.teamLeader;
          
          membersList = selectedProject.members
            .map(m => m.user || m)
            .filter(member => {
              const memberId = member._id || member;
              return memberId.toString() !== teamLeaderId?.toString();
            });
        }
      }
      
      console.log('✅ Project Members loaded:', membersList.length, '(Team Leader excluded)');
      setUsers(membersList);
    } catch (err) {
      console.error('❌ Failed to load users:', err);
      setUsers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        setError('Due date cannot be in the past');
        setLoading(false);
        return;
      }
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Target size={20} className="mr-2" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="epic">Epic</option>
                  <option value="story">Story</option>
                  <option value="subtask">Subtask</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Due date cannot be in the past</p>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock size={20} className="mr-2" />
              Time Tracking
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  name="storyPoints"
                  value={formData.storyPoints}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User size={20} className="mr-2" />
              Assignment
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.projectId}
                >
                  <option value="">Select User{!formData.projectId ? ' (Select project first)' : ''}</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name || `${user.firstName} ${user.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              <span>{task ? 'Update' : 'Create'} Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Search, Filter, RefreshCw, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import TaskForm from '../components/task/TaskForm';
import QuickTimeLogModal from '../components/kanban/QuickTimeLogModal';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { updateTaskStatus } from '../services/taskService';

const Kanban = () => {
  const { user } = useAuth();
  const { connected, onTaskUpdated, emitTaskUpdated, emitCardMoved, onCardMoved } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [timeLogTask, setTimeLogTask] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100', badge: 'bg-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100', badge: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-100', badge: 'bg-purple-500' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100', badge: 'bg-green-500' }
  ];

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  // Socket.io real-time updates
  useEffect(() => {
    if (!connected) return;

    // Listen for task updates from other users
    const unsubscribeTaskUpdated = onTaskUpdated && onTaskUpdated((data) => {
      console.log('📡 Task updated via socket:', data);
      if (data.task) {
        setTasks(prev => {
          const existing = prev.find(t => t._id === data.task._id);
          if (existing) {
            // Update existing task
            return prev.map(t => t._id === data.task._id ? { ...t, ...data.task } : t);
          } else {
            // Add new task
            return [...prev, data.task];
          }
        });
      }
    });

    // Listen for card movements from other users
    const unsubscribeCardMoved = onCardMoved && onCardMoved((data) => {
      console.log('📡 Card moved via socket:', data);
      if (data.taskId && data.newStatus && data.userId !== user?._id) {
        // Update task status in real-time
        setTasks(prev => prev.map(task => 
          task._id === data.taskId 
            ? { ...task, status: data.newStatus, updatedBy: data.userId } 
            : task
        ));
      }
    });

    return () => {
      if (unsubscribeTaskUpdated) unsubscribeTaskUpdated();
      if (unsubscribeCardMoved) unsubscribeCardMoved();
    };
  }, [connected, onTaskUpdated, onCardMoved, user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Loading tasks for user:', user?.role);
      
      // Load tasks based on user role
      let response;
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Get all tasks from their projects
        const projectsResponse = await axios.get('/api/pm/projects');
        // Backend returns data.data.projects (nested data object)
        const pmProjects = projectsResponse.data.data?.projects || projectsResponse.data.projects || [];
        console.log('📋 PM Projects:', pmProjects.length);
        
        // Fetch tasks for all PM projects
        const allTasks = [];
        for (const project of pmProjects) {
          try {
            const tasksRes = await axios.get(`/api/pm/projects/${project._id}/tasks`);
            console.log(`📋 Tasks for ${project.name}:`, tasksRes.data);
            
            // Backend returns tasks directly in data, not nested
            const projectTasks = tasksRes.data.tasks || [];
            console.log(`  → Found ${projectTasks.length} tasks`);
            allTasks.push(...projectTasks);
          } catch (err) {
            console.error(`Failed to load tasks for project ${project._id}:`, err);
            console.error('Error response:', err.response?.data);
          }
        }
        console.log('✅ Total PM tasks loaded:', allTasks.length);
        console.log('📊 All tasks:', allTasks);
        setTasks(allTasks);
      } else if (user?.role === 'member' || user?.role === 'team_leader') {
        // Member/Team Leader: Get their assigned tasks
        response = await axios.get('/api/team-leader/my-tasks');
        console.log('✅ Member tasks loaded:', response.data.tasks?.length || 0);
        setTasks(response.data.tasks || []);
      } else if (user?.role === 'admin' || user?.role === 'super_admin') {
        // Admin: Get all organization tasks
        response = await axios.get('/api/tasks', { params: { limit: 100 } });
        console.log('✅ Admin tasks loaded:', response.data.data?.tasks?.length || 0);
        setTasks(response.data.data?.tasks || []);
      } else {
        // Fallback: Try generic tasks endpoint
        response = await axios.get('/api/tasks', { params: { limit: 100 } });
        setTasks(response.data.data?.tasks || []);
      }
    } catch (err) {
      console.error('❌ Failed to load tasks:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load tasks');
      
      // Show helpful message if no projects exist
      if (err.response?.status === 404 || err.response?.data?.projects?.length === 0) {
        setError('No projects found. Create a project first in PM Dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      console.log('🔄 Loading projects for user:', user?.role);
      
      let response;
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Get their managed projects
        response = await axios.get('/api/pm/projects');
        // Backend returns data.data.projects (nested data object)
        const projects = response.data.data?.projects || response.data.projects || [];
        console.log('✅ PM Projects loaded:', projects.length);
        setProjects(projects);
      } else if (user?.role === 'member' || user?.role === 'team_leader') {
        // Member/TL: Get assigned projects
        response = await axios.get('/api/team-leader/projects');
        console.log('✅ Member Projects loaded:', response.data.projects?.length || 0);
        setProjects(response.data.projects || []);
      } else if (user?.role === 'admin' || user?.role === 'super_admin') {
        // Admin: Get all organization projects
        response = await axios.get('/api/projects');
        console.log('✅ Admin Projects loaded:', response.data?.projects?.length || 0);
        setProjects(response.data?.projects || []);
      }
    } catch (err) {
      console.error('❌ Failed to load projects:', err);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('🔄 Creating task:', taskData);
      
      let response;
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Create task via PM endpoint
        response = await axios.post(`/api/pm/projects/${taskData.projectId}/tasks`, taskData);
      } else {
        // Fallback: Try generic task endpoint
        response = await axios.post('/api/tasks', taskData);
      }
      
      console.log('✅ Task created:', response.data);
      setTasks(prev => [response.data.task, ...prev]);
      setShowForm(false);
      loadTasks(); // Reload to ensure consistency
    } catch (err) {
      console.error('❌ Failed to create task:', err);
      throw err;
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      console.log('🔄 Updating task:', taskId, taskData);
      
      let response;
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        // PM: Update via PM endpoint
        response = await axios.put(`/api/pm/tasks/${taskId}`, taskData);
      } else {
        // Fallback: Try generic endpoint
        response = await axios.put(`/api/tasks/${taskId}`, taskData);
      }
      
      console.log('✅ Task updated:', response.data);
      setTasks(prev => prev.map(t => t._id === taskId ? response.data.task : t));
      setEditingTask(null);
    } catch (err) {
      console.error('❌ Failed to update task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      console.log('🔄 Deleting task:', taskId);
      
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        await axios.delete(`/api/pm/tasks/${taskId}`);
      } else {
        await axios.delete(`/api/tasks/${taskId}`);
      }
      
      console.log('✅ Task deleted');
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('❌ Failed to delete task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Optimistic update
    setTasks(prev => prev.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      // Use role-specific endpoint for status update
      if (user?.role === 'pm' || user?.role === 'project_manager') {
        await axios.put(`/api/pm/tasks/${taskId}`, { status: newStatus });
      } else {
        await updateTaskStatus(taskId, newStatus);
      }
      
      // Emit socket event for real-time collaboration
      if (emitCardMoved) {
        emitCardMoved({
          taskId,
          newStatus,
          userId: user?._id,
          userName: `${user?.firstName} ${user?.lastName}`
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError(err.response?.data?.message || 'Failed to update task');
      // Revert on error
      loadTasks();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (!task) return false;
    
    const matchesSearch = !searchTerm || 
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = projectFilter === 'all' || 
      (task.project?._id === projectFilter || task.project === projectFilter);
    
    return matchesSearch && matchesProject;
  });

  const getTasksByStatus = (status) => {
    const tasksForStatus = filteredTasks.filter(task => {
      // Handle both 'todo' and 'to_do' status formats
      if (status === 'todo') {
        return task.status === 'todo' || task.status === 'to_do';
      }
      return task.status === status;
    });
    
    console.log(`📊 ${status} column has ${tasksForStatus.length} tasks:`, 
      tasksForStatus.map(t => ({ title: t.title, status: t.status }))
    );
    
    return tasksForStatus;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Kanban board..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-600">Drag and drop tasks to manage workflow</p>
                {connected && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadTasks}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                title="Refresh tasks"
              >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(event.active.id)}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowForm(true);
                }}
                onDelete={handleDeleteTask}
                onLogTime={(task) => setTimeLogTask(task)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <KanbanCard
                task={tasks.find(task => task._id === activeId)}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? 
              (data) => handleUpdateTask(editingTask._id, data) :
              handleCreateTask
            }
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Quick Time Log Modal */}
        {timeLogTask && (
          <QuickTimeLogModal
            task={timeLogTask}
            onClose={() => setTimeLogTask(null)}
            onSuccess={() => {
              loadTasks(); // Reload tasks to show updated time
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Kanban;
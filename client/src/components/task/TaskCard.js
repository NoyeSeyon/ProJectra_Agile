import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, User, Calendar, Flag, Clock, Target } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      'task': 'bg-blue-100 text-blue-800',
      'bug': 'bg-red-100 text-red-800',
      'feature': 'bg-green-100 text-green-800',
      'epic': 'bg-purple-100 text-purple-800',
      'story': 'bg-indigo-100 text-indigo-800',
      'subtask': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-blue-100 text-blue-800';
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                <button
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} /> Edit Task
                </button>
                <button
                  onClick={() => { onDelete(task._id); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status, Priority, and Type */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          {task.priority && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              <Flag size={12} className="mr-1" />
              {task.priority}
            </span>
          )}
          {task.type && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
              <Target size={12} className="mr-1" />
              {task.type}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {task.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Task Details */}
        <div className="space-y-3">
          {/* Assigned To */}
          {task.assignedTo && (
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2" />
              <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
            </div>
          )}

          {/* Project */}
          {task.project && (
            <div className="flex items-center text-sm text-gray-600">
              <Target size={16} className="mr-2" />
              <span>{task.project.name}</span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Story Points */}
          {task.storyPoints > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2" />
              <span>{task.storyPoints} story points</span>
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimatedHours > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2" />
              <span>{task.estimatedHours}h estimated</span>
            </div>
          )}

          {/* Hours Logged */}
          {task.hoursLogged > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2" />
              <span>{task.hoursLogged}h logged</span>
            </div>
          )}
        </div>

        {/* Comments Count */}
        {task.commentsCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <span>{task.commentsCount} comment{task.commentsCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
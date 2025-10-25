import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Users, Calendar, Target, TrendingUp } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'on_hold': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const progress = project.progress || calculateProgress();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
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
                  onClick={() => { onEdit(project); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} /> Edit Project
                </button>
                <button
                  onClick={() => { onDelete(project._id); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {project.priority && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-3">
          {/* Team Members */}
          {project.teamMembers && project.teamMembers.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users size={16} className="mr-2" />
              <span>{project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Project Manager */}
          {project.assignedTo && (
            <div className="flex items-center text-sm text-gray-600">
              <Target size={16} className="mr-2" />
              <span>PM: {project.assignedTo.firstName} {project.assignedTo.lastName}</span>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
          </div>

          {/* Budget */}
          {project.budget && project.budget.amount > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} className="mr-2" />
              <span>
                Budget: ${project.budget.amount.toLocaleString()}
                {project.budget.spent > 0 && (
                  <span className="text-gray-500">
                    {' '}(Spent: ${project.budget.spent.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Task Count */}
        {project.tasks && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {project.tasks.filter(task => task.status === 'completed').length} of {project.tasks.length} tasks completed
              </span>
              <span className="text-gray-500">
                {project.tasks.filter(task => task.status === 'in_progress').length} in progress
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
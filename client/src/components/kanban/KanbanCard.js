import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Edit, Trash2, User, Calendar, Flag, Clock, Plus } from 'lucide-react';

const KanbanCard = ({ task, onEdit, onDelete, onLogTime, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab hover:shadow-md transition-shadow duration-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Priority and Type */}
      <div className="flex flex-wrap gap-1 mb-3">
        {task.priority && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            <Flag size={10} className="mr-1" />
            {task.priority}
          </span>
        )}
        {task.type && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
            {task.type}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="space-y-2">
        {/* Assigned To */}
        {task.assignedTo && (
          <div className="flex items-center text-xs text-gray-600">
            <User size={12} className="mr-1" />
            <span className="truncate">{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-600">
            <Calendar size={12} className="mr-1" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Story Points */}
        {task.storyPoints > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <Clock size={12} className="mr-1" />
            <span>{task.storyPoints} pts</span>
          </div>
        )}

        {/* Estimated Hours */}
        {task.estimatedHours > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <Clock size={12} className="mr-1" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
      </div>

      {/* Comments Count */}
      {task.commentsCount > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <span>{task.commentsCount} comment{task.commentsCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Time Tracking */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs">
            {task.timeTracking && task.timeTracking.loggedHours > 0 ? (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-purple-600" />
                <span className="font-semibold text-purple-600">
                  {task.timeTracking.loggedHours.toFixed(1)}h
                </span>
                {task.timeTracking.estimatedHours > 0 && (
                  <span className="text-gray-500">
                    / {task.timeTracking.estimatedHours}h
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-xs">No time logged</span>
            )}
          </div>
          {onLogTime && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogTime(task);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Log time"
            >
              <Plus size={12} />
              <span>Log</span>
            </button>
          )}
        </div>
        {task.timeTracking && task.timeTracking.estimatedHours > 0 && task.timeTracking.loggedHours > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  (task.timeTracking.loggedHours / task.timeTracking.estimatedHours) * 100 > 100
                    ? 'bg-red-500'
                    : 'bg-purple-600'
                }`}
                style={{ 
                  width: `${Math.min((task.timeTracking.loggedHours / task.timeTracking.estimatedHours) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  User,
  Flag,
  Target,
  Clock,
  Link2,
  Lock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './PMTaskList.css';

const PMTaskList = ({ tasks = [], onEditTask, onDeleteTask }) => {
  const [expandedGroups, setExpandedGroups] = useState({
    todo: true,
    in_progress: true,
    review: true,
    completed: false
  });

  // Group tasks by status
  const groupedTasks = {
    todo: tasks.filter(t => !t.isSubtask && t.status === 'todo'),
    in_progress: tasks.filter(t => !t.isSubtask && t.status === 'in_progress'),
    review: tasks.filter(t => !t.isSubtask && t.status === 'review'),
    completed: tasks.filter(t => !t.isSubtask && t.status === 'completed')
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: 'To Do',
      in_progress: 'In Progress',
      review: 'Review',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#7c3aed'
    };
    return colors[priority] || colors.medium;
  };

  const getBlockingIcon = (blockingStatus) => {
    if (blockingStatus === 'blocked') {
      return <Lock size={16} className="blocking-icon blocked" title="Blocked" />;
    }
    if (blockingStatus === 'waiting') {
      return <Clock size={16} className="blocking-icon waiting" title="Waiting on dependencies" />;
    }
    return null;
  };

  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general' || spec === 'None' || spec === 'any') return null;
    return spec;
  };

  const renderTaskCard = (task) => {
    const hasDependencies = task.dependencies && task.dependencies.length > 0;
    const hasSubtasks = tasks.filter(t => t.mainTask?._id === task._id || t.mainTask === task._id).length > 0;

    return (
      <div key={task._id} className={`task-card ${task.blockingStatus || 'not_blocked'}`}>
        <div className="task-card-header">
          <div className="task-title-row">
            <h4 className="task-title">
              {getBlockingIcon(task.blockingStatus)}
              {task.title}
            </h4>
            <div className="task-actions">
              <button
                className="btn-task-action edit"
                onClick={() => onEditTask(task)}
                title="Edit task"
              >
                <Edit size={16} />
              </button>
              <button
                className="btn-task-action delete"
                onClick={() => onDeleteTask(task._id)}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>

        <div className="task-card-body">
          <div className="task-meta">
            {/* Assignee */}
            {task.assignee && (
              <div className="task-meta-item">
                <User size={14} />
                <span>
                  {task.assignee.firstName} {task.assignee.lastName}
                  {getSpecializationDisplay(task.assignee.specialization) && (
                    <span className="meta-spec">
                      ({getSpecializationDisplay(task.assignee.specialization)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Priority */}
            <div className="task-meta-item">
              <Flag size={14} style={{ color: getPriorityColor(task.priority) }} />
              <span style={{ color: getPriorityColor(task.priority) }}>
                {task.priority || 'medium'}
              </span>
            </div>

            {/* Story Points */}
            {task.storyPoints > 0 && (
              <div className="task-meta-item">
                <Target size={14} />
                <span>{task.storyPoints} pts</span>
              </div>
            )}

            {/* Estimated Hours */}
            {task.timeTracking?.estimatedHours > 0 && (
              <div className="task-meta-item">
                <Clock size={14} />
                <span>
                  {task.timeTracking.loggedHours || 0}h / {task.timeTracking.estimatedHours}h
                </span>
              </div>
            )}

            {/* Dependencies Indicator */}
            {hasDependencies && (
              <div className="task-meta-item dependencies">
                <Link2 size={14} />
                <span>{task.dependencies.length} dependencies</span>
              </div>
            )}

            {/* Subtasks Indicator */}
            {hasSubtasks && (
              <div className="task-meta-item subtasks">
                <Target size={14} />
                <span>Has subtasks</span>
              </div>
            )}
          </div>

          {/* Required Specialization */}
          {getSpecializationDisplay(task.requiredSpecialization) && (
            <div className="task-required-spec">
              <span className="spec-badge">
                Required: {getSpecializationDisplay(task.requiredSpecialization)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <AlertCircle size={48} color="#9ca3af" />
        <h3>No tasks yet</h3>
        <p>Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="pm-task-list">
      {/* To Do */}
      <div className="task-group">
        <div
          className="task-group-header"
          onClick={() => toggleGroup('todo')}
        >
          <div className="group-title">
            <span className="status-indicator todo"></span>
            <h3>{getStatusLabel('todo')}</h3>
            <span className="task-count">{groupedTasks.todo.length}</span>
          </div>
          {expandedGroups.todo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {expandedGroups.todo && (
          <div className="task-group-content">
            {groupedTasks.todo.length > 0 ? (
              groupedTasks.todo.map(renderTaskCard)
            ) : (
              <div className="task-group-empty">No tasks in this status</div>
            )}
          </div>
        )}
      </div>

      {/* In Progress */}
      <div className="task-group">
        <div
          className="task-group-header"
          onClick={() => toggleGroup('in_progress')}
        >
          <div className="group-title">
            <span className="status-indicator in_progress"></span>
            <h3>{getStatusLabel('in_progress')}</h3>
            <span className="task-count">{groupedTasks.in_progress.length}</span>
          </div>
          {expandedGroups.in_progress ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {expandedGroups.in_progress && (
          <div className="task-group-content">
            {groupedTasks.in_progress.length > 0 ? (
              groupedTasks.in_progress.map(renderTaskCard)
            ) : (
              <div className="task-group-empty">No tasks in this status</div>
            )}
          </div>
        )}
      </div>

      {/* Review */}
      <div className="task-group">
        <div
          className="task-group-header"
          onClick={() => toggleGroup('review')}
        >
          <div className="group-title">
            <span className="status-indicator review"></span>
            <h3>{getStatusLabel('review')}</h3>
            <span className="task-count">{groupedTasks.review.length}</span>
          </div>
          {expandedGroups.review ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {expandedGroups.review && (
          <div className="task-group-content">
            {groupedTasks.review.length > 0 ? (
              groupedTasks.review.map(renderTaskCard)
            ) : (
              <div className="task-group-empty">No tasks in this status</div>
            )}
          </div>
        )}
      </div>

      {/* Completed */}
      <div className="task-group">
        <div
          className="task-group-header"
          onClick={() => toggleGroup('completed')}
        >
          <div className="group-title">
            <span className="status-indicator completed"></span>
            <h3>{getStatusLabel('completed')}</h3>
            <span className="task-count">{groupedTasks.completed.length}</span>
          </div>
          {expandedGroups.completed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {expandedGroups.completed && (
          <div className="task-group-content">
            {groupedTasks.completed.length > 0 ? (
              groupedTasks.completed.map(renderTaskCard)
            ) : (
              <div className="task-group-empty">No tasks in this status</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PMTaskList;


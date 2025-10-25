import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, TrendingUp, AlertCircle, Edit2, Trash2, Filter, X, Check, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import timeTrackingService from '../../services/timeTrackingService';
import axios from 'axios';
import './MemberTimeTracking.css';

const MemberTimeTracking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeLogs, setTimeLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [editingLog, setEditingLog] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    taskId: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: 'all',
    taskId: 'all',
    billable: 'all',
    startDate: '',
    endDate: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeLogs, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load user's time logs using the service
      const logsData = await timeTrackingService.getUserTimeLogs(user._id || user.id);
      const logs = logsData.data.logs || [];
      setTimeLogs(logs);
      
      // Calculate stats
      const calculatedStats = timeTrackingService.calculateTimeStats(logs);
      setStats(calculatedStats);

      // Load tasks for the form
      await loadTasks();
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      // Load user's assigned tasks
      const response = await axios.get('/api/team-leader/tasks');
      setTasks(response.data.data?.tasks || []);
    } catch (err) {
      console.error('Load tasks error:', err);
      // Non-critical error, just use empty tasks array
      setTasks([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...timeLogs];

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== 'all') {
      const dateRanges = timeTrackingService.getDateRangePresets();
      const range = dateRanges[filters.dateRange];
      if (range && range.startDate) {
        filtered = filtered.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= new Date(range.startDate) && logDate <= new Date(range.endDate);
        });
      }
    }

    // Custom date range
    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.date) <= new Date(filters.endDate));
    }

    // Task filter
    if (filters.taskId !== 'all') {
      filtered = filtered.filter(log => log.task?._id === filters.taskId);
    }

    // Billable filter
    if (filters.billable !== 'all') {
      const isBillable = filters.billable === 'billable';
      filtered = filtered.filter(log => log.billable === isBillable);
    }

    setFilteredLogs(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');

      if (editingLog) {
        // Update existing log
        await timeTrackingService.updateTimeLog(
          formData.taskId,
          editingLog._id,
          {
            hours: parseFloat(formData.hours),
            description: formData.description,
            billable: formData.billable
          }
        );
        setSuccess('Time log updated successfully!');
        setEditingLog(null);
      } else {
        // Create new log
        await timeTrackingService.logTime(formData);
        setSuccess('Time logged successfully!');
      }
      
      // Reset form
      setFormData({
        taskId: '',
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        billable: true
      });
      setShowLogForm(false);
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to log time');
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      taskId: log.task?._id || '',
      hours: log.hours.toString(),
      description: log.description || '',
      date: new Date(log.date).toISOString().split('T')[0],
      billable: log.billable
    });
    setShowLogForm(true);
  };

  const handleDelete = async (log) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) {
      return;
    }

    try {
      setError('');
      await timeTrackingService.deleteTimeLog(log.task._id, log._id);
      setSuccess('Time log deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete time log');
    }
  };

  const cancelForm = () => {
    setShowLogForm(false);
    setEditingLog(null);
    setFormData({
      taskId: '',
      hours: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      billable: true
    });
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      taskId: 'all',
      billable: 'all',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading time tracking..." />
      </div>
    );
  }

  const groupedLogs = viewMode === 'grouped' 
    ? timeTrackingService.groupLogsByDate(filteredLogs)
    : null;

  return (
    <div className="time-tracking-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Time Tracking</h1>
          <p>Log and manage your work hours</p>
        </div>
        <button className="btn-primary" onClick={() => setShowLogForm(!showLogForm)}>
          <Plus size={18} />
          Log Time
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Check size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="time-stats">
          <div className="stat-card primary">
            <Clock size={32} />
            <div className="stat-content">
              <div className="stat-value">{stats.total}h</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
          <div className="stat-card success">
            <TrendingUp size={32} />
            <div className="stat-content">
              <div className="stat-value">{stats.week}h</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>
          <div className="stat-card warning">
            <DollarSign size={32} />
            <div className="stat-content">
              <div className="stat-value">{stats.billable}h</div>
              <div className="stat-label">Billable</div>
            </div>
          </div>
          <div className="stat-card info">
            <BarChart3 size={32} />
            <div className="stat-content">
              <div className="stat-value">{stats.month}h</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        </div>
      )}

      {/* Log Form */}
      {showLogForm && (
        <div className="log-form-card">
          <div className="form-header">
            <h3>{editingLog ? 'Edit Time Log' : 'Log Time Entry'}</h3>
            <button className="close-btn" onClick={cancelForm}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="log-form">
            <div className="form-row">
              <div className="form-group">
                <label>Task *</label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  required
                  disabled={editingLog}
                >
                  <option value="">Select task...</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Hours *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="0.0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={editingLog}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What did you work on?"
                rows="3"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                />
                <span>Billable hours</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingLog ? 'Update' : 'Log Time'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and View Controls */}
      <div className="controls-bar">
        <button 
          className={`btn-filter ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
          {(filters.dateRange !== 'all' || filters.taskId !== 'all' || filters.billable !== 'all') && (
            <span className="filter-badge"></span>
          )}
        </button>

        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={viewMode === 'grouped' ? 'active' : ''}
            onClick={() => setViewMode('grouped')}
          >
            Grouped View
          </button>
        </div>

        <div className="results-count">
          {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Task</label>
              <select
                value={filters.taskId}
                onChange={(e) => setFilters({ ...filters, taskId: e.target.value })}
              >
                <option value="all">All Tasks</option>
                {tasks.map(task => (
                  <option key={task._id} value={task._id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.billable}
                onChange={(e) => setFilters({ ...filters, billable: e.target.value })}
              >
                <option value="all">All</option>
                <option value="billable">Billable Only</option>
                <option value="non-billable">Non-Billable Only</option>
              </select>
            </div>
          </div>

          <button className="btn-reset" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Time Logs List */}
      <div className="logs-container">
        {filteredLogs.length > 0 ? (
          viewMode === 'list' ? (
            <div className="logs-list">
              {filteredLogs.map((log) => (
                <div key={log._id} className="log-item">
                  <div className="log-main">
                    <div className="log-header">
                      <div className="log-task-title">{log.task?.title || 'Unknown Task'}</div>
                      <div className="log-hours">
                        {timeTrackingService.formatHours(log.hours)}
                      </div>
                    </div>
                    {log.description && (
                      <div className="log-description">{log.description}</div>
                    )}
                    <div className="log-footer">
                      <span className="log-date">
                        <Calendar size={14} />
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      {log.billable && <span className="billable-badge">Billable</span>}
                    </div>
                  </div>
                  <div className="log-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(log)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(log)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="logs-grouped">
              {groupedLogs.map((group) => (
                <div key={group.date} className="log-group">
                  <div className="group-header">
                    <span className="group-date">
                      {new Date(group.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="group-total">
                      {timeTrackingService.formatHours(group.totalHours)}
                    </span>
                  </div>
                  <div className="group-logs">
                    {group.logs.map((log) => (
                      <div key={log._id} className="log-item-compact">
                        <div className="log-compact-main">
                          <div className="log-compact-task">{log.task?.title || 'Unknown Task'}</div>
                          {log.description && (
                            <div className="log-compact-desc">{log.description}</div>
                          )}
                        </div>
                        <div className="log-compact-info">
                          <span className="log-compact-hours">
                            {timeTrackingService.formatHours(log.hours)}
                          </span>
                          {log.billable && <DollarSign size={14} className="billable-icon" />}
                        </div>
                        <div className="log-compact-actions">
                          <button
                            className="btn-icon-sm"
                            onClick={() => handleEdit(log)}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-icon-sm danger"
                            onClick={() => handleDelete(log)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <Clock size={64} />
            <h3>No time logs found</h3>
            <p>
              {timeLogs.length === 0 
                ? 'Start logging your hours to track your work'
                : 'No logs match your filters. Try adjusting your filter settings.'}
            </p>
            {timeLogs.length > 0 && (
              <button className="btn-primary" onClick={resetFilters}>
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTimeTracking;

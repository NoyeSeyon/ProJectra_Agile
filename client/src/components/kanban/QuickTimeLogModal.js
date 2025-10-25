import React, { useState } from 'react';
import { Clock, X, DollarSign } from 'lucide-react';
import timeTrackingService from '../../services/timeTrackingService';
import './QuickTimeLogModal.css';

const QuickTimeLogModal = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick hour buttons
  const quickHours = [0.5, 1, 2, 4, 8];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hours || formData.hours <= 0) {
      setError('Please enter valid hours');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await timeTrackingService.logTime({
        taskId: task._id,
        hours: parseFloat(formData.hours),
        description: formData.description,
        date: formData.date,
        billable: formData.billable
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Log time error:', err);
      setError(err.message || 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  const setQuickHours = (hours) => {
    setFormData({ ...formData, hours: hours.toString() });
  };

  return (
    <div className="quick-time-modal-overlay" onClick={onClose}>
      <div className="quick-time-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Clock size={20} />
            <span>Log Time</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="task-info">
            <div className="task-title">{task.title}</div>
            {task.timeTracking && (
              <div className="task-time-summary">
                Logged: {timeTrackingService.formatHours(task.timeTracking.loggedHours || 0)}
                {task.timeTracking.estimatedHours > 0 && (
                  <span className="estimated">
                    / {task.timeTracking.estimatedHours}h estimated
                  </span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hours *</label>
              <div className="hours-input-group">
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="0.0"
                  required
                  autoFocus
                />
                <div className="quick-hours">
                  {quickHours.map(hours => (
                    <button
                      key={hours}
                      type="button"
                      className={`quick-hour-btn ${formData.hours === hours.toString() ? 'active' : ''}`}
                      onClick={() => setQuickHours(hours)}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What did you work on?"
                rows="2"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                />
                <DollarSign size={16} />
                <span>Billable hours</span>
              </label>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Logging...' : 'Log Time'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickTimeLogModal;


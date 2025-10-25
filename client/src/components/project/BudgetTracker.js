import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Plus, RefreshCw } from 'lucide-react';
import budgetService from '../../services/budgetService';
import './BudgetTracker.css';

const BudgetTracker = ({ projectId, onAddExpense }) => {
  const [budget, setBudget] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadBudget();
    }
  }, [projectId]);

  const loadBudget = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await budgetService.getProjectBudget(projectId);
      setBudget(response.data.budget);
      setStatus(response.data.status);
    } catch (err) {
      console.error('Load budget error:', err);
      setError(err.message || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="budget-tracker loading">
        <div className="spinner"></div>
        <p>Loading budget...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-tracker error">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <button className="btn-retry" onClick={loadBudget}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!budget || !status) {
    return (
      <div className="budget-tracker empty">
        <DollarSign size={48} />
        <p>No budget set for this project</p>
      </div>
    );
  }

  const { planned, spent, currency } = budget;
  const { percentage, remaining, status: alertStatus, isAlert } = status;

  // Circular progress calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get status color
  const getStatusColor = () => {
    if (percentage >= 95) return '#ef4444'; // Red
    if (percentage >= 80) return '#f97316'; // Orange
    if (percentage >= 70) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const statusColor = getStatusColor();

  return (
    <div className="budget-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-title">
          <DollarSign size={24} />
          <h3>Project Budget</h3>
        </div>
        {onAddExpense && (
          <button className="btn-add-expense" onClick={onAddExpense}>
            <Plus size={16} />
            Add Expense
          </button>
        )}
      </div>

      {/* Alert Banner */}
      {isAlert && (
        <div className={`alert-banner ${alertStatus}`}>
          <AlertTriangle size={18} />
          <span>
            {alertStatus === 'critical' && 'Critical: Budget nearly exhausted!'}
            {alertStatus === 'warning' && 'Warning: Approaching budget limit'}
            {alertStatus === 'caution' && 'Caution: Monitor spending closely'}
          </span>
        </div>
      )}

      {/* Circular Progress */}
      <div className="circular-progress-container">
        <svg className="circular-progress" width="200" height="200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            className="progress-circle"
          />
        </svg>
        
        {/* Center Text */}
        <div className="progress-center">
          <div className="percentage" style={{ color: statusColor }}>
            {percentage}%
          </div>
          <div className="label">Spent</div>
        </div>
      </div>

      {/* Budget Details */}
      <div className="budget-details">
        <div className="detail-row">
          <span className="detail-label">Planned</span>
          <span className="detail-value planned">
            {budgetService.formatCurrency(planned, currency)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Spent</span>
          <span className="detail-value spent">
            {budgetService.formatCurrency(spent, currency)}
          </span>
        </div>
        <div className="detail-row highlight">
          <span className="detail-label">Remaining</span>
          <span className="detail-value remaining" style={{ color: remaining >= 0 ? '#10b981' : '#ef4444' }}>
            {budgetService.formatCurrency(remaining, currency)}
          </span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="status-indicator">
        <div className={`status-badge ${alertStatus}`}>
          {percentage >= 95 && <TrendingDown size={16} />}
          {percentage < 95 && percentage >= 70 && <AlertTriangle size={16} />}
          {percentage < 70 && <TrendingUp size={16} />}
          <span>{budgetService.getBudgetStatusLabel(percentage)}</span>
        </div>
      </div>

      {/* Refresh Button */}
      <button className="btn-refresh" onClick={loadBudget} title="Refresh budget">
        <RefreshCw size={16} />
      </button>
    </div>
  );
};

export default BudgetTracker;


import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import budgetService from '../../services/budgetService';
import './ExpenseModal.css';

const ExpenseModal = ({ projectId, projectBudget, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'general',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'labor', label: 'Labor' },
    { value: 'materials', label: 'Materials' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software/Licenses' },
    { value: 'services', label: 'Services' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  // Calculate preview
  const amount = parseFloat(formData.amount) || 0;
  const currentSpent = projectBudget?.spent || 0;
  const planned = projectBudget?.planned || 0;
  const newSpent = currentSpent + amount;
  const newPercentage = budgetService.calculateBudgetPercentage(newSpent, planned);
  const newRemaining = planned - newSpent;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await budgetService.logExpense({
        projectId,
        amount: parseFloat(formData.amount),
        description: `${formData.category}: ${formData.description}`.trim()
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Log expense error:', err);
      setError(err.message || 'Failed to log expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <DollarSign size={24} />
            <span>Log Expense</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label>Amount * ({projectBudget?.currency || 'USD'})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
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
              placeholder="Brief description of the expense..."
              rows="3"
            />
          </div>

          {/* Budget Preview */}
          {projectBudget && amount > 0 && (
            <div className="budget-preview">
              <div className="preview-header">
                <span className="preview-title">Budget Impact</span>
              </div>
              <div className="preview-content">
                <div className="preview-row">
                  <span className="preview-label">Current Spent:</span>
                  <span className="preview-value">
                    {budgetService.formatCurrency(currentSpent, projectBudget.currency)}
                  </span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">This Expense:</span>
                  <span className="preview-value expense">
                    + {budgetService.formatCurrency(amount, projectBudget.currency)}
                  </span>
                </div>
                <div className="preview-row highlight">
                  <span className="preview-label">New Total:</span>
                  <span className="preview-value total">
                    {budgetService.formatCurrency(newSpent, projectBudget.currency)}
                  </span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Remaining:</span>
                  <span 
                    className="preview-value remaining"
                    style={{ color: newRemaining >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {budgetService.formatCurrency(newRemaining, projectBudget.currency)}
                  </span>
                </div>
                <div className="preview-percentage">
                  <div className="percentage-bar">
                    <div 
                      className={`percentage-fill ${budgetService.getBudgetStatusColor(newPercentage)}`}
                      style={{ width: `${Math.min(newPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="percentage-text">{newPercentage}% of budget</span>
                </div>
                {newPercentage >= 80 && (
                  <div className={`preview-alert ${budgetService.getBudgetStatusColor(newPercentage)}`}>
                    <AlertCircle size={16} />
                    <span>
                      {newPercentage >= 95 && 'Warning: This will exceed budget limits!'}
                      {newPercentage >= 80 && newPercentage < 95 && 'Caution: Approaching budget limit'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              {loading ? 'Logging...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;


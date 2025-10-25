import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { getPMAnalytics } from '../../services/pmService';
import './PMAnalytics.css';

const PMAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getPMAnalytics(timeRange);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pm-loading"><div className="pm-spinner"></div></div>;
  }

  const { summary = {}, budgetAnalysis = [], taskMetrics = [] } = analytics || {};

  return (
    <div className="pm-analytics">
      <div className="analytics-header">
        <h2>Analytics & Reports</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card blue">
          <div className="card-icon">
            <BarChart3 size={28} />
          </div>
          <div className="card-content">
            <h3>{summary.totalProjects || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="summary-card green">
          <div className="card-icon">
            <CheckCircle size={28} />
          </div>
          <div className="card-content">
            <h3>{summary.completedProjects || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="summary-card purple">
          <div className="card-icon">
            <TrendingUp size={28} />
          </div>
          <div className="card-content">
            <h3>{summary.averageCompletion || 0}%</h3>
            <p>Avg Completion</p>
          </div>
        </div>

        <div className="summary-card indigo">
          <div className="card-icon">
            <DollarSign size={28} />
          </div>
          <div className="card-content">
            <h3>${summary.totalBudget?.toLocaleString() || 0}</h3>
            <p>Total Budget</p>
          </div>
        </div>
      </div>

      {/* Budget Analysis */}
      {budgetAnalysis.length > 0 && (
        <div className="analytics-section">
          <h3>Budget vs Actual</h3>
          <div className="budget-chart">
            {budgetAnalysis.map((project, idx) => (
              <div key={idx} className="budget-item">
                <div className="budget-label">{project.projectName}</div>
                <div className="budget-bars">
                  <div className="budget-bar estimated">
                    <span className="bar-label">Estimated</span>
                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(project.estimated / Math.max(...budgetAnalysis.map(p => p.estimated))) * 100}%`
                        }}
                      />
                      <span className="bar-value">${project.estimated?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="budget-bar spent">
                    <span className="bar-label">Spent</span>
                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(project.spent / Math.max(...budgetAnalysis.map(p => p.estimated))) * 100}%`
                        }}
                      />
                      <span className="bar-value">${project.spent?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Metrics */}
      {taskMetrics.length > 0 && (
        <div className="analytics-section">
          <h3>Task Status Distribution</h3>
          <div className="task-metrics">
            {taskMetrics.map((metric, idx) => (
              <div key={idx} className="metric-item">
                <div className="metric-label">{metric._id}</div>
                <div className="metric-count">{metric.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PMAnalytics;


import React from 'react';
import ReactApexChart from 'react-apexcharts';
import './BurndownChart.css';

const BurndownChart = ({ burndownData, plannedStoryPoints }) => {
  if (!burndownData || burndownData.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No burndown data available yet. Start tracking your sprint progress!</p>
      </div>
    );
  }

  // Prepare data for the chart
  const dates = burndownData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const remainingPoints = burndownData.map(d => d.remainingStoryPoints);
  const idealPoints = burndownData.map(d => d.idealRemaining);

  const options = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#3b82f6', '#10b981'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    xaxis: {
      categories: dates,
      title: {
        text: 'Sprint Days',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#6b7280'
        }
      },
      labels: {
        style: {
          fontSize: '11px',
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Story Points',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#6b7280'
        }
      },
      labels: {
        style: {
          fontSize: '11px',
          colors: '#6b7280'
        }
      },
      min: 0,
      max: plannedStoryPoints || Math.max(...remainingPoints, ...idealPoints) + 5
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 2
      },
      itemMargin: {
        horizontal: 12
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `${value} points`
      }
    }
  };

  const series = [
    {
      name: 'Actual Remaining',
      data: remainingPoints
    },
    {
      name: 'Ideal Burndown',
      data: idealPoints
    }
  ];

  return (
    <div className="burndown-chart">
      <div className="chart-header">
        <h3>Sprint Burndown Chart</h3>
        <div className="chart-legend-info">
          <span className="legend-item">
            <span className="legend-dot actual"></span>
            Actual Progress
          </span>
          <span className="legend-item">
            <span className="legend-dot ideal"></span>
            Ideal Progress
          </span>
        </div>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default BurndownChart;


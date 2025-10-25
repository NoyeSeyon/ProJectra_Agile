import React from 'react';
import Chart from 'react-apexcharts';

const AreaChart = ({ 
  data = [], 
  categories = [], 
  title = '', 
  height = 350,
  colors = ['#3b82f6', '#10b981'],
  yAxisTitle = '',
  xAxisTitle = '',
  stacked = false
}) => {
  const options = {
    chart: {
      type: 'area',
      toolbar: {
        show: true
      },
      stacked: stacked,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: colors,
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#1f2937'
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    xaxis: {
      categories: categories,
      title: {
        text: xAxisTitle,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          color: '#6b7280'
        }
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          color: '#6b7280'
        }
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true
      },
      y: {
        formatter: (value) => value.toFixed(0)
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: {
        colors: '#6b7280'
      }
    }
  };

  const series = Array.isArray(data[0]) 
    ? data.map((series, index) => ({
        name: series.name || `Series ${index + 1}`,
        data: series.data || []
      }))
    : [{
        name: 'Value',
        data: data
      }];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Chart options={options} series={series} type="area" height={height} />
    </div>
  );
};

export default AreaChart;


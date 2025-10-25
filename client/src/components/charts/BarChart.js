import React from 'react';
import Chart from 'react-apexcharts';

const BarChart = ({ 
  data = [], 
  categories = [], 
  title = '', 
  height = 350,
  colors = ['#3b82f6'],
  horizontal = false,
  yAxisTitle = '',
  xAxisTitle = '',
  stacked = false
}) => {
  const options = {
    chart: {
      type: 'bar',
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
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
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
    fill: {
      opacity: 1
    },
    tooltip: {
      theme: 'light',
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
      <Chart options={options} series={series} type="bar" height={height} />
    </div>
  );
};

export default BarChart;


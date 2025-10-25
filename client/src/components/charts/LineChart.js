import React from 'react';
import Chart from 'react-apexcharts';

const LineChart = ({ 
  data = [], 
  categories = [], 
  title = '', 
  height = 350,
  colors = ['#3b82f6'],
  yAxisTitle = '',
  xAxisTitle = ''
}) => {
  const options = {
    chart: {
      type: 'line',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
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
    colors: colors,
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
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
    markers: {
      size: 5,
      colors: colors,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7
      }
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
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
};

export default LineChart;


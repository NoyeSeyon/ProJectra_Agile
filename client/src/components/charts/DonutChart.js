import React from 'react';
import Chart from 'react-apexcharts';

const DonutChart = ({ 
  data = [], 
  labels = [], 
  title = '', 
  height = 350,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}) => {
  const options = {
    chart: {
      type: 'donut',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: colors,
    labels: labels,
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#1f2937'
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: '#1f2937'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#1f2937',
              formatter: function (val) {
                return val;
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6b7280',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#6b7280'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => value
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: '100%'
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Chart options={options} series={data} type="donut" height={height} />
    </div>
  );
};

export default DonutChart;


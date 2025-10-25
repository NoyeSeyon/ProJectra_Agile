import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  FolderIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getSystemAnalytics } from '../../services/superAdminService';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSystemAnalytics({ days: timeRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ChartBarIcon className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Organizations',
      value: analytics?.summary?.totalOrganizations || 0,
      change: '+12.5%',
      changeType: 'positive',
      icon: BuildingOfficeIcon,
      color: 'blue'
    },
    {
      name: 'Total Users',
      value: analytics?.summary?.totalUsers || 0,
      change: '+18.2%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Total Projects',
      value: analytics?.summary?.totalProjects || 0,
      change: '+24.7%',
      changeType: 'positive',
      icon: FolderIcon,
      color: 'purple'
    },
    {
      name: 'Active Projects',
      value: analytics?.summary?.activeProjects || 0,
      change: '+8.1%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-500 mt-1">Platform-wide statistics and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
          };
          
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {stat.changeType === 'positive' && (
                  <span className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Growth</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Project Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Activity</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Server</span>
              <span className="flex items-center text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WebSocket</span>
              <span className="flex items-center text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage</span>
              <span className="flex items-center text-blue-600">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                78% Used
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Organizations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Organizations by Activity</h2>
        <div className="space-y-4">
          {analytics?.topOrganizations?.map((org, index) => (
            <div key={org._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-500">
                    {org.stats?.projects || 0} projects • {org.stats?.members || 0} members
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{org.stats?.tasks || 0}</p>
                <p className="text-sm text-gray-500">tasks</p>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;


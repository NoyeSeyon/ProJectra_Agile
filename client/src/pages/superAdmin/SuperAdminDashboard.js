import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  FolderIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getSystemAnalytics, getAllOrganizations } from '../../services/superAdminService';

const SuperAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, orgsData] = await Promise.all([
        getSystemAnalytics(),
        getAllOrganizations({ page: 1, limit: 5 })
      ]);
      setAnalytics(analyticsData.data || {});
      setOrganizations(orgsData.data?.organizations || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default empty data instead of showing error
      setAnalytics({});
      setOrganizations([]);
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

  const stats = [
    {
      name: 'Total Organizations',
      value: analytics?.summary?.totalOrganizations || 0,
      change: '+12%',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'blue'
    },
    {
      name: 'Active Organizations',
      value: analytics?.summary?.activeOrganizations || 0,
      change: analytics?.summary?.inactiveOrganizations 
        ? `${analytics.summary.inactiveOrganizations} inactive` 
        : '0 inactive',
      changeType: 'neutral',
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      name: 'Total Users',
      value: analytics?.summary?.totalUsers || 0,
      change: '+18%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'purple'
    },
    {
      name: 'Total Projects',
      value: analytics?.summary?.totalProjects || 0,
      change: '+24%',
      changeType: 'increase',
      icon: FolderIcon,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Super Admin!</h1>
        <p className="text-blue-100 text-lg">
          Monitor and manage the entire Projectra platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {stat.changeType === 'increase' && (
                  <span className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
                {stat.changeType === 'neutral' && (
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Organizations</h2>
            <Link
              to="/super-admin/organizations"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {organizations.length > 0 ? (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {org.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">
                        {org.stats?.members || 0} members • {org.stats?.projects || 0} projects
                      </p>
                    </div>
                  </div>
                  <div>
                    {org.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No organizations yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/super-admin/organizations/create"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create Organization</h3>
                  <p className="text-sm text-gray-500">Add a new organization</p>
                </div>
              </div>
              <span className="text-blue-600">→</span>
            </Link>

            <Link
              to="/super-admin/admins/create"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create Admin</h3>
                  <p className="text-sm text-gray-500">Add organization admin</p>
                </div>
              </div>
              <span className="text-purple-600">→</span>
            </Link>

            <Link
              to="/super-admin/analytics"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-500">System-wide reports</p>
                </div>
              </div>
              <span className="text-green-600">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Activity (Placeholder) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent System Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New organization created', org: 'TechCorp Inc', time: '5 minutes ago', type: 'create' },
            { action: 'Admin assigned', org: 'Design Studio', time: '1 hour ago', type: 'update' },
            { action: 'Organization updated', org: 'StartupXYZ', time: '3 hours ago', type: 'update' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'create' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.org}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;


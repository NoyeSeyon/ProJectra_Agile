import React from 'react';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'user': '👤',
      'project': '📁',
      'task': '✅',
      'sprint': '🏃',
      'team': '👥',
      'organization': '🏢',
      'system': '⚙️',
      'security': '🔒',
      'integration': '🔗',
      'communication': '💬'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (severity) => {
    const colors = {
      'info': 'text-blue-600',
      'warning': 'text-yellow-600',
      'error': 'text-red-600',
      'critical': 'text-red-800'
    };
    return colors[severity] || 'text-gray-600';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity._id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${getActivityColor(activity.severity)}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(activity.createdAt)}
                    </p>
                  </div>
                  {activity.actor && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.actor.firstName} {activity.actor.lastName}
                    </p>
                  )}
                  {activity.resource && (
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.resource.type}: {activity.resource.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">Activity will appear here as you work.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
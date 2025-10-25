import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingChatAndAI from '../components/FloatingChatAndAI';
import ActivityFeed from '../components/activity/ActivityFeed';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Clock,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { getDashboardData } from '../services/dashboardService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    overdueTasks: 0,
    velocity: 0,
    efficiency: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper function to load mock data as fallback
  const loadMockData = () => {
    setUsingMockData(true);
    setStats({
        totalProjects: 12,
        activeProjects: 8,
        totalTasks: 45,
        completedTasks: 156,
        teamMembers: 24,
        overdueTasks: 3,
        velocity: 42,
        efficiency: 87
      });
      
      setRecentProjects([
        {
          _id: 1,
          name: 'E-commerce Platform',
          description: 'Modern e-commerce solution with React and Node.js',
          status: 'active',
          progress: 75,
          deadline: '2024-02-15',
          team: 8
        },
        {
          _id: 2,
          name: 'Mobile App',
          description: 'Cross-platform mobile application',
          status: 'active',
          progress: 45,
          deadline: '2024-03-01',
          team: 5
        },
        {
          _id: 3,
          name: 'Web Dashboard',
          description: 'Analytics dashboard for project management',
          status: 'review',
          progress: 95,
          deadline: '2024-01-30',
          team: 6
        }
      ]);

      setRecentTasks([
        {
          _id: 1,
          title: 'User Authentication',
          description: 'Implement JWT-based authentication system',
          status: 'completed',
          priority: 'high'
        },
        {
          _id: 2,
          title: 'Database Schema Design',
          description: 'Design and implement database structure',
          status: 'in_progress',
          priority: 'medium'
        },
        {
          _id: 3,
          title: 'API Documentation',
          description: 'Create comprehensive API documentation',
          status: 'pending',
          priority: 'low'
        }
      ]);

      setUpcomingDeadlines([
        {
          id: 1,
          title: 'Project Alpha - Phase 1',
          deadline: '2024-01-15',
          priority: 'high',
          progress: 75
        },
        {
          id: 2,
          title: 'Bug Fix Sprint',
          deadline: '2024-01-18',
          priority: 'medium',
          progress: 60
        },
        {
          id: 3,
          title: 'Client Demo',
          deadline: '2024-01-20',
          priority: 'high',
          progress: 90
        }
      ]);

      setProjectProgress([
        {
          id: 1,
          name: 'E-commerce Platform',
          progress: 85,
          status: 'active',
          team: 8,
          deadline: '2024-02-15'
        },
        {
          id: 2,
          name: 'Mobile App',
          progress: 45,
          status: 'active',
          team: 5,
          deadline: '2024-03-01'
        },
        {
          id: 3,
          name: 'Web Dashboard',
          progress: 95,
          status: 'review',
          team: 6,
          deadline: '2024-01-30'
        }
      ]);

      setActivities([
        {
          id: 1,
          type: 'task_completed',
          message: 'Task "User Authentication" completed by John Doe',
          timestamp: '2 hours ago',
          user: 'John Doe',
          avatar: 'JD',
          project: 'E-commerce Platform'
        },
        {
          id: 2,
          type: 'project_created',
          message: 'New project "Mobile App" created',
          timestamp: '4 hours ago',
          user: 'Sarah Wilson',
          avatar: 'SW',
          project: 'Mobile App'
        },
        {
          id: 3,
          type: 'member_joined',
          message: 'New team member Mike Johnson joined',
          timestamp: '1 day ago',
          user: 'Mike Johnson',
          avatar: 'MJ',
          project: 'All Projects'
        }
      ]);
      
      setLastUpdated(new Date());
  };

  //  Main function to load dashboard data - tries real API first, falls back to mock
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError('');
      setUsingMockData(false);

      // Try to fetch real data from API
      const dashboardData = await getDashboardData();
      
      // Set real data from API
      setStats({
        totalProjects: dashboardData.stats.totalProjects || 0,
        activeProjects: dashboardData.stats.activeProjects || 0,
        totalTasks: dashboardData.stats.totalTasks || 0,
        completedTasks: dashboardData.stats.completedTasks || 0,
        teamMembers: dashboardData.stats.teamMembers || 0,
        overdueTasks: dashboardData.stats.overdueTasks || 0,
        velocity: dashboardData.stats.velocity || 0,
        efficiency: dashboardData.stats.efficiency || 0
      });

      setRecentProjects(dashboardData.projects || []);
      setRecentTasks(dashboardData.tasks || []);
      setUpcomingDeadlines(dashboardData.deadlines || []);
      setActivities(dashboardData.activities || []);
      setProjectProgress(dashboardData.progress || []);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Failed to load real dashboard data, using mock data:', err);
      // Fall back to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'project_manager': 'Project Manager',
      'team_leader': 'Team Leader',
      'member': 'Team Member',
      'client': 'Client'
    };
    return roleMap[role] || role;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'project_created': return <FolderOpen className="h-4 w-4 text-blue-500" />;
      case 'member_joined': return <Users className="h-4 w-4 text-purple-500" />;
      case 'sprint_completed': return <Target className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="dashboard-gradient-header relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {user?.firstName}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                {getRoleDisplayName(user?.role)} • {user?.organization?.name || 'Your Organization'}
              </p>
              <div className="flex items-center mt-3 space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  connected ? 'bg-green-500 bg-opacity-20 text-green-100' : 'bg-red-500 bg-opacity-20 text-red-100'
                }`}>
                  {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
                {usingMockData && (
                  <div className="px-3 py-1 rounded-full text-sm bg-yellow-500 bg-opacity-20 text-yellow-100">
                    ⚠️ Using Demo Data
                  </div>
                )}
                <button
                  onClick={() => loadDashboardData(true)}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex flex-col gap-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Zap className="w-3 h-3 mr-1" />
                High priority: {stats.overdueTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.teamMembers}</p>
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <Users className="w-3 h-3 mr-1" />
                8 online now
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Velocity</p>
              <p className="text-3xl font-bold text-gray-900">{stats.velocity}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +5% this sprint
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Progress */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary-600" />
                Project Progress
              </h3>
              <Button variant="tertiary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-6">
              {projectProgress.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.team} team members • Due {project.deadline}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                Deadlines
              </h3>
              <Button variant="tertiary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">{deadline.deadline}</p>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{deadline.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${deadline.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary-600" />
                Recent Activities
              </h3>
              <Button variant="tertiary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {activities.map((activity, activityIdx) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {activity.project}
                      </span>
                      <span className="text-xs text-gray-500">by {activity.user}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="space-y-4">
              <Button 
                variant="primary" 
                className="w-full justify-start"
                icon={<Plus className="w-4 h-4" />}
              >
                Create New Project
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<Users className="w-4 h-4" />}
              >
                Invite Team Member
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<BarChart3 className="w-4 h-4" />}
              >
                View Analytics
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<CheckSquare className="w-4 h-4" />}
              >
                Create Task
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      </div>

      {/* Floating Chat and AI */}
      <FloatingChatAndAI />
    </div>
  );
};

export default Dashboard;
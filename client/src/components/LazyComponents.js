import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components
const Analytics = lazy(() => import('../pages/Analytics'));
const Projects = lazy(() => import('../pages/Projects'));
const Tasks = lazy(() => import('../pages/Tasks'));
const Kanban = lazy(() => import('../pages/Kanban'));
const Settings = lazy(() => import('../pages/Settings'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));

// Lazy load chart components
const ApexCharts = lazy(() => import('react-apexcharts'));

// Lazy load AI components
const AIAssistant = lazy(() => import('./ai/AIAssistant'));

// Lazy load form components
const ProjectForm = lazy(() => import('./project/ProjectForm'));
const TaskForm = lazy(() => import('./task/TaskForm'));

// Lazy load modal components
const Modal = lazy(() => import('./Modal'));

// Lazy load complex components
const ActivityFeed = lazy(() => import('./activity/ActivityFeed'));
const FileUpload = lazy(() => import('./FileUpload'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/UserManagement'));

// Lazy load PM components
const PMDashboard = lazy(() => import('../pages/PMDashboard'));
const MemberSelector = lazy(() => import('./MemberSelector'));
const ProjectWeightCalculator = lazy(() => import('./ProjectWeightCalculator'));

// Lazy load Team Leader components
const TeamLeaderDashboard = lazy(() => import('../pages/TeamLeaderDashboard'));
const TaskBreakdown = lazy(() => import('./TaskBreakdown'));
const SprintPlanning = lazy(() => import('../pages/SprintPlanning'));

// Lazy load Member components
const MemberDashboard = lazy(() => import('../pages/MemberDashboard'));
const WorkloadIndicator = lazy(() => import('./WorkloadIndicator'));
const MyTasks = lazy(() => import('../pages/MyTasks'));

// Lazy load Client components
const ClientDashboard = lazy(() => import('../pages/ClientDashboard'));
const BudgetTracker = lazy(() => import('./BudgetTracker'));
const ClientChat = lazy(() => import('./ClientChat'));
const ClientProgress = lazy(() => import('./ClientProgress'));

// Lazy load Agile components
const SprintManagement = lazy(() => import('../pages/SprintManagement'));
const Backlog = lazy(() => import('../pages/Backlog'));
const DailyStandup = lazy(() => import('./DailyStandup'));
const SprintRetrospective = lazy(() => import('../pages/SprintRetrospective'));
const BurndownChart = lazy(() => import('./BurndownChart'));
const PlanningPoker = lazy(() => import('./PlanningPoker'));

// Lazy load Analytics components
const AdminAnalytics = lazy(() => import('../pages/AdminAnalytics'));
const PMAnalytics = lazy(() => import('../pages/PMAnalytics'));
const TLAnalytics = lazy(() => import('../pages/TLAnalytics'));
const MemberAnalytics = lazy(() => import('../pages/MemberAnalytics'));

// Lazy load utility components
const WorkloadDashboard = lazy(() => import('./WorkloadDashboard'));

// Higher-order component for lazy loading with fallback
export const withLazyLoading = (Component) => {
  return (props) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy loaded components with fallback
export const LazyAnalytics = withLazyLoading(Analytics);
export const LazyProjects = withLazyLoading(Projects);
export const LazyTasks = withLazyLoading(Tasks);
export const LazyKanban = withLazyLoading(Kanban);
export const LazySettings = withLazyLoading(Settings);
export const LazyProjectDetail = withLazyLoading(ProjectDetail);

export const LazyApexCharts = withLazyLoading(ApexCharts);
export const LazyAIAssistant = withLazyLoading(AIAssistant);
export const LazyProjectForm = withLazyLoading(ProjectForm);
export const LazyTaskForm = withLazyLoading(TaskForm);
export const LazyModal = withLazyLoading(Modal);
export const LazyActivityFeed = withLazyLoading(ActivityFeed);
export const LazyFileUpload = withLazyLoading(FileUpload);

export const LazyAdminDashboard = withLazyLoading(AdminDashboard);
export const LazyUserManagement = withLazyLoading(UserManagement);
export const LazyPMDashboard = withLazyLoading(PMDashboard);
export const LazyMemberSelector = withLazyLoading(MemberSelector);
export const LazyProjectWeightCalculator = withLazyLoading(ProjectWeightCalculator);

export const LazyTeamLeaderDashboard = withLazyLoading(TeamLeaderDashboard);
export const LazyTaskBreakdown = withLazyLoading(TaskBreakdown);
export const LazySprintPlanning = withLazyLoading(SprintPlanning);
export const LazyMemberDashboard = withLazyLoading(MemberDashboard);
export const LazyWorkloadIndicator = withLazyLoading(WorkloadIndicator);
export const LazyMyTasks = withLazyLoading(MyTasks);

export const LazyClientDashboard = withLazyLoading(ClientDashboard);
export const LazyBudgetTracker = withLazyLoading(BudgetTracker);
export const LazyClientChat = withLazyLoading(ClientChat);
export const LazyClientProgress = withLazyLoading(ClientProgress);

export const LazySprintManagement = withLazyLoading(SprintManagement);
export const LazyBacklog = withLazyLoading(Backlog);
export const LazyDailyStandup = withLazyLoading(DailyStandup);
export const LazySprintRetrospective = withLazyLoading(SprintRetrospective);
export const LazyBurndownChart = withLazyLoading(BurndownChart);
export const LazyPlanningPoker = withLazyLoading(PlanningPoker);

export const LazyAdminAnalytics = withLazyLoading(AdminAnalytics);
export const LazyPMAnalytics = withLazyLoading(PMAnalytics);
export const LazyTLAnalytics = withLazyLoading(TLAnalytics);
export const LazyMemberAnalytics = withLazyLoading(MemberAnalytics);

export const LazyWorkloadDashboard = withLazyLoading(WorkloadDashboard);

// Lazy loading wrapper for any component
export const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Preload function for critical components
export const preloadComponents = () => {
  // Preload critical components
  import('../pages/Dashboard');
  import('../pages/Projects');
  import('../pages/Tasks');
  import('../pages/Kanban');
  import('../pages/Analytics');
  import('../pages/Settings');
};

// Lazy loading hook
export const useLazyLoading = (importFunction, deps = []) => {
  const [Component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    importFunction()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, deps);

  return { Component, loading, error };
};

// Lazy loading with retry
export const useLazyLoadingWithRetry = (importFunction, maxRetries = 3) => {
  const [Component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const loadComponent = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFunction();
      setComponent(() => module.default);
      setLoading(false);
    } catch (err) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadComponent(), 1000 * retryCount);
      } else {
        setError(err);
        setLoading(false);
      }
    }
  }, [importFunction, retryCount, maxRetries]);

  React.useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return { Component, loading, error, retry: loadComponent };
};

export default {
  LazyAnalytics,
  LazyProjects,
  LazyTasks,
  LazyKanban,
  LazySettings,
  LazyProjectDetail,
  LazyApexCharts,
  LazyAIAssistant,
  LazyProjectForm,
  LazyTaskForm,
  LazyModal,
  LazyActivityFeed,
  LazyFileUpload,
  LazyAdminDashboard,
  LazyUserManagement,
  LazyPMDashboard,
  LazyMemberSelector,
  LazyProjectWeightCalculator,
  LazyTeamLeaderDashboard,
  LazyTaskBreakdown,
  LazySprintPlanning,
  LazyMemberDashboard,
  LazyWorkloadIndicator,
  LazyMyTasks,
  LazyClientDashboard,
  LazyBudgetTracker,
  LazyClientChat,
  LazyClientProgress,
  LazySprintManagement,
  LazyBacklog,
  LazyDailyStandup,
  LazySprintRetrospective,
  LazyBurndownChart,
  LazyPlanningPoker,
  LazyAdminAnalytics,
  LazyPMAnalytics,
  LazyTLAnalytics,
  LazyMemberAnalytics,
  LazyWorkloadDashboard,
  LazyWrapper,
  preloadComponents,
  useLazyLoading,
  useLazyLoadingWithRetry
};

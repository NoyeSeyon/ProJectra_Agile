import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ToastContainer from './components/ToastNotification';
import Layout from './components/Layout';
import SuperAdminLayout from './components/superAdmin/SuperAdminLayout';
import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import OrganizationManagement from './pages/superAdmin/OrganizationManagement';
import AdminManagement from './pages/superAdmin/AdminManagement';
import SuperAdminAnalytics from './pages/superAdmin/SuperAdminAnalytics';
import SuperAdminSettings from './pages/superAdmin/SuperAdminSettings';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PMManagement from './pages/admin/PMManagement';
import UserManagement from './pages/admin/UserManagement';
// PM Pages
import PMLayout from './components/pm/PMLayout';
import PMDashboard from './pages/pm/PMDashboard';
import PMProjects from './pages/pm/PMProjects';
import PMProjectDetail from './pages/pm/PMProjectDetail';
import PMSprints from './pages/pm/PMSprints';
import PMSprintDetail from './pages/pm/PMSprintDetail';
import PMAllMembers from './pages/pm/PMAllMembers';
import PMTeam from './pages/pm/PMTeam';
import PMAnalytics from './pages/pm/PMAnalytics';
// Member/Team Leader Pages
import MemberLayout from './components/member/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProjects from './pages/member/MemberProjects';
import MemberTasks from './pages/member/MemberTasks';
import MemberTeam from './pages/member/MemberTeam';
import MemberTimeTracking from './pages/member/MemberTimeTracking';
// Client Pages
import ClientLayout from './components/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectProgress from './pages/client/ClientProjectProgress';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Super Admin Protected Route Component
const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// PM Route Component
const PMRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'project_manager' && user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Member/Team Leader Route Component
const MemberRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Allow member and team_leader roles
  if (user?.role !== 'member' && user?.role !== 'team_leader') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Client Protected Route Component
const ClientRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'client') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect super admin to super admin dashboard
    if (user?.role === 'super_admin') {
      return <Navigate to="/super-admin/dashboard" />;
    }
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
    // Redirect PM to PM dashboard
    if (user?.role === 'project_manager') {
      return <Navigate to="/pm/dashboard" />;
    }
    // Redirect member/team_leader to member dashboard
    if (user?.role === 'member' || user?.role === 'team_leader') {
      return <Navigate to="/member/dashboard" />;
    }
    // Redirect client to client dashboard
    if (user?.role === 'client') {
      return <Navigate to="/client/dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <ToastContainer />
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/kanban" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Kanban />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/pm-management" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <PMManagement />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <UserManagement />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/analytics" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Analytics />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Settings />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/kanban" 
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Kanban />
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* PM Routes */}
              <Route
                path="/pm/dashboard" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMDashboard />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/projects" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMProjects />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/projects/:projectId" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMProjectDetail />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/sprints/:projectId" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMSprints />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/sprint/:sprintId" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMSprintDetail />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/team" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMTeam />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/members" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMAllMembers />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/analytics" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <PMAnalytics />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/settings" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <Settings />
                    </PMLayout>
                  </PMRoute>
                }
              />
              <Route
                path="/pm/kanban" 
                element={
                  <PMRoute>
                    <PMLayout>
                      <Kanban />
                    </PMLayout>
                  </PMRoute>
                }
              />

              {/* Member/Team Leader Routes */}
              <Route
                path="/member/dashboard" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <MemberDashboard />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/projects" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <MemberProjects />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/tasks" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <MemberTasks />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/team" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <MemberTeam />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/time-tracking" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <MemberTimeTracking />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/settings" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <Settings />
                    </MemberLayout>
                  </MemberRoute>
                }
              />
              <Route
                path="/member/kanban" 
                element={
                  <MemberRoute>
                    <MemberLayout>
                      <Kanban />
                    </MemberLayout>
                  </MemberRoute>
                }
              />

              {/* Client Routes */}
              <Route
                path="/client/dashboard" 
                element={
                  <ClientRoute>
                    <ClientLayout>
                      <ClientDashboard />
                    </ClientLayout>
                  </ClientRoute>
                }
              />
              <Route
                path="/client/projects" 
                element={
                  <ClientRoute>
                    <ClientLayout>
                      <ClientDashboard />
                    </ClientLayout>
                  </ClientRoute>
                }
              />
              <Route
                path="/client/project/:projectId" 
                element={
                  <ClientRoute>
                    <ClientLayout>
                      <ClientProjectProgress />
                    </ClientLayout>
                  </ClientRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route 
                path="/super-admin/dashboard" 
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout>
                      <SuperAdminDashboard />
                    </SuperAdminLayout>
                  </SuperAdminRoute>
                } 
              />
              <Route 
                path="/super-admin/organizations" 
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout>
                      <OrganizationManagement />
                    </SuperAdminLayout>
                  </SuperAdminRoute>
                } 
              />
              <Route 
                path="/super-admin/admins" 
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout>
                      <AdminManagement />
                    </SuperAdminLayout>
                  </SuperAdminRoute>
                } 
              />
              <Route
                path="/super-admin/analytics" 
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout>
                      <SuperAdminAnalytics />
                    </SuperAdminLayout>
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/super-admin/settings" 
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout>
                      <SuperAdminSettings />
                    </SuperAdminLayout>
                  </SuperAdminRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
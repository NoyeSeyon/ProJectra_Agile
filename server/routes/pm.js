const express = require('express');
const { authenticate, checkOrganization, checkRole } = require('../middleware/auth');
const pmController = require('../controllers/pmController');

const router = express.Router();

// All routes require authentication and PM role (or admin)
router.use(authenticate);
router.use(checkOrganization);
router.use(checkRole(['project_manager', 'admin']));

/**
 * PM Routes
 * All routes are prefixed with /api/pm
 */

// GET /api/pm/dashboard - Get PM dashboard overview
router.get('/dashboard', pmController.getPMDashboard);

// GET /api/pm/projects - Get PM's projects with filters
router.get('/projects', pmController.getPMProjects);

// GET /api/pm/projects/:projectId - Get single project details
router.get('/projects/:projectId', pmController.getProjectById);

// GET /api/pm/projects/:projectId/tasks - Get project tasks
router.get('/projects/:projectId/tasks', pmController.getProjectTasks);

// GET /api/pm/team - Get PM's team members
router.get('/team', pmController.getPMTeam);

// GET /api/pm/analytics - Get PM analytics
router.get('/analytics', pmController.getPMAnalytics);

// GET /api/pm/capacity - Check PM capacity
router.get('/capacity', pmController.checkPMCapacity);

// GET /api/pm/available-team-leaders - Get users who can be team leaders
router.get('/available-team-leaders', pmController.getAvailableTeamLeaders);

// GET /api/pm/available-members - Get all team members
router.get('/available-members', pmController.getAvailableMembers);

// POST /api/pm/projects - Create new project
router.post('/projects', pmController.createProject);
router.put('/projects/:projectId', pmController.updateProject);

// DELETE /api/pm/projects/:projectId - Delete a project
router.delete('/projects/:projectId', pmController.deleteProject);

// GET /api/pm/debug-users - Debug endpoint to see all users in organization
router.get('/debug-users', pmController.debugUsers);

// ============================================
// MEMBER MANAGEMENT ROUTES
// ============================================

// POST /api/pm/projects/:projectId/members - Add member to project
router.post('/projects/:projectId/members', pmController.addMemberToProject);

// DELETE /api/pm/projects/:projectId/members/:userId - Remove member from project
router.delete('/projects/:projectId/members/:userId', pmController.removeMemberFromProject);

// PUT /api/pm/projects/:projectId/team-leader - Update team leader
router.put('/projects/:projectId/team-leader', pmController.updateTeamLeader);

// PUT /api/pm/projects/:projectId/members/:userId/specialization - Update member specialization
router.put('/projects/:projectId/members/:userId/specialization', pmController.updateMemberSpecialization);

// GET /api/pm/members - Get all members across PM's projects
router.get('/members', pmController.getAllProjectMembers);

// ============================================
// TASK MANAGEMENT ROUTES
// ============================================

// POST /api/pm/projects/:projectId/tasks - Create task for project
router.post('/projects/:projectId/tasks', pmController.createTask);

// PUT /api/pm/tasks/:taskId - Update any task
router.put('/tasks/:taskId', pmController.updateTask);

// DELETE /api/pm/tasks/:taskId - Delete any task
router.delete('/tasks/:taskId', pmController.deleteTask);

// PUT /api/pm/projects/:projectId/settings - Update project settings (including TL subtask toggle)
router.put('/projects/:projectId/settings', pmController.updateProjectSettings);

// POST /api/pm/tasks/:taskId/dependencies - Add task dependency
router.post('/tasks/:taskId/dependencies', pmController.addTaskDependency);

// DELETE /api/pm/tasks/:taskId/dependencies/:dependencyId - Remove task dependency
router.delete('/tasks/:taskId/dependencies/:dependencyId', pmController.removeTaskDependency);

module.exports = router;


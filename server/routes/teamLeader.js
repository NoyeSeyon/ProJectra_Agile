const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const teamLeaderController = require('../controllers/teamLeaderController');

// All routes require authentication and team_leader or member role (context-aware)
router.use(authenticate);

// @route   GET /api/team-leader/dashboard
// @desc    Get Team Leader dashboard stats
// @access  Private (Team Leader/Member)
router.get('/dashboard', teamLeaderController.getDashboard);

// @route   GET /api/team-leader/projects
// @desc    Get projects where user is team leader
// @access  Private (Team Leader/Member)
router.get('/projects', teamLeaderController.getProjects);

// @route   GET /api/team-leader/tasks/:projectId
// @desc    Get main tasks for a project
// @access  Private (Team Leader/Member)
router.get('/tasks/:projectId', teamLeaderController.getMainTasks);

// @route   GET /api/team-leader/my-tasks
// @desc    Get all tasks assigned to current user (main tasks + subtasks)
// @access  Private (Team Leader/Member)
router.get('/my-tasks', teamLeaderController.getMyTasks);

// @route   GET /api/team-leader/subtasks
// @desc    Get all subtasks created by Team Leader
// @access  Private (Team Leader)
router.get('/subtasks', teamLeaderController.getCreatedSubtasks);

// @route   POST /api/team-leader/subtasks
// @desc    Create subtasks from main task
// @access  Private (Team Leader/Member)
router.post(
  '/subtasks',
  [
    body('mainTaskId').notEmpty().withMessage('Main task ID is required'),
    body('subtasks').isArray({ min: 1 }).withMessage('At least one subtask is required'),
    body('subtasks.*.title').notEmpty().withMessage('Subtask title is required'),
    body('subtasks.*.estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
  ],
  teamLeaderController.createSubtasks
);

// @route   PUT /api/team-leader/subtasks/:subtaskId
// @desc    Update a subtask
// @access  Private (Team Leader/Member)
router.put('/subtasks/:subtaskId', teamLeaderController.updateSubtask);

// @route   POST /api/team-leader/assign-subtask
// @desc    Assign subtask to team member
// @access  Private (Team Leader/Member)
router.post(
  '/assign-subtask',
  [
    body('subtaskId').notEmpty().withMessage('Subtask ID is required'),
    body('userId').notEmpty().withMessage('User ID is required')
  ],
  teamLeaderController.assignSubtask
);

// @route   GET /api/team-leader/team-performance
// @desc    Get team performance metrics
// @access  Private (Team Leader/Member)
router.get('/team-performance', teamLeaderController.getTeamPerformance);

// @route   GET /api/team-leader/projects/:projectId/members
// @desc    Get project members (read-only for TL)
// @access  Private (Team Leader/Member)
router.get('/projects/:projectId/members', teamLeaderController.getProjectMembers);

module.exports = router;


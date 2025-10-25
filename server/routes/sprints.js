const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const sprintController = require('../controllers/sprintController');

// All routes require authentication
router.use(authenticate);

// @route   POST /api/sprints
// @desc    Create new sprint
// @access  Private (PM, Team Leader)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Sprint name is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('goal').optional().trim()
  ],
  sprintController.createSprint
);

// @route   GET /api/sprints/project/:projectId
// @desc    Get all sprints for a project
// @access  Private
router.get('/project/:projectId', sprintController.getProjectSprints);

// @route   GET /api/sprints/:sprintId
// @desc    Get sprint details
// @access  Private
router.get('/:sprintId', sprintController.getSprint);

// @route   PUT /api/sprints/:sprintId
// @desc    Update sprint
// @access  Private (PM, Team Leader)
router.put('/:sprintId', sprintController.updateSprint);

// @route   POST /api/sprints/:sprintId/start
// @desc    Start a sprint
// @access  Private (PM, Team Leader)
router.post('/:sprintId/start', sprintController.startSprint);

// @route   POST /api/sprints/:sprintId/complete
// @desc    Complete a sprint
// @access  Private (PM, Team Leader)
router.post('/:sprintId/complete', sprintController.completeSprint);

// @route   GET /api/sprints/:sprintId/burndown
// @desc    Get sprint burndown chart data
// @access  Private
router.get('/:sprintId/burndown', sprintController.getSprintBurndown);

// @route   POST /api/sprints/:sprintId/tasks
// @desc    Add tasks to sprint
// @access  Private (PM, Team Leader)
router.post(
  '/:sprintId/tasks',
  [
    body('taskIds').isArray({ min: 1 }).withMessage('Task IDs array is required')
  ],
  sprintController.addTasksToSprint
);

module.exports = router;


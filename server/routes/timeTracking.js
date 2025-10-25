const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const timeTrackingController = require('../controllers/timeTrackingController');

// All routes require authentication
router.use(authenticate);

// @route   POST /api/time-tracking/log
// @desc    Log time to a task
// @access  Private
router.post(
  '/log',
  [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('hours').isFloat({ min: 0.1, max: 24 }).withMessage('Hours must be between 0.1 and 24'),
    body('description').optional().trim(),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('billable').optional().isBoolean().withMessage('Billable must be true or false')
  ],
  timeTrackingController.logTime
);

// @route   GET /api/time-tracking/task/:taskId
// @desc    Get time logs for a task
// @access  Private
router.get('/task/:taskId', timeTrackingController.getTaskTimeLogs);

// @route   GET /api/time-tracking/project/:projectId
// @desc    Get time logs for a project
// @access  Private
router.get('/project/:projectId', timeTrackingController.getProjectTimeLogs);

// @route   GET /api/time-tracking/user/:userId
// @desc    Get time logs for a user
// @access  Private
router.get('/user/:userId', timeTrackingController.getUserTimeLogs);

// @route   PUT /api/time-tracking/log/:taskId/:logId
// @desc    Update a time log
// @access  Private (Own logs only)
router.put(
  '/log/:taskId/:logId',
  [
    body('hours').optional().isFloat({ min: 0.1, max: 24 }).withMessage('Hours must be between 0.1 and 24'),
    body('description').optional().trim(),
    body('billable').optional().isBoolean().withMessage('Billable must be true or false')
  ],
  timeTrackingController.updateTimeLog
);

// @route   DELETE /api/time-tracking/log/:taskId/:logId
// @desc    Delete a time log
// @access  Private (Own logs only)
router.delete('/log/:taskId/:logId', timeTrackingController.deleteTimeLog);

module.exports = router;


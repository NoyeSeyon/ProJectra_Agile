const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

// All routes require authentication
router.use(authenticate);

// @route   GET /api/budget/project/:projectId
// @desc    Get project budget status
// @access  Private (PM, Admin, Team Leader)
router.get('/project/:projectId', budgetController.getProjectBudget);

// @route   PUT /api/budget/project/:projectId
// @desc    Update project budget
// @access  Private (PM, Admin)
router.put(
  '/project/:projectId',
  [
    body('planned').optional().isFloat({ min: 0 }).withMessage('Planned budget must be a positive number'),
    body('spent').optional().isFloat({ min: 0 }).withMessage('Spent amount must be a positive number'),
    body('currency').optional().isString().withMessage('Currency must be a string'),
    body('alertThreshold').optional().isInt({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100')
  ],
  budgetController.updateProjectBudget
);

// @route   POST /api/budget/expense
// @desc    Log an expense to project
// @access  Private (PM, Admin, Team Leader)
router.post(
  '/expense',
  [
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('description').optional().trim()
  ],
  budgetController.logExpense
);

// @route   GET /api/budget/alerts
// @desc    Get budget alerts for user's projects
// @access  Private
router.get('/alerts', budgetController.getBudgetAlerts);

module.exports = router;


const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const clientController = require('../controllers/clientController');

// Middleware to check if user is a client
const isClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Client role required.'
    });
  }
  next();
};

// All routes require authentication and client role
router.use(authenticate);
router.use(isClient);

// @route   GET /api/client/dashboard
// @desc    Get client dashboard data
// @access  Private (Client)
router.get('/dashboard', clientController.getClientDashboard);

// @route   GET /api/client/projects
// @desc    Get client's projects
// @access  Private (Client)
router.get('/projects', clientController.getClientProjects);

// @route   GET /api/client/project/:projectId/progress
// @desc    Get specific project progress details
// @access  Private (Client)
router.get('/project/:projectId/progress', clientController.getProjectProgress);

// @route   GET /api/client/project/:projectId/timeline
// @desc    Get project timeline
// @access  Private (Client)
router.get('/project/:projectId/timeline', clientController.getProjectTimeline);

// @route   POST /api/client/feedback
// @desc    Submit client feedback
// @access  Private (Client)
router.post(
  '/feedback',
  [
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  clientController.submitFeedback
);

// @route   GET /api/client/reports
// @desc    Get project reports
// @access  Private (Client)
router.get('/reports', clientController.getReports);

module.exports = router;


const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// PM Management Routes
router.post('/assign-pm', adminController.assignPM);
router.delete('/unassign-pm/:userId', adminController.unassignPM);
router.get('/pms', adminController.getPMs);
router.put('/pm/:userId/capacity', adminController.updatePMCapacity);
router.get('/pm/:userId/projects', adminController.getPMProjects);

// User Management Routes
router.get('/users', adminController.getOrganizationUsers);
router.post('/users/invite', adminController.inviteUser);
router.put('/users/:userId/role', adminController.changeUserRole);
router.patch('/users/:userId/status', adminController.toggleUserStatus);

// Analytics Route
router.get('/analytics', adminController.getOrganizationAnalytics);

module.exports = router;


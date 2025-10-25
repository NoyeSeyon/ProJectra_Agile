const express = require('express');
const router = express.Router();
const { authenticate, checkSuperAdmin } = require('../middleware/auth');
const superAdminController = require('../controllers/superAdminController');

// Apply authentication and super admin check to all routes
router.use(authenticate, checkSuperAdmin);

// Analytics
router.get('/analytics', superAdminController.getSystemAnalytics);

// Organization Management
router.get('/organizations', superAdminController.getAllOrganizations);
router.get('/organizations/:id', superAdminController.getOrganizationDetails);
router.post('/organizations', superAdminController.createOrganization);
router.put('/organizations/:id', superAdminController.updateOrganization);
router.delete('/organizations/:id', superAdminController.deleteOrganization);

// Admin Management
router.get('/admins', superAdminController.getAllAdmins);
router.post('/create-admin', superAdminController.createAdmin);
router.put('/admins/:id', superAdminController.updateAdmin);
router.delete('/admins/:id', superAdminController.deleteAdmin);
router.post('/assign-admin', superAdminController.assignAdminToOrganization);

module.exports = router;


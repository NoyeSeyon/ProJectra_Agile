const express = require('express');
const { body, validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const Settings = require('../models/Settings');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get current organization (for settings)
router.get('/current', authenticate, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: { organization }
    });
  } catch (error) {
    console.error('Get current organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update current organization
router.put('/current', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('industry').optional().trim().isLength({ max: 100 }),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']),
  body('timezone').optional().trim().isLength({ max: 50 }),
  body('settings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, website, industry, size, timezone, settings } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (settings !== undefined) updateData.settings = settings;

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      updateData,
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get organization details
router.get('/:orgId', authenticate, async (req, res) => {
  try {
    const { orgId } = req.params;

    // Check if user belongs to organization
    if (req.user.organization.toString() !== orgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: { organization }
    });

  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update organization
router.put('/:orgId', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('settings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orgId } = req.params;

    // Check if user belongs to organization
    if (req.user.organization.toString() !== orgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const allowedUpdates = ['name', 'description', 'logo', 'settings'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedOrganization = await Organization.findByIdAndUpdate(
      orgId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization: updatedOrganization }
    });

  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

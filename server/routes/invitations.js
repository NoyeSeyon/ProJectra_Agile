const express = require('express');
const { body, validationResult } = require('express-validator');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Create invitation (Admin only)
router.post('/', authenticate, checkOrganization, authorize('admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'project_manager', 'team_leader', 'member', 'client', 'guest']),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('specialization').optional().trim().isLength({ min: 1, max: 50 }),
  body('message').optional().isLength({ max: 500 })
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

    const { email, role = 'member', firstName, lastName, specialization, message } = req.body;
    const { orgId } = req;

    // Check if user already exists in organization
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      organization: orgId 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists in this organization'
      });
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      organization: orgId,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this email'
      });
    }

    // Create invitation
    const invitation = new Invitation({
      organization: orgId,
      invitedBy: req.user._id,
      email: email.toLowerCase(),
      role,
      metadata: {
        firstName,
        lastName,
        specialization,
        message
      }
    });

    await invitation.save();

    // Populate for response
    await invitation.populate([
      { path: 'organization', select: 'name slug' },
      { path: 'invitedBy', select: 'firstName lastName' }
    ]);

    // Generate invite link
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?invite=${invitation.token}`;

    // Send email invitation
    let emailResult = null;
    try {
      emailResult = await emailService.sendInvitationEmail(invitation, inviteLink);
    } catch (emailError) {
      console.error('Email sending failed, but invitation created:', emailError.message);
      // Don't fail the request if email fails - invitation is still created
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { 
        invitation,
        inviteLink,
        emailSent: emailResult?.success || false,
        emailMode: emailResult?.mode || 'failed'
      }
    });

  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get organization invitations
router.get('/', authenticate, checkOrganization, authorize('admin'), async (req, res) => {
  try {
    const { orgId } = req;
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    let query = { organization: orgId };
    if (status !== 'all') {
      query.status = status;
    }

    const invitations = await Invitation.find(query)
      .populate('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Invitation.countDocuments(query);

    res.json({
      success: true,
      data: {
        invitations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get invitation details by token
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    // Find invitation by token
    let invitation;
    if (email && email !== 'placeholder@example.com') {
      invitation = await Invitation.findValidInvitation(token, email);
    } else {
      // If no email provided, just validate token
      invitation = await Invitation.findOne({
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }).populate([
        { path: 'organization', select: 'name slug code' },
        { path: 'invitedBy', select: 'firstName lastName' }
      ]);
    }

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    res.json({
      success: true,
      data: { invitation }
    });

  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Cancel invitation
router.delete('/:invitationId', authenticate, checkOrganization, authorize('admin'), async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { orgId } = req;

    const invitation = await Invitation.findOne({
      _id: invitationId,
      organization: orgId
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    await invitation.cancel();

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Resend invitation
router.post('/:invitationId/resend', authenticate, checkOrganization, authorize('admin'), async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { orgId } = req;

    const invitation = await Invitation.findOne({
      _id: invitationId,
      organization: orgId
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Populate for email
    await invitation.populate([
      { path: 'organization', select: 'name slug' },
      { path: 'invitedBy', select: 'firstName lastName' }
    ]);

    // Update expiration date
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await invitation.save();

    // Generate invite link
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?invite=${invitation.token}`;

    // Resend email invitation
    let emailResult = null;
    try {
      emailResult = await emailService.sendInvitationEmail(invitation, inviteLink);
    } catch (emailError) {
      console.error('Email resend failed:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Invitation resent successfully',
      data: {
        inviteLink,
        emailSent: emailResult?.success || false,
        emailMode: emailResult?.mode || 'failed'
      }
    });

  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

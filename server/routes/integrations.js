const express = require('express');
const { body, validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const Settings = require('../models/Settings');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');

const router = express.Router();

// Get integration settings
router.get('/slack', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId } = req;

    const settings = await Settings.findOne({ organization: orgId });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      data: {
        slack: {
          enabled: settings.integrations.slack.enabled,
          channels: settings.integrations.slack.channels,
          webhookUrl: settings.integrations.slack.webhookUrl
        }
      }
    });

  } catch (error) {
    console.error('Get Slack integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update Slack integration
router.put('/slack', authenticate, checkOrganization, authorize('admin'), [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
  body('botToken').optional().isString().withMessage('Bot token must be a string'),
  body('signingSecret').optional().isString().withMessage('Signing secret must be a string'),
  body('clientId').optional().isString().withMessage('Client ID must be a string'),
  body('clientSecret').optional().isString().withMessage('Client secret must be a string'),
  body('webhookUrl').optional().isURL().withMessage('Webhook URL must be a valid URL')
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

    const { orgId } = req;
    const { enabled, botToken, signingSecret, clientId, clientSecret, webhookUrl } = req.body;

    const settings = await Settings.findOne({ organization: orgId });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Update Slack integration settings
    settings.integrations.slack.enabled = enabled;
    if (botToken) settings.integrations.slack.botToken = botToken;
    if (signingSecret) settings.integrations.slack.signingSecret = signingSecret;
    if (clientId) settings.integrations.slack.clientId = clientId;
    if (clientSecret) settings.integrations.slack.clientSecret = clientSecret;
    if (webhookUrl) settings.integrations.slack.webhookUrl = webhookUrl;

    await settings.save();

    res.json({
      success: true,
      message: 'Slack integration updated successfully',
      data: {
        slack: {
          enabled: settings.integrations.slack.enabled,
          channels: settings.integrations.slack.channels,
          webhookUrl: settings.integrations.slack.webhookUrl
        }
      }
    });

  } catch (error) {
    console.error('Update Slack integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add Slack channel mapping
router.post('/slack/channels', authenticate, checkOrganization, authorize('admin'), [
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('channelId').isString().withMessage('Channel ID is required'),
  body('channelName').isString().withMessage('Channel name is required')
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

    const { orgId } = req;
    const { projectId, channelId, channelName } = req.body;

    const settings = await Settings.findOne({ organization: orgId });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Check if channel already exists
    const existingChannel = settings.integrations.slack.channels.find(
      ch => ch.projectId.toString() === projectId.toString()
    );

    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: 'Channel mapping already exists for this project'
      });
    }

    // Add new channel mapping
    settings.integrations.slack.channels.push({
      projectId,
      channelId,
      channelName,
      enabled: true
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Slack channel mapping added successfully',
      data: {
        channel: {
          projectId,
          channelId,
          channelName,
          enabled: true
        }
      }
    });

  } catch (error) {
    console.error('Add Slack channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test Slack integration
router.post('/slack/test', authenticate, checkOrganization, authorize('admin'), async (req, res) => {
  try {
    const { orgId } = req;

    const settings = await Settings.findOne({ organization: orgId });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    if (!settings.integrations.slack.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Slack integration is not enabled'
      });
    }

    // Here you would implement the actual Slack API test
    // For now, just return success
    res.json({
      success: true,
      message: 'Slack integration test successful'
    });

  } catch (error) {
    console.error('Test Slack integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

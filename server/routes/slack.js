const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Slack OAuth callback
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://slack.com/api/oauth.v2.access', {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.SLACK_REDIRECT_URI
    });

    if (!tokenResponse.data.ok) {
      throw new Error(tokenResponse.data.error);
    }

    const { access_token, team, authed_user } = tokenResponse.data;

    // Get team information
    const teamResponse = await axios.get('https://slack.com/api/team.info', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Store Slack integration data
    const slackIntegration = {
      teamId: team.id,
      teamName: team.name,
      accessToken: access_token,
      userId: authed_user.id,
      scopes: authed_user.scopes,
      installedAt: new Date()
    };

    // TODO: Save to database
    // await SlackIntegration.create(slackIntegration);

    res.json({
      success: true,
      message: 'Slack integration successful',
      data: {
        team: teamResponse.data.team,
        integration: slackIntegration
      }
    });

  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Slack integration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Send notification to Slack
router.post('/notify', authenticate, [
  body('channel').trim().isLength({ min: 1 }).withMessage('Channel is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error']).withMessage('Invalid notification type')
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

    const { channel, message, type = 'info', blocks } = req.body;
    const orgId = req.user.organization;

    // TODO: Get Slack access token for organization
    // const slackIntegration = await SlackIntegration.findOne({ organization: orgId });
    // if (!slackIntegration) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Slack integration not found'
    //   });
    // }

    // For demo purposes, we'll simulate the notification
    const notification = {
      channel,
      text: message,
      type,
      blocks: blocks || [],
      timestamp: new Date().toISOString()
    };

    // TODO: Send actual Slack notification
    // await sendSlackNotification(slackIntegration.accessToken, notification);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });

  } catch (error) {
    console.error('Slack notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Handle Slack slash commands
router.post('/commands', async (req, res) => {
  try {
    const { command, text, user_id, channel_id, team_id } = req.body;

    let response = {};

    switch (command) {
      case '/projectra':
        response = await handleProjectraCommand(text, user_id, channel_id, team_id);
        break;
      case '/tasks':
        response = await handleTasksCommand(text, user_id, channel_id, team_id);
        break;
      case '/projects':
        response = await handleProjectsCommand(text, user_id, channel_id, team_id);
        break;
      default:
        response = {
          text: 'Unknown command. Available commands: /projectra, /tasks, /projects'
        };
    }

    res.json(response);

  } catch (error) {
    console.error('Slack command error:', error);
    res.json({
      text: 'Sorry, there was an error processing your command.',
      response_type: 'ephemeral'
    });
  }
});

// Handle Slack interactive components
router.post('/interactive', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const { type, user, actions, callback_id } = payload;

    let response = {};

    switch (type) {
      case 'block_actions':
        response = await handleBlockActions(payload);
        break;
      case 'shortcut':
        response = await handleShortcut(payload);
        break;
      default:
        response = { text: 'Unknown interaction type' };
    }

    res.json(response);

  } catch (error) {
    console.error('Slack interactive error:', error);
    res.json({
      text: 'Sorry, there was an error processing your interaction.',
      response_type: 'ephemeral'
    });
  }
});

// Get Slack integration status
router.get('/status', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;

    // TODO: Get Slack integration status
    // const slackIntegration = await SlackIntegration.findOne({ organization: orgId });

    res.json({
      success: true,
      data: {
        connected: false, // slackIntegration ? true : false,
        teamName: null, // slackIntegration?.teamName,
        connectedAt: null // slackIntegration?.installedAt
      }
    });

  } catch (error) {
    console.error('Get Slack status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Disconnect Slack integration
router.delete('/disconnect', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;

    // TODO: Remove Slack integration
    // await SlackIntegration.findOneAndDelete({ organization: orgId });

    res.json({
      success: true,
      message: 'Slack integration disconnected successfully'
    });

  } catch (error) {
    console.error('Disconnect Slack error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions for Slack commands
async function handleProjectraCommand(text, userId, channelId, teamId) {
  const [action, ...params] = text.split(' ');
  
  switch (action) {
    case 'help':
      return {
        text: 'Projectra Bot Commands:',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Available Commands:*\n• `/projectra help` - Show this help\n• `/projectra status` - Show project status\n• `/tasks list` - List your tasks\n• `/projects list` - List your projects'
            }
          }
        ]
      };
    
    case 'status':
      return {
        text: 'Projectra Status',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Projectra Status:*\n• Active Projects: 3\n• Pending Tasks: 5\n• Team Members: 8\n• This Week Progress: 75%'
            }
          }
        ]
      };
    
    default:
      return {
        text: 'Welcome to Projectra! Use `/projectra help` to see available commands.'
      };
  }
}

async function handleTasksCommand(text, userId, channelId, teamId) {
  const [action, ...params] = text.split(' ');
  
  switch (action) {
    case 'list':
      return {
        text: 'Your Tasks',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Your Tasks:*\n• Task 1 - In Progress\n• Task 2 - To Do\n• Task 3 - Review'
            }
          }
        ]
      };
    
    default:
      return {
        text: 'Tasks command. Use `/tasks list` to see your tasks.'
      };
  }
}

async function handleProjectsCommand(text, userId, channelId, teamId) {
  const [action, ...params] = text.split(' ');
  
  switch (action) {
    case 'list':
      return {
        text: 'Your Projects',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Your Projects:*\n• Project Alpha - 80% Complete\n• Project Beta - 45% Complete\n• Project Gamma - 20% Complete'
            }
          }
        ]
      };
    
    default:
      return {
        text: 'Projects command. Use `/projects list` to see your projects.'
      };
  }
}

async function handleBlockActions(payload) {
  const { actions, user } = payload;
  const action = actions[0];
  
  switch (action.action_id) {
    case 'view_tasks':
      return {
        text: 'Tasks opened in Projectra',
        response_type: 'ephemeral'
      };
    
    case 'view_projects':
      return {
        text: 'Projects opened in Projectra',
        response_type: 'ephemeral'
      };
    
    default:
      return {
        text: 'Action processed',
        response_type: 'ephemeral'
      };
  }
}

async function handleShortcut(payload) {
  const { callback_id, user } = payload;
  
  switch (callback_id) {
    case 'create_task':
      return {
        text: 'Create Task',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Create a new task in Projectra'
            }
          }
        ]
      };
    
    case 'view_dashboard':
      return {
        text: 'Dashboard',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Opening Projectra Dashboard...'
            }
          }
        ]
      };
    
    default:
      return {
        text: 'Shortcut processed'
      };
  }
}

// Helper function to send Slack notifications
async function sendSlackNotification(accessToken, notification) {
  try {
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: notification.channel,
      text: notification.text,
      blocks: notification.blocks
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Slack API error:', error);
    throw error;
  }
}

module.exports = router;


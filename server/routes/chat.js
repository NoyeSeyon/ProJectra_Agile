const express = require('express');
const { body, validationResult } = require('express-validator');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const Project = require('../models/Project');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');

const router = express.Router();

// Get channels for organization
router.get('/channels', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId } = req;
    const { projectId, type } = req.query;

    let query = {
      organization: orgId,
      isArchived: false,
      members: req.user._id
    };

    if (projectId) {
      query.project = projectId;
    }

    if (type) {
      query.type = type;
    }

    const channels = await Channel.find(query)
      .populate('members', 'firstName lastName avatar')
      .populate('lastMessage')
      .populate('project', 'name')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: { channels }
    });

  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new channel
router.post('/channels', authenticate, checkOrganization, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Channel name is required'),
  body('description').optional().isLength({ max: 200 }),
  body('type').isIn(['project', 'dm', 'group']).withMessage('Invalid channel type'),
  body('projectId').optional().isMongoId().withMessage('Valid project ID is required'),
  body('memberIds').isArray().withMessage('Member IDs must be an array')
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

    const { name, description, type, projectId, memberIds } = req.body;
    const { orgId } = req;

    // For project channels, verify project exists and user can access
    if (type === 'project' && projectId) {
      const project = await Project.findOne({
        _id: projectId,
        organization: orgId
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (!project.canUserAccess(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }
    }

    // Add creator to members
    const members = [...new Set([req.user._id, ...memberIds])];

    const channel = new Channel({
      name,
      description,
      organization: orgId,
      project: projectId || null,
      type,
      members,
      createdBy: req.user._id
    });

    await channel.save();

    await channel.populate([
      { path: 'members', select: 'firstName lastName avatar' },
      { path: 'project', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: { channel }
    });

  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get messages for a channel
router.get('/channels/:channelId/messages', authenticate, checkOrganization, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { orgId } = req;
    const { page = 1, limit = 50, cursor } = req.query;

    const channel = await Channel.findOne({
      _id: channelId,
      organization: orgId,
      isArchived: false
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is member
    if (!channel.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this channel'
      });
    }

    let query = {
      organization: orgId,
      channel: channelId,
      isDeleted: false
    };

    // Use cursor for pagination
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName avatar')
      .populate('mentions', 'firstName lastName')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Update channel last activity
    await channel.updateLastActivity();

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        hasMore: messages.length === parseInt(limit),
        nextCursor: messages.length > 0 ? messages[0].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Send message
router.post('/channels/:channelId/messages', authenticate, checkOrganization, [
  body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Message text is required'),
  body('type').optional().isIn(['text', 'file', 'image', 'system', 'ai']),
  body('replyTo').optional().isMongoId().withMessage('Valid reply message ID is required')
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

    const { channelId } = req.params;
    const { text, type = 'text', replyTo, attachments = [] } = req.body;
    const { orgId } = req;

    const channel = await Channel.findOne({
      _id: channelId,
      organization: orgId,
      isArchived: false
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is member
    if (!channel.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this channel'
      });
    }

    // Extract mentions from text
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      // This would need to be implemented with user lookup
      // For now, just store the pattern
      mentions.push(match[1]);
    }

    const message = new Message({
      text,
      organization: orgId,
      channel: channelId,
      sender: req.user._id,
      type,
      attachments,
      replyTo: replyTo || null
    });

    await message.save();

    // Update channel last message and activity
    channel.lastMessage = message._id;
    await channel.updateLastActivity();

    // Populate message for response
    await message.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'mentions', select: 'firstName lastName' },
      { path: 'replyTo' }
    ]);

    // Emit socket event for real-time updates
    req.app.get('io').to(`org:${orgId}:channel:${channelId}`).emit('chat:message', {
      message,
      channelId,
      orgId
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Edit message
router.put('/messages/:messageId', authenticate, checkOrganization, [
  body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Message text is required')
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

    const { messageId } = req.params;
    const { text } = req.body;
    const { orgId } = req;

    const message = await Message.findOne({
      _id: messageId,
      organization: orgId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    await message.edit(text);

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete message
router.delete('/messages/:messageId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { orgId } = req;

    const message = await Message.findOne({
      _id: messageId,
      organization: orgId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or has admin role
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', authenticate, checkOrganization, [
  body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji is required')
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

    const { messageId } = req.params;
    const { emoji } = req.body;
    const { orgId } = req;

    const message = await Message.findOne({
      _id: messageId,
      organization: orgId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(emoji, req.user._id);

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Remove reaction from message
router.delete('/messages/:messageId/reactions/:emoji', authenticate, checkOrganization, async (req, res) => {
  try {
    const { messageId, emoji } = req.params;
    const { orgId } = req;

    const message = await Message.findOne({
      _id: messageId,
      organization: orgId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(emoji, req.user._id);

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

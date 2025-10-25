const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, priority } = req.query;
    const orgId = req.user.organization;
    const userId = req.user._id;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      organization: orgId,
      $or: [
        { recipient: userId },
        { recipient: null }, // Broadcast notifications
        { 'recipients': userId }
      ]
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'firstName lastName avatar')
        .populate('relatedResource', 'name title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get unread notifications count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      organization: orgId,
      $or: [
        { recipient: userId },
        { recipient: null },
        { 'recipients': userId }
      ],
      status: 'unread'
    });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      organization: req.user.organization,
      $or: [
        { recipient: req.user._id },
        { recipient: null },
        { 'recipients': req.user._id }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const userId = req.user._id;

    await Notification.updateMany({
      organization: orgId,
      $or: [
        { recipient: userId },
        { recipient: null },
        { 'recipients': userId }
      ],
      status: 'unread'
    }, {
      status: 'read',
      readAt: new Date()
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create notification
router.post('/', authenticate, [
  body('type').isIn(['info', 'success', 'warning', 'error', 'system']).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('recipient').optional().isMongoId().withMessage('Invalid recipient ID'),
  body('recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('relatedResource').optional().isMongoId().withMessage('Invalid related resource ID'),
  body('actionUrl').optional().isURL().withMessage('Invalid action URL')
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

    const {
      type,
      title,
      message,
      priority = 'medium',
      recipient,
      recipients,
      relatedResource,
      actionUrl,
      metadata
    } = req.body;

    const orgId = req.user.organization;
    const senderId = req.user._id;

    const notification = new Notification({
      type,
      title,
      message,
      priority,
      sender: senderId,
      recipient: recipient || null,
      recipients: recipients || [],
      organization: orgId,
      relatedResource: relatedResource || null,
      actionUrl: actionUrl || null,
      metadata: metadata || {},
      status: 'unread'
    });

    await notification.save();
    await notification.populate('sender', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, [
  body('email').optional().isBoolean().withMessage('Email must be a boolean'),
  body('push').optional().isBoolean().withMessage('Push must be a boolean'),
  body('slack').optional().isBoolean().withMessage('Slack must be a boolean'),
  body('types').optional().isObject().withMessage('Types must be an object')
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

    const { email, push, slack, types } = req.body;
    const userId = req.user._id;

    // TODO: Update user notification preferences
    // const user = await User.findById(userId);
    // user.notificationPreferences = {
    //   email: email !== undefined ? email : user.notificationPreferences?.email || true,
    //   push: push !== undefined ? push : user.notificationPreferences?.push || true,
    //   slack: slack !== undefined ? slack : user.notificationPreferences?.slack || false,
    //   types: types || user.notificationPreferences?.types || {}
    // };
    // await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
      $or: [
        { recipient: req.user._id },
        { sender: req.user._id }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get notification statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      {
        $match: {
          organization: orgId,
          $or: [
            { recipient: userId },
            { recipient: null },
            { 'recipients': userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] }
          },
          byType: {
            $push: {
              type: '$type',
              status: '$status'
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          unread: 0,
          byType: {}
        }
      });
    }

    const result = stats[0];
    const byType = result.byType.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = { total: 0, unread: 0 };
      }
      acc[item.type].total += 1;
      if (item.status === 'unread') {
        acc[item.type].unread += 1;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: result.total,
        unread: result.unread,
        byType
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;


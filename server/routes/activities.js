const express = require('express');
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get activities feed
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      action, 
      severity, 
      visibility = 'organization',
      resourceType,
      resourceId,
      actor,
      startDate,
      endDate,
      tags
    } = req.query;

    const orgId = req.user.organization;
    const skip = (page - 1) * limit;

    // Build query
    const query = { organization: orgId };

    if (type) query.type = type;
    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (visibility) query.visibility = { $in: [visibility, 'public'] };
    if (resourceType) query['resource.type'] = resourceType;
    if (resourceId) query['resource.id'] = resourceId;
    if (actor) query.actor = actor;
    if (tags) query.tags = { $in: tags.split(',') };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('actor', 'firstName lastName avatar role')
        .populate('organization', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Activity.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get activity by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      organization: req.user.organization
    })
    .populate('actor', 'firstName lastName avatar role')
    .populate('organization', 'name');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: { activity }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark activity as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Activity marked as read'
    });

  } catch (error) {
    console.error('Mark activity as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark multiple activities as read
router.put('/read-multiple', authenticate, [
  body('activityIds').isArray().withMessage('Activity IDs must be an array'),
  body('activityIds.*').isMongoId().withMessage('Invalid activity ID')
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

    const { activityIds } = req.body;
    const orgId = req.user.organization;
    const userId = req.user._id;

    const activities = await Activity.find({
      _id: { $in: activityIds },
      organization: orgId
    });

    const updatePromises = activities.map(activity => 
      activity.markAsRead(userId)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${activities.length} activities marked as read`
    });

  } catch (error) {
    console.error('Mark multiple activities as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get unread activities count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const userId = req.user._id;

    const count = await Activity.countDocuments({
      organization: orgId,
      visibility: { $in: ['organization', 'public'] },
      readBy: { $not: { $elemMatch: { user: userId } } }
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

// Get activity statistics
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { organization: orgId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const [
      totalActivities,
      activitiesByType,
      activitiesBySeverity,
      recentActivities
    ] = await Promise.all([
      Activity.countDocuments(query),
      Activity.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Activity.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Activity.find(query)
        .populate('actor', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        totalActivities,
        activitiesByType,
        activitiesBySeverity,
        recentActivities
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add tag to activity
router.put('/:id/tags', authenticate, [
  body('tag').trim().isLength({ min: 1, max: 50 }).withMessage('Tag is required and must be 1-50 characters')
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

    const { tag } = req.body;
    const activity = await Activity.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.addTag(tag);

    res.json({
      success: true,
      message: 'Tag added successfully'
    });

  } catch (error) {
    console.error('Add tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Remove tag from activity
router.delete('/:id/tags/:tag', authenticate, async (req, res) => {
  try {
    const { tag } = req.params;
    const activity = await Activity.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.removeTag(tag);

    res.json({
      success: true,
      message: 'Tag removed successfully'
    });

  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete activity (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user has permission to delete activities
    if (!['admin', 'projectra_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;


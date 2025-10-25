const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Check if user belongs to organization
const checkOrganization = (req, res, next) => {
  // Get orgId from user's organization (for dashboard routes)
  const orgId = req.params.orgId || req.body.organization || req.query.orgId || req.user.organization;
  
  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required.' 
    });
  }

  // If user has an organization, verify access
  if (req.user.organization) {
    if (req.user.organization.toString() !== orgId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not belong to this organization.' 
      });
    }
  }

  req.orgId = orgId;
  next();
};

// Check user role permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Check specific permission
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.hasPermission(resource, action)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required permission: ${action} ${resource}` 
      });
    }

    next();
  };
};

// Optional authentication (for public routes)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient role.' 
      });
    }

    next();
  };
};

// Check if user is Super Admin
const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super Admin access required.' 
    });
  }

  next();
};

// Check if user is Admin
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required.' 
    });
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would integrate with your rate limiting strategy
  // For now, just pass through
  next();
};

module.exports = {
  authenticate,
  checkOrganization,
  authorize,
  checkRole,
  checkPermission,
  optionalAuth,
  checkSuperAdmin,
  checkAdmin,
  sensitiveOperationLimit
};

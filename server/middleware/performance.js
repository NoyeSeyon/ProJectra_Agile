const performance = require('perf_hooks');

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = performance.performance.now();
  
  // Store start time in request
  req.startTime = start;
  
  // Override end method to measure response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const end = performance.performance.now();
    const duration = end - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    res.setHeader('X-Request-ID', req.id || 'unknown');
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Memory usage monitoring
const memoryMiddleware = (req, res, next) => {
  const memUsage = process.memoryUsage();
  
  // Log memory usage for debugging
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    console.warn(`High memory usage detected: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }
  
  // Add memory headers
  res.setHeader('X-Memory-Usage', `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  
  next();
};

// Database query performance monitoring
const dbPerformanceMiddleware = (req, res, next) => {
  const start = performance.performance.now();
  
  // Override json method to measure DB operations
  const originalJson = res.json;
  res.json = function(data) {
    const end = performance.performance.now();
    const duration = end - start;
    
    // Log slow database operations (> 500ms)
    if (duration > 500) {
      console.warn(`Slow database operation: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    // Add database performance headers
    res.setHeader('X-DB-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  next();
};

// Request rate limiting
const rateLimitMiddleware = (windowMs = 60000, maxRequests = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const clientId = req.ip || req.connection.remoteAddress;
    
    // Clean up old requests
    if (requests.has(clientId)) {
      const clientRequests = requests.get(clientId);
      const recentRequests = clientRequests.filter(time => time > windowStart);
      requests.set(clientId, recentRequests);
    } else {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    
    // Check if client has exceeded rate limit
    if (clientRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    clientRequests.push(now);
    requests.set(clientId, clientRequests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// Compression middleware
const compressionMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Check if client accepts gzip
    const acceptEncoding = req.headers['accept-encoding'];
    if (acceptEncoding && acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
    }
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  next();
};

// Connection pooling monitoring
const connectionPoolMiddleware = (req, res, next) => {
  // Monitor database connections
  const mongoose = require('mongoose');
  const connection = mongoose.connection;
  
  // Add connection pool headers
  res.setHeader('X-DB-Connections', connection.readyState);
  res.setHeader('X-DB-Host', connection.host);
  res.setHeader('X-DB-Port', connection.port);
  
  next();
};

// Error tracking middleware
const errorTrackingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Track error responses
    if (data.success === false) {
      console.error(`Error response: ${req.method} ${req.url} - ${data.message}`);
      
      // Add error tracking headers
      res.setHeader('X-Error-Tracked', 'true');
    }
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  performanceMiddleware,
  memoryMiddleware,
  dbPerformanceMiddleware,
  rateLimitMiddleware,
  compressionMiddleware,
  connectionPoolMiddleware,
  errorTrackingMiddleware
};


const NodeCache = require('node-cache');

// Create cache instance with default TTL of 1 hour
const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hour
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects for better performance
});

// Cache middleware for GET requests
const cacheMiddleware = (ttl = 3600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from request
    const cacheKey = generateCacheKey(req);
    
    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data) {
      // Cache the response data
      cache.set(cacheKey, data, ttl);
      console.log(`Cached data for key: ${cacheKey} with TTL: ${ttl}`);
      
      // Call original json method
      originalJson.call(this, data);
    };

    next();
  };
};

// Generate cache key from request
const generateCacheKey = (req) => {
  const { url, query, user } = req;
  const orgId = user?.organization || 'anonymous';
  const userId = user?._id || 'anonymous';
  
  // Create a unique key based on URL, query params, and user context
  const key = `${orgId}:${userId}:${url}:${JSON.stringify(query)}`;
  return key;
};

// Clear cache for specific patterns
const clearCache = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
      console.log(`Cleared cache key: ${key}`);
    }
  });
};

// Clear cache for organization
const clearOrgCache = (orgId) => {
  clearCache(`^${orgId}:`);
};

// Clear cache for user
const clearUserCache = (userId) => {
  clearCache(`:${userId}:`);
};

// Clear cache for specific resource
const clearResourceCache = (orgId, resourceType, resourceId) => {
  clearCache(`^${orgId}:.*${resourceType}:${resourceId}`);
};

// Cache statistics
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

// Warm up cache with frequently accessed data
const warmupCache = async (orgId) => {
  try {
    // Cache dashboard data
    const dashboardKey = `${orgId}:dashboard:stats`;
    // This would be populated by the dashboard route
    
    // Cache organization settings
    const orgKey = `${orgId}:organization:settings`;
    // This would be populated by the organization route
    
    console.log(`Cache warmed up for organization: ${orgId}`);
  } catch (error) {
    console.error('Cache warmup error:', error);
  }
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  clearOrgCache,
  clearUserCache,
  clearResourceCache,
  getCacheStats,
  warmupCache
};


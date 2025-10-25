const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Test utilities
const testUtils = {
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const Organization = require('../models/Organization');
    
    // Create test organization
    const org = new Organization({
      name: 'Test Organization',
      slug: 'test-org',
      description: 'Test organization for testing'
    });
    await org.save();
    
    // Create test user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      organization: org._id,
      role: 'admin',
      ...userData
    });
    await user.save();
    
    return { user, organization: org };
  },
  
  createTestProject: async (orgId, projectData = {}) => {
    const Project = require('../models/Project');
    
    const project = new Project({
      name: 'Test Project',
      description: 'Test project description',
      organization: orgId,
      status: 'active',
      priority: 'medium',
      ...projectData
    });
    await project.save();
    
    return project;
  },
  
  createTestTask: async (orgId, projectId, taskData = {}) => {
    const Task = require('../models/Task');
    
    const task = new Task({
      title: 'Test Task',
      description: 'Test task description',
      organization: orgId,
      project: projectId,
      status: 'to_do',
      priority: 'medium',
      ...taskData
    });
    await task.save();
    
    return task;
  },
  
  generateAuthToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: user._id, organization: user.organization },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }
};

module.exports = testUtils;


const request = require('supertest');
const app = require('../index');
const testUtils = require('./setup');

describe('Project Routes', () => {
  let testUser, testOrg, authToken, testProject;

  beforeEach(async () => {
    const { user, organization } = await testUtils.createTestUser();
    testUser = user;
    testOrg = organization;
    authToken = testUtils.generateAuthToken(user);
    
    testProject = await testUtils.createTestProject(organization._id);
  });

  describe('GET /api/projects', () => {
    it('should get all projects for organization', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeInstanceOf(Array);
      expect(response.body.data.projects.length).toBeGreaterThan(0);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeInstanceOf(Array);
    });

    it('should search projects by name', async () => {
      const response = await request(app)
        .get('/api/projects?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'New Test Project',
        description: 'New test project description',
        status: 'active',
        priority: 'high',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.name).toBe(projectData.name);
      expect(response.body.data.project.description).toBe(projectData.description);
    });

    it('should return error for missing required fields', async () => {
      const projectData = {
        description: 'Project without name'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid status', async () => {
      const projectData = {
        name: 'Test Project',
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project._id).toBe(testProject._id.toString());
    });

    it('should return error for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project successfully', async () => {
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.name).toBe(updateData.name);
      expect(response.body.data.project.description).toBe(updateData.description);
      expect(response.body.data.project.status).toBe(updateData.status);
    });

    it('should return error for invalid update data', async () => {
      const updateData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .put(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return error for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});


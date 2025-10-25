const request = require('supertest');
const app = require('../index');
const testUtils = require('./setup');

describe('Task Routes', () => {
  let testUser, testOrg, authToken, testProject, testTask;

  beforeEach(async () => {
    const { user, organization } = await testUtils.createTestUser();
    testUser = user;
    testOrg = organization;
    authToken = testUtils.generateAuthToken(user);
    
    testProject = await testUtils.createTestProject(organization._id);
    testTask = await testUtils.createTestTask(organization._id, testProject._id);
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for organization', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeInstanceOf(Array);
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=to_do')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeInstanceOf(Array);
    });

    it('should filter tasks by project', async () => {
      const response = await request(app)
        .get(`/api/tasks?project=${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeInstanceOf(Array);
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/api/tasks?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Test Task',
        description: 'New test task description',
        project: testProject._id,
        status: 'to_do',
        priority: 'high',
        type: 'task',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.description).toBe(taskData.description);
      expect(response.body.data.task.project).toBe(taskData.project);
    });

    it('should return error for missing required fields', async () => {
      const taskData = {
        description: 'Task without title'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid status', async () => {
      const taskData = {
        title: 'Test Task',
        project: testProject._id,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task._id).toBe(testTask._id.toString());
    });

    it('should return error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'in_progress',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.description).toBe(updateData.description);
      expect(response.body.data.task.status).toBe(updateData.status);
      expect(response.body.data.task.priority).toBe(updateData.priority);
    });

    it('should return error for invalid update data', async () => {
      const updateData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id/status', () => {
    it('should update task status successfully', async () => {
      const statusData = {
        status: 'completed',
        progress: 100
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.status).toBe(statusData.status);
      expect(response.body.data.task.progress).toBe(statusData.progress);
    });

    it('should return error for invalid status', async () => {
      const statusData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});


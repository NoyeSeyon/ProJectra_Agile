# Projectra Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Documentation](#api-documentation)
5. [Authentication & Security](#authentication--security)
6. [Real-time Features](#real-time-features)
7. [Performance Optimization](#performance-optimization)
8. [Deployment Guide](#deployment-guide)
9. [Development Setup](#development-setup)
10. [Testing Strategy](#testing-strategy)

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │  MongoDB Atlas  │
│                 │◄──►│                 │◄──►│                 │
│  - Components   │    │  - REST APIs    │    │  - Collections  │
│  - State Mgmt   │    │  - Socket.io    │    │  - Indexes      │
│  - Routing      │    │  - Middleware   │    │  - Transactions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   File Storage  │    │   AI Services   │
│   Integrations  │    │                 │    │                 │
│  - Slack API    │    │  - Local Files  │    │  - OpenAI API   │
│  - GitHub API   │    │  - Cloud Ready  │    │  - Context AI   │
│  - Email SMTP   │    │  - CDN Support  │    │  - Analytics    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Chart components
│   │   └── layout/         # Layout components
│   ├── pages/              # Route components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── styles/             # CSS styles
│
server/
├── models/                  # Mongoose schemas
├── routes/                  # API routes
├── middleware/              # Custom middleware
├── controllers/             # Route handlers
├── services/                # Business logic
├── utils/                   # Server utilities
└── tests/                   # Test files
```

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **ApexCharts**: Interactive charts and graphs
- **@dnd-kit**: Drag and drop functionality
- **Socket.io-client**: Real-time communication
- **Axios**: HTTP client for API calls
- **React Query**: Data fetching and caching
- **Framer Motion**: Animation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.io**: Real-time bidirectional communication
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Express-validator**: Input validation
- **Cors**: Cross-origin resource sharing

### Database
- **MongoDB Atlas**: Cloud database service
- **Mongoose ODM**: Object document mapping
- **Indexes**: Optimized query performance
- **Transactions**: Data consistency
- **Aggregation**: Complex data processing

### External Services
- **OpenAI API**: AI assistant integration
- **Slack API**: Team communication
- **Email Service**: SMTP for notifications
- **File Storage**: Local and cloud options
- **CDN**: Content delivery network

## Database Design

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum),
  organization: ObjectId,
  specialization: String,
  skills: [{
    name: String,
    level: String
  }],
  capacity: {
    maxProjects: Number,
    currentProjects: Number,
    weeklyHours: Number
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Organizations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  website: String,
  industry: String,
  size: String,
  timezone: String,
  settings: {
    features: Object,
    integrations: Object,
    security: Object
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Projects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  organization: ObjectId,
  projectManager: ObjectId,
  teamLeader: ObjectId,
  client: ObjectId,
  members: [ObjectId],
  status: String (enum),
  priority: String (enum),
  progress: Number,
  budget: {
    amount: Number,
    spent: Number,
    currency: String
  },
  projectWeight: {
    estimatedHours: Number,
    priority: String,
    complexity: Number,
    teamSize: Number
  },
  agileConfig: {
    methodology: String,
    sprintDuration: Number,
    velocity: Number
  },
  startDate: Date,
  endDate: Date,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId,
  organization: ObjectId,
  assignedTo: ObjectId,
  createdBy: ObjectId,
  parentTask: ObjectId,
  subtasks: [ObjectId],
  type: String (enum),
  status: String (enum),
  priority: String (enum),
  progress: Number,
  storyPoints: Number,
  estimatedHours: Number,
  hoursLogged: Number,
  dueDate: Date,
  completedAt: Date,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes for Performance
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ organization: 1, role: 1 })
db.users.createIndex({ organization: 1, isActive: 1 })

// Projects
db.projects.createIndex({ organization: 1, status: 1 })
db.projects.createIndex({ projectManager: 1 })
db.projects.createIndex({ members: 1 })

// Tasks
db.tasks.createIndex({ project: 1, status: 1 })
db.tasks.createIndex({ assignedTo: 1, status: 1 })
db.tasks.createIndex({ organization: 1, isArchived: 1 })

// Activities
db.activities.createIndex({ organization: 1, createdAt: -1 })
db.activities.createIndex({ actor: 1, createdAt: -1 })
```

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Project Endpoints
```
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/projects/:id          # Get project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
GET    /api/projects/:id/tasks    # Get project tasks
POST   /api/projects/:id/members  # Add member
DELETE /api/projects/:id/members/:memberId  # Remove member
```

### Task Endpoints
```
GET    /api/tasks                 # List tasks
POST   /api/tasks                 # Create task
GET    /api/tasks/:id             # Get task
PUT    /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task
POST   /api/tasks/:id/subtasks    # Create subtask
PUT    /api/tasks/:id/status      # Update status
POST   /api/tasks/:id/time        # Log time
```

### Analytics Endpoints
```
GET /api/analytics/dashboard      # Dashboard data
GET /api/analytics/projects       # Project analytics
GET /api/analytics/team           # Team analytics
GET /api/analytics/budget         # Budget analytics
GET /api/analytics/performance    # Performance metrics
```

### Real-time Endpoints
```
WebSocket /socket.io              # Socket.io connection
Events:
  - join-org                      # Join organization room
  - join-project                  # Join project room
  - card:moved                    # Kanban card moved
  - task:updated                  # Task updated
  - chat:message                  # Chat message
  - notification:send             # Send notification
```

## Authentication & Security

### JWT Authentication
```javascript
// Token structure
{
  id: user._id,
  email: user.email,
  organization: user.organization,
  role: user.role,
  iat: issued_at,
  exp: expiration_time
}
```

### Password Security
```javascript
// Password hashing with bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password validation
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Role-Based Access Control
```javascript
// Middleware for role checking
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

### Data Validation
```javascript
// Input validation with express-validator
const validateProject = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().isLength({ max: 500 }),
  body('budget.amount').isNumeric().isFloat({ min: 0 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
];
```

## Real-time Features

### Socket.io Implementation
```javascript
// Server-side socket handling
io.on('connection', (socket) => {
  // Authentication middleware
  socket.use((packet, next) => {
    const token = socket.handshake.auth.token;
    // Verify JWT token
    next();
  });

  // Join organization room
  socket.on('join-org', (orgId) => {
    socket.join(`org:${orgId}`);
  });

  // Handle real-time updates
  socket.on('task:updated', (data) => {
    socket.to(`org:${data.orgId}`).emit('task:updated', data);
  });
});
```

### Client-side Socket Integration
```javascript
// React context for socket management
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
```

## Performance Optimization

### Frontend Optimizations
```javascript
// React.memo for component memoization
const TaskCard = React.memo(({ task, onUpdate }) => {
  // Component logic
});

// useMemo for expensive calculations
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === filter);
}, [tasks, filter]);

// useCallback for stable function references
const handleTaskUpdate = useCallback((taskId, updates) => {
  updateTask(taskId, updates);
}, [updateTask]);

// Lazy loading for route components
const Analytics = lazy(() => import('./pages/Analytics'));
```

### Backend Optimizations
```javascript
// Database query optimization
const getProjects = async (orgId, filters) => {
  const query = { organization: orgId };
  
  if (filters.status) query.status = filters.status;
  if (filters.manager) query.projectManager = filters.manager;

  return await Project.find(query)
    .populate('projectManager', 'firstName lastName')
    .populate('members', 'firstName lastName')
    .lean() // Return plain objects for better performance
    .limit(20);
};

// Caching with Redis
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const getCachedData = async (key) => {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFromDatabase();
  await cache.setex(key, 300, JSON.stringify(data)); // 5 minutes
  return data;
};
```

### Database Optimizations
```javascript
// Aggregation pipelines for complex queries
const getProjectAnalytics = async (orgId) => {
  return await Project.aggregate([
    { $match: { organization: ObjectId(orgId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

// Index optimization
db.projects.createIndex({ 
  organization: 1, 
  status: 1, 
  createdAt: -1 
});
```

## Deployment Guide

### Environment Variables
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb+srv://...

# Client Configuration
REACT_APP_SERVER_URL=https://api.projectra.com
REACT_APP_SOCKET_URL=https://api.projectra.com

# External Services
OPENAI_API_KEY=your_openai_key
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Production Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/projectra.git
cd projectra

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/index.js",
    "client": "react-scripts start",
    "build": "npm run build:client && npm run build:server",
    "build:client": "react-scripts build",
    "build:server": "echo 'Server build complete'",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .js,.jsx",
    "lint:fix": "eslint . --ext .js,.jsx --fix"
  }
}
```

## Testing Strategy

### Unit Tests
```javascript
// Example test for user model
describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      organization: new ObjectId()
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
  });
});
```

### Integration Tests
```javascript
// Example API test
describe('Project API', () => {
  it('should create a new project', async () => {
    const projectData = {
      name: 'Test Project',
      description: 'Test Description',
      budget: { amount: 10000 }
    };

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(projectData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.project.name).toBe(projectData.name);
  });
});
```

### End-to-End Tests
```javascript
// Example E2E test with Cypress
describe('Project Management', () => {
  it('should create and manage a project', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('admin@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=login]').click();

    cy.visit('/projects');
    cy.get('[data-cy=create-project]').click();
    cy.get('[data-cy=project-name]').type('New Project');
    cy.get('[data-cy=save-project]').click();

    cy.get('[data-cy=project-list]').should('contain', 'New Project');
  });
});
```

### Performance Testing
```javascript
// Load testing with Artillery
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    flow:
      - post:
          url: "/api/projects"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            name: "Load Test Project"
```

---

For additional technical support, contact the development team at dev@projectra.com or visit our technical documentation at docs.projectra.com.

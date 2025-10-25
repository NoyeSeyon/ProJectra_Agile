const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
console.log('🔧 Loading environment variables...');
require('dotenv').config({ path: './config.env' });
console.log('✅ Environment variables loaded');
console.log('📊 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('🌐 Port:', process.env.PORT || 'Not set');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize Email Service
const emailService = require('./services/emailService');
emailService.verifyEmailConfig().then(result => {
  if (result.configured && result.verified) {
    console.log('✅ Email service initialized successfully');
  } else if (result.configured && !result.verified) {
    console.log('⚠️  Email service configured but verification failed:', result.error);
  } else {
    console.log('⚠️  Email service not configured (SMTP credentials missing)');
  }
});

// Database connection
console.log('🔌 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔧 Make sure your MongoDB URI is correct and accessible');
  process.exit(1);
});

// Create HTTP server and Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io setup with centralized event handlers
const SocketEvents = require('./socket/events');
const socketEvents = new SocketEvents(io);
socketEvents.initialize();

// Make io available to controllers via app.locals
app.locals.io = io;

console.log('✅ Socket.io server initialized with event handlers');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pm', require('./routes/pm'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/orgs', require('./routes/organizations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/kanban', require('./routes/kanban'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/files', require('./routes/files'));
app.use('/api/slack', require('./routes/slack'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/team-leader', require('./routes/teamLeader'));
app.use('/api/time-tracking', require('./routes/timeTracking'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/client', require('./routes/client'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      kanban: process.env.ENABLE_KANBAN === 'true',
      slack: process.env.ENABLE_SLACK_INTEGRATION === 'true',
      ai: process.env.ENABLE_AI_ASSISTANT === 'true',
      analytics: process.env.ENABLE_ANALYTICS === 'true',
      chat: process.env.ENABLE_CHAT === 'true'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔧 Features enabled:`, {
    kanban: process.env.ENABLE_KANBAN === 'true',
    slack: process.env.ENABLE_SLACK_INTEGRATION === 'true',
    ai: process.env.ENABLE_AI_ASSISTANT === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    chat: process.env.ENABLE_CHAT === 'true'
  });
});

module.exports = { app };

console.log('🔧 Starting debug server...');

// Test dotenv loading
console.log('🔧 Loading environment variables...');
require('dotenv').config({ path: './config.env' });
console.log('✅ Environment variables loaded');
console.log('📊 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('🌐 Port:', process.env.PORT || 'Not set');

// Test basic imports
console.log('🔧 Testing imports...');
const express = require('express');
const mongoose = require('mongoose');
console.log('✅ Basic imports working');

// Test database connection
console.log('🔌 Testing MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // If DB connects, start the server
  const app = express();
  app.use(express.json());
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Debug server working!', db: 'connected' });
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

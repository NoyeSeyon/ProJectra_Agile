console.log('🔧 Starting minimal server...');

require('dotenv').config({ path: './config.env' });
console.log('✅ Environment variables loaded');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

// Database connection
console.log('🔌 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Minimal server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

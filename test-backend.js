const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Test server setup
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend test successful!' });
});

// Test MongoDB connection
const testDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-banquet';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running or set MONGO_URI environment variable');
    return false;
  }
};

// Start test server
const startTest = async () => {
  console.log('🧪 Testing backend setup...');
  
  const dbConnected = await testDB();
  
  if (dbConnected) {
    const PORT = 5001; // Use different port for testing
    app.listen(PORT, () => {
      console.log(`✅ Test server running on http://localhost:${PORT}`);
      console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
      console.log('\n🎉 Backend setup is ready!');
      console.log('\n📋 Next steps:');
      console.log('1. Install backend dependencies: cd backend1 && npm install');
      console.log('2. Start backend server: npm run dev');
      console.log('3. Install frontend dependencies: cd frontend && npm install');
      console.log('4. Start frontend server: npm start');
      console.log('5. Or use the batch file: start-servers.bat');
    });
  } else {
    console.log('\n❌ Backend setup incomplete - MongoDB connection required');
    process.exit(1);
  }
};

startTest();

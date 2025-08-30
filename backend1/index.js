const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const SocketServer = require('./socketServer');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket Server
const socketServer = new SocketServer(server);

// Make socket server available globally
global.socketServer = socketServer;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/api', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    message: 'Food Banquet API is running...',
    database: dbStatus,
    socketUsers: socketServer.getConnectedUsersCount(),
    timestamp: new Date().toISOString()
  });
});

// Test registration endpoint
app.post('/api/test-registration', (req, res) => {
  console.log('Test registration endpoint hit:', req.body);
  res.json({ 
    message: 'Test registration endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/food-donations', require('./routes/foodDonationRoutes'));
app.use('/api/waste-pickups', require('./routes/wastePickupRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Socket server initialized`);
});
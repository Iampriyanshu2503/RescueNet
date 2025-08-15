require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
const { connectDB, logger } = require('./utils/database');

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join user to their specific room for personalized notifications
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined room user_${userId}`);
    });

    // Join location-based rooms for nearby notifications
    socket.on('join_location', (location) => {
        socket.join(`location_${location}`);
        logger.info(`User joined location room: ${location}`);
    });

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
    });
});

// Make io accessible to other parts of the app
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = server;
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const FoodDonation = require('./models/foodDonationModel');

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    this.connectedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> [room1, room2, ...]
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const { userId, userRole } = socket.handshake.auth;
        
        if (!userId || !userRole) {
          return next(new Error('Authentication failed'));
        }

        // Verify user exists in database
        const user = await User.findById(userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = userId;
        socket.userRole = userRole;
        socket.user = user;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, socket);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join location-based room if user has location
      if (socket.user.location && socket.user.location.coordinates) {
        const roomName = this.getLocationRoom(socket.user.location.coordinates);
        socket.join(roomName);
        this.addUserToRoom(socket.userId, roomName);
      }

      // Handle room joining
      socket.on('join_room', (data) => {
        const { room } = data;
        socket.join(room);
        this.addUserToRoom(socket.userId, room);
        console.log(`User ${socket.userId} joined room: ${room}`);
      });

      // Handle room leaving
      socket.on('leave_room', (data) => {
        const { room } = data;
        socket.leave(room);
        this.removeUserFromRoom(socket.userId, room);
        console.log(`User ${socket.userId} left room: ${room}`);
      });

      // Handle notification sending
      socket.on('send_notification', (notification) => {
        this.handleSendNotification(socket, notification);
      });

      // Handle marking notifications as read
      socket.on('mark_notification_read', (data) => {
        this.handleMarkAsRead(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
        this.removeUserFromAllRooms(socket.userId);
      });
    });
  }

  // Notify pre-registered customers when a donor lists food
  async notifyNewFoodDonation(donation) {
    try {
      const notification = {
        id: Date.now().toString(),
        type: 'new_donation',
        title: 'New Food Available! 🍽️',
        message: `${donation.foodType} is now available at ${donation.location?.address || 'a nearby location'}`,
        data: {
          donationId: donation._id,
          foodType: donation.foodType,
          location: donation.location,
          expiresAt: donation.expiresAt
        },
        timestamp: new Date(),
        read: false
      };

      // Get all recipients and volunteers
      const recipients = await User.find({ role: 'recipient' });
      const volunteers = await User.find({ role: 'volunteer' });
      const allUsers = [...recipients, ...volunteers];

      // Send notifications to all relevant users
      allUsers.forEach(user => {
        const userSocket = this.connectedUsers.get(user._id.toString());
        if (userSocket) {
          userSocket.emit('new_food_donation', notification);
        }
      });

      // Send location-based notifications
      if (donation.location && donation.location.coordinates) {
        const roomName = this.getLocationRoom(donation.location.coordinates);
        this.io.to(roomName).emit('new_food_donation', {
          ...notification,
          message: `${donation.foodType} is now available near you!`
        });
      }

      console.log(`Sent new donation notification to ${allUsers.length} users`);
    } catch (error) {
      console.error('Error sending new donation notification:', error);
    }
  }

  // Notify when donation is updated
  async notifyDonationUpdate(donation, updateType) {
    try {
      const notification = {
        id: Date.now().toString(),
        type: 'donation_update',
        title: 'Food Donation Updated 📝',
        message: `${donation.foodType} has been ${updateType}`,
        data: {
          donationId: donation._id,
          foodType: donation.foodType,
          status: donation.status
        },
        timestamp: new Date(),
        read: false
      };

      // Notify the donor
      const donorSocket = this.connectedUsers.get(donation.donor.toString());
      if (donorSocket) {
        donorSocket.emit('donation_update', notification);
      }

      // Notify recipients if status changed to available
      if (donation.status === 'available') {
        const recipients = await User.find({ role: 'recipient' });
        recipients.forEach(user => {
          const userSocket = this.connectedUsers.get(user._id.toString());
          if (userSocket) {
            userSocket.emit('donation_update', notification);
          }
        });
      }

      console.log(`Sent donation update notification for ${donation._id}`);
    } catch (error) {
      console.error('Error sending donation update notification:', error);
    }
  }

  // Notify when request status changes
  async notifyRequestUpdate(request, status) {
    try {
      const notification = {
        id: Date.now().toString(),
        type: 'request_update',
        title: 'Request Status Updated 📋',
        message: `Your request for ${request.foodType} has been ${status}`,
        data: {
          requestId: request._id,
          foodType: request.foodType,
          status: status
        },
        timestamp: new Date(),
        read: false
      };

      // Notify the recipient
      const recipientSocket = this.connectedUsers.get(request.recipient.toString());
      if (recipientSocket) {
        recipientSocket.emit('request_update', notification);
      }

      // Notify the donor
      const donorSocket = this.connectedUsers.get(request.donor.toString());
      if (donorSocket) {
        donorSocket.emit('request_update', {
          ...notification,
          title: 'New Food Request 📋',
          message: `Someone requested your ${request.foodType} donation`
        });
      }

      console.log(`Sent request update notification for ${request._id}`);
    } catch (error) {
      console.error('Error sending request update notification:', error);
    }
  }

  // Notify when a new review is added
  async notifyNewReview(userId, foodDonation, review) {
    try {
      const notification = {
        id: Date.now().toString(),
        type: 'new_review',
        title: 'New Review Received ⭐',
        message: `Someone reviewed your ${foodDonation.foodType} donation`,
        data: {
          foodDonationId: foodDonation._id,
          foodType: foodDonation.foodType,
          reviewId: review._id,
          rating: review.rating,
          reviewType: review.reviewType
        },
        timestamp: new Date(),
        read: false
      };

      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        userSocket.emit('new_review', notification);
      }

      console.log(`Sent new review notification to user ${userId}`);
    } catch (error) {
      console.error('Error sending new review notification:', error);
    }
  }

  // Send system notification
  sendSystemNotification(userId, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(),
      type: 'system',
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };

    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('system_notification', notification);
    }
  }

  // Helper methods
  getLocationRoom(coordinates) {
    let lat, lng;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      // Assume [lat, lng]
      lat = coordinates[0];
      lng = coordinates[1];
    } else if (coordinates && typeof coordinates === 'object') {
      lat = coordinates.lat;
      lng = coordinates.lng;
    }
    const latKey = Math.round(Number(lat) * 100);
    const lngKey = Math.round(Number(lng) * 100);
    return `location_${latKey}_${lngKey}`;
  }

  addUserToRoom(userId, roomName) {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, []);
    }
    const rooms = this.userRooms.get(userId);
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
    }
  }

  removeUserFromRoom(userId, roomName) {
    if (this.userRooms.has(userId)) {
      const rooms = this.userRooms.get(userId);
      const index = rooms.indexOf(roomName);
      if (index > -1) {
        rooms.splice(index, 1);
      }
    }
  }

  removeUserFromAllRooms(userId) {
    this.userRooms.delete(userId);
  }

  handleSendNotification(socket, notification) {
    // This would typically save the notification to the database
    console.log('Notification sent:', notification);
  }

  handleMarkAsRead(socket, data) {
    // This would typically update the notification in the database
    console.log('Notification marked as read:', data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = SocketServer;

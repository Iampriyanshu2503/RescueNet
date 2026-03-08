import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface NotificationData {
  id: string;
  type: 'new_donation' | 'donation_update' | 'request_update' | 'system' | 'new_review';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string, userRole: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = io('http://localhost:5000', {
        auth: {
          userId,
          userRole
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      this.isConnected = false;
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.attemptReconnect();
    });

    // Listen for new food donations
    this.socket.on('new_food_donation', (data: NotificationData) => {
      console.log('New food donation notification:', data);
      this.handleNewDonationNotification(data);
      this.emit('notification_received', data);
    });

    // Listen for donation updates
    this.socket.on('donation_update', (data: NotificationData) => {
      console.log('Donation update notification:', data);
      this.handleDonationUpdateNotification(data);
      this.emit('notification_received', data);
    });

    // Listen for request updates
    this.socket.on('request_update', (data: NotificationData) => {
      console.log('Request update notification:', data);
      this.handleRequestUpdateNotification(data);
      this.emit('notification_received', data);
    });

    // Listen for system notifications
    this.socket.on('system_notification', (data: NotificationData) => {
      console.log('System notification:', data);
      this.handleSystemNotification(data);
      this.emit('notification_received', data);
    });

    // Listen for new review notifications
    this.socket.on('new_review', (data: NotificationData) => {
      console.log('New review notification:', data);
      this.handleNewReviewNotification(data);
      this.emit('notification_received', data);
    });
  }

  private handleNewDonationNotification(data: NotificationData) {
    // Show toast notification for new donations
    toast.success(
      `🍽️ ${data.title}\n${data.message}`,
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  }

  private handleDonationUpdateNotification(data: NotificationData) {
    toast(
      `📝 ${data.title}\n${data.message}`,
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }

  private handleRequestUpdateNotification(data: NotificationData) {
    toast(
      `📋 ${data.title}\n${data.message}`,
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }

  private handleSystemNotification(data: NotificationData) {
    toast(
      `ℹ️ ${data.title}\n${data.message}`,
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  }

  private handleNewReviewNotification(data: NotificationData) {
    toast(
      `⭐ ${data.title}\n${data.message}`,
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Subscribe to notifications
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Unsubscribe from notifications
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events to listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Send notification to server
  sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_notification', notification);
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  // Join a room (for location-based notifications)
  joinRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', { room: roomName });
    }
  }

  // Leave a room
  leaveRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', { room: roomName });
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

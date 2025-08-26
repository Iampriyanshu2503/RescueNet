import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import socketService from '../services/socketService';

interface NotificationData {
  id: string;
  type: 'new_donation' | 'donation_update' | 'request_update' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const notificationsRef = useRef<NotificationData[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      socketService.connect(user._id, user.role);
      
      // Subscribe to notification events
      const handleNotification = (notification: NotificationData) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
        notificationsRef.current = [notification, ...notificationsRef.current.slice(0, 49)];
      };

      socketService.subscribe('notification_received', handleNotification);

      // Join location-based room if user has location
      if (user.location && user.location.coordinates) {
        const roomName = `location_${Math.round(user.location.coordinates.lat * 100)}_${Math.round(user.location.coordinates.lng * 100)}`;
        socketService.joinRoom(roomName);
      }

      // Check connection status periodically
      const connectionCheck = setInterval(() => {
        setIsConnected(socketService.getConnectionStatus());
      }, 5000);

      return () => {
        socketService.unsubscribe('notification_received', handleNotification);
        clearInterval(connectionCheck);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const markAsRead = (notificationId: string) => {
    socketService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    notificationsRef.current = [];
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  return {
    notifications,
    isConnected,
    markAsRead,
    clearNotifications,
    getUnreadCount,
    socketService
  };
};

export default useSocket;
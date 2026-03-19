import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [notifications, setNotifications]   = useState<NotificationData[]>([]);
  const [isConnected,   setIsConnected]     = useState(false);
  const notificationsRef = useRef<NotificationData[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let connectionCheck: ReturnType<typeof setInterval> | null = null;

    try {
      // Guard: only connect if socketService.connect exists
      if (typeof socketService?.connect === 'function') {
        socketService.connect(user._id, user.role);
      }

      const handleNotification = (notification: NotificationData) => {
        try {
          setNotifications(prev => [notification, ...prev.slice(0, 49)]);
          notificationsRef.current = [notification, ...notificationsRef.current.slice(0, 49)];
        } catch { /* ignore */ }
      };

      if (typeof socketService?.subscribe === 'function') {
        socketService.subscribe('notification_received', handleNotification);
      }

      // Join location room safely
      try {
        const coords = user?.location?.coordinates;
        if (coords && typeof socketService?.joinRoom === 'function') {
          const lat = coords.lat ?? coords[1];
          const lng = coords.lng ?? coords[0];
          if (lat && lng) {
            const roomName = `location_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
            socketService.joinRoom(roomName);
          }
        }
      } catch { /* location join is non-critical */ }

      // Check connection status periodically
      connectionCheck = setInterval(() => {
        try {
          if (typeof socketService?.getConnectionStatus === 'function') {
            setIsConnected(socketService.getConnectionStatus());
          }
        } catch { setIsConnected(false); }
      }, 5000);

      return () => {
        try {
          if (typeof socketService?.unsubscribe === 'function') {
            socketService.unsubscribe('notification_received', handleNotification);
          }
        } catch { /* ignore */ }
        if (connectionCheck) clearInterval(connectionCheck);
        try {
          if (typeof socketService?.disconnect === 'function') {
            socketService.disconnect();
          }
        } catch { /* ignore */ }
      };

    } catch (err) {
      // Socket server is likely not running — silently degrade
      console.warn('[useSocket] Socket connection failed (server may not be running):', err);
      if (connectionCheck) clearInterval(connectionCheck);
    }
  }, [isAuthenticated, user]);

  const markAsRead = useCallback((notificationId: string) => {
    try {
      if (typeof socketService?.markAsRead === 'function') {
        socketService.markAsRead(notificationId);
      }
    } catch { /* ignore */ }
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    notificationsRef.current = [];
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    isConnected,
    markAsRead,
    clearNotifications,
    getUnreadCount,
    socketService,
  };
};

export default useSocket;
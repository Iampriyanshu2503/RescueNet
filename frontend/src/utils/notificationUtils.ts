import toast from 'react-hot-toast';

export const showNotification = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontWeight: '500',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontWeight: '500',
      },
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontWeight: '500',
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontWeight: '500',
      },
    });
  }
};
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiryDate: Date;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Check if expiryDate is valid
      if (!expiryDate || isNaN(expiryDate.getTime())) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [expiryDate, onExpire]);

  if (isExpired) {
    return (
      <div className="flex items-center text-red-500 font-medium">
        <Clock className="mr-1 h-4 w-4" />
        Expired
      </div>
    );
  }

  return (
    <div className="flex items-center text-amber-600 font-medium">
      <Clock className="mr-1 h-4 w-4" />
      <span>
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes}m {timeLeft.seconds}s remaining
      </span>
    </div>
  );
};

export default CountdownTimer;
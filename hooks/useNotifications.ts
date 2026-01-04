'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
  streakAlertsEnabled: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const permissionRef = useRef<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      const current = Notification.permission;
      setPermission(current);
      permissionRef.current = current;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionRef.current === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        ...options,
      });
    }
  }, []);

  const sendTestNotification = useCallback(() => {
    sendNotification('Habit Tracker', {
      body: 'Notifications are working correctly!',
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendTestNotification,
  };
}

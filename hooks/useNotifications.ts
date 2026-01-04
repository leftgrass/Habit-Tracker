'use client';

import { useState, useEffect, useCallback } from 'react';

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
  streakAlertsEnabled: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    reminderTime: '09:00',
    streakAlertsEnabled: true,
  });
  const [scheduledNotifications, setScheduledNotifications] = useState<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const scheduleDailyReminder = useCallback((habitName: string) => {
    if (settings.enabled && permission === 'granted') {
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      
      const scheduleNotification = () => {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const delay = scheduledTime.getTime() - now.getTime();
        
        const timeoutId = setTimeout(() => {
          if (settings.enabled) {
            new Notification(`Time for ${habitName}!`, {
              body: `Don't forget to complete your habit today`,
              icon: '/icon-192.png',
              tag: `reminder-${habitName}`,
            });
          }
          scheduleNotification();
        }, delay);
        
        setScheduledNotifications(prev => {
          const next = new Map(prev);
          next.set(habitName, timeoutId);
          return next;
        });
      };
      
      scheduleNotification();
    }
  }, [settings.enabled, settings.reminderTime, permission]);

  const cancelScheduledNotification = useCallback((habitName: string) => {
    const timeoutId = scheduledNotifications.get(habitName);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setScheduledNotifications(prev => {
        const next = new Map(prev);
        next.delete(habitName);
        return next;
      });
    }
  }, [scheduledNotifications]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const sendTestNotification = useCallback(() => {
    if (permission === 'granted' && settings.enabled) {
      new Notification('Habit Tracker', {
        body: 'Notifications are working correctly!',
        icon: '/icon-192.png',
      });
    }
  }, [permission, settings.enabled]);

  useEffect(() => {
    return () => {
      scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [scheduledNotifications]);

  return {
    permission,
    settings,
    requestPermission,
    scheduleDailyReminder,
    cancelScheduledNotification,
    updateSettings,
    sendTestNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
}

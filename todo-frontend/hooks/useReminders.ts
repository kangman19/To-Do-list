import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Reminder } from '@/types';

export const useReminders = () => {
  const [unreadReminders, setUnreadReminders] = useState<Reminder[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.reminders.getUnread();
      setUnreadReminders(data);
      setNotificationCount(data.length);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissReminder = async (reminderId: number) => {
    try {
      await api.reminders.markAsRead(reminderId);
      await loadReminders();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  return {
    unreadReminders,
    notificationCount,
    loading,
    loadReminders,
    dismissReminder
  };
};
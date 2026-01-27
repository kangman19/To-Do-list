import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

export const useUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setAllUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    allUsers,
    loading,
    loadUsers
  };
};
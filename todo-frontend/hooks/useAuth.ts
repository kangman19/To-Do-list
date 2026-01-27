import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export const useAuth = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const user = await api.auth.getUser();
      setUsername(user.username);
      setUserId(user.userId);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return {
    username,
    userId,
    isAuthenticated,
    loading,
    logout,
    checkAuth
  };
};
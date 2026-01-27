import { API_URL } from './constants';

export const api = {
  // Helper to get auth headers
  getHeaders: (includeContentType = true) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  // Auth
  auth: {
    getUser: async () => {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  },

  // Tasks
  tasks: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },

    create: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create task');
      }
      return response.json();
    },

    toggle: async (taskId: number) => {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to toggle task');
      return response.json();
    },

    delete: async (taskId: number) => {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/delete`, {
        method: 'POST',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },

    deleteFolder: async (category: string) => {
      const response = await fetch(`${API_URL}/api/tasks/folder/${encodeURIComponent(category)}/delete`, {
        method: 'DELETE',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete folder');
      return response.json();
    }
  },

  // Users
  users: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  },

  // Shares
  shares: {
    create: async (category: string, sharedWithUserId: number) => {
      const response = await fetch(`${API_URL}/api/shares`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ category, sharedWithUserId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to share folder');
      }
      return response.json();
    }
  },

  // Reminders
  reminders: {
    getUnread: async () => {
      const response = await fetch(`${API_URL}/api/reminders/unread`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    },

    create: async (receiverId: number, category: string, message?: string) => {
      const response = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ receiverId, category, message: message || null })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reminder');
      }
      return response.json();
    },

    markAsRead: async (reminderId: number) => {
      const response = await fetch(`${API_URL}/api/reminders/${reminderId}/read`, {
        method: 'POST',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to mark reminder as read');
      return response.json();
    }
  }
};
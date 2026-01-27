import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { TasksByCategory } from '@/types';

export const useTasks = () => {
  const [tasksByCategory, setTasksByCategory] = useState<TasksByCategory>({});
  const [categoryOwners, setCategoryOwners] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.tasks.getAll();
      setTasksByCategory(data);
      
      // Extract category owners
      const owners: Record<string, number> = {};
      Object.keys(data).forEach(cat => {
        if (data[cat].tasks.length > 0) {
          owners[cat] = data[cat].tasks[0].userId;
        }
      });
      setCategoryOwners(owners);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTask = async (taskId: number) => {
    try {
      await api.tasks.toggle(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.tasks.delete(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const deleteFolder = async (category: string) => {
    if (!confirm(`Delete the entire folder "${category}" and all its tasks?`)) return;
    
    try {
      await api.tasks.deleteFolder(category);
      await loadTasks();
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  const allCategories = Object.keys(tasksByCategory);

  return {
    tasksByCategory,
    categoryOwners,
    allCategories,
    loading,
    error,
    loadTasks,
    toggleTask,
    deleteTask,
    deleteFolder
  };
};
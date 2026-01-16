// web-interface/js/taskService.js

export async function loadTasks() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to load tasks');
      return null;
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    return null;
  }
}

export async function createTask(task, category, ownerId, taskType, file, textContent) {
  try {
    const token = localStorage.getItem('token');
    
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('task', task);
    formData.append('category', category || 'Uncategorized');
    if (ownerId) formData.append('ownerId', ownerId);
    formData.append('taskType', taskType || 'list');
    
    if (taskType === 'image' && file) {
      formData.append('image', file);
    } else if (taskType === 'text' && textContent) {
      formData.append('textContent', textContent);
    }

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });

    if (response.ok) {
      return { success: true };
    } else {
      const result = await response.json();
      return { success: false, message: result.message || 'Error adding task' };
    }
  } catch (error) {
    console.error('Error adding task:', error);
    return { success: false, message: 'Network error: ' + error.message };
  }
}

export async function toggleTask(taskId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error toggling task:', error);
    return false;
  }
}

export async function deleteTask(taskId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tasks/${taskId}/delete`, {
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}
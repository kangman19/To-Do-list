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

export async function createTask(task, category, ownerId, taskType = 'list', textContent = null) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        task, 
        category, 
        ownerId, 
        taskType,
        textContent 
      })
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
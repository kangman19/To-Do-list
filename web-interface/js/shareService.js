export async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

export async function shareFolder(category, userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/shares', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        category: category,
        sharedWithUserId: userId
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const result = await response.json();
      return { success: false, message: result.message || 'Error sharing folder' };
    }
  } catch (error) {
    console.error('Error sharing folder:', error);
    return { success: false, message: 'Network error' };
  }
}
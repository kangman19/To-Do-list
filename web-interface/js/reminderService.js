export async function sendReminder(receiverId, category, message) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId, category, message })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const result = await response.json();
      return { success: false, message: result.message || 'Error sending reminder' };
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    return { success: false, message: 'Network error' };
  }
}

export async function getUnreadReminders() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/reminders/unread', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
}

export async function markReminderAsRead(reminderId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/reminders/${reminderId}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking reminder as read:', error);
    return false;
  }
}
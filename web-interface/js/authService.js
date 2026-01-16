export async function checkUserLogin() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { loggedIn: false };
    }

    const response = await fetch('/auth/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      return { loggedIn: true, username: user.username, userId: user.userId };
    } else {
      localStorage.removeItem('token');
      return { loggedIn: false };
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return { loggedIn: false };
  }
}

export function displayLoggedInUser(username) {
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #f5f5f5;">
        <p style="margin: 0;">Welcome, <strong>${username}</strong></p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="notificationBtn" onclick="toggleNotifications()" 
                  style="padding: 8px 12px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 5px; position: relative;">
            🔔
            <span id="notificationBadge" style="display: none; position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; line-height: 20px;"></span>
          </button>
          <button onclick="logout()" style="padding: 8px 12px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 5px;">
            Logout
          </button>
        </div>
      </div>
    `;
  }
}

export function displayNotLoggedIn() {
  const taskForm = document.getElementById('taskForm');
  const authRequired = document.getElementById('authRequired');
  const userInfo = document.getElementById('userInfo');
  
  if (taskForm) taskForm.style.display = 'none';
  if (authRequired) authRequired.style.display = 'block';
  if (userInfo) userInfo.innerHTML = '';
}

export function showTaskForm() {
  const taskForm = document.getElementById('taskForm');
  const authRequired = document.getElementById('authRequired');
  
  if (taskForm) taskForm.style.display = 'block';
  if (authRequired) authRequired.style.display = 'none';
}

export async function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

// Update notification badge
export function updateNotificationBadge(count) {
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Make logout available globally
window.logout = logout;
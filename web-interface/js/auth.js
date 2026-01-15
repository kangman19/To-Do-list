import { loadUsers } from './share.js';
import { loadTasks } from './tasks.js';

export async function checkUserLogin() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      displayNotLoggedIn();
      return;
    }

    const response = await fetch('/auth/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      displayLoggedInUser(user.username);
      showTaskForm();
      await loadUsers();
      await loadTasks();
    } else {
      // Token is invalid
      localStorage.removeItem('token');
      displayNotLoggedIn();
    }
  } catch (error) {
    console.error('Error checking user:', error);
    displayNotLoggedIn();
  }
}

function displayLoggedInUser(username) {
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.innerHTML = `
      <p>Welcome, <strong>${username}</strong> | 
      <button onclick="logout()" style="padding: 5px 10px; cursor: pointer;">Logout</button></p>
    `;
  }
}

function displayNotLoggedIn() {
  const taskForm = document.getElementById('taskForm');
  const authRequired = document.getElementById('authRequired');
  const userInfo = document.getElementById('userInfo');
  
  if (taskForm) taskForm.style.display = 'none';
  if (authRequired) authRequired.style.display = 'block';
  if (userInfo) userInfo.innerHTML = '';
}

function showTaskForm() {
  const taskForm = document.getElementById('taskForm');
  const authRequired = document.getElementById('authRequired');
  
  if (taskForm) {
    taskForm.style.display = 'block';
    console.log('Task form shown');
  } else {
    console.error('taskForm element not found');
  }
  
  if (authRequired) {
    authRequired.style.display = 'none';
    console.log('Auth required hidden');
  } else {
    console.error('authRequired element not found');
  }
}

export async function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

// Make logout available globally for inline onclick handlers
window.logout = logout;
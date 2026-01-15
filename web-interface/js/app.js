import { checkUserLogin } from './auth.js';
import { addTask } from './tasks.js';
import './socket.js';
import './categories.js';
import './share.js';
import './form.js';

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already loaded
  initApp();
}

function initApp() {
  console.log('Initializing app...');
  
  // Check login status
  checkUserLogin();

  // Handle task form submission
  const addTaskForm = document.getElementById('addTaskForm');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', addTask);
    console.log('Task form listener attached');
  } else {
    console.error('addTaskForm not found');
  }
}
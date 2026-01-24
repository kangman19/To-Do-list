import { checkUserLogin, displayLoggedInUser, displayNotLoggedIn, showTaskForm } from './authService.js';
import { loadTasks, createTask, toggleTask, deleteTask, deleteFolder } from './taskService.js';
import { loadUsers, shareFolder } from './shareService.js';
import { displayTasks, updateCategorySelect, openShareModal, closeShareModal } from './uiHelpers.js';
import { initializeSocket } from './socketClient.js';
import { getUnreadReminders, sendReminder, markReminderAsRead } from './reminderService.js';

// Global state
let allUsers = [];
let categoryOwners = {};
let notificationsVisible = false;//1
window.currentShareCategory = null;
window.currentReminderCategory = null;

// Initialize socket
initializeSocket(loadAndDisplayTasks);

// Initialize app
async function initApp() {
  try {
    const userStatus = await checkUserLogin();
    
    if (userStatus.loggedIn) {
      displayLoggedInUser(userStatus.username);
      showTaskForm();
      allUsers = await loadUsers();
      await loadAndDisplayTasks();
      await checkAndDisplayReminders();
    } else {
      displayNotLoggedIn();
    }
  } catch (error) {
    console.error('Error in initApp:', error);
    displayNotLoggedIn();
  }
}
//2
window.toggleNotifications = async () => {
  if (notificationsVisible) {
    // Close notifications
    const notifications = document.getElementById('reminderNotifications');
    if (notifications) {
      notifications.remove();
    }
    notificationsVisible = false;
  } else {
    // Open/refresh notifications
    await checkAndDisplayReminders();
    notificationsVisible = true;
  }
};

async function checkAndDisplayReminders() {
  const reminders = await getUnreadReminders();
  
  if (reminders.length > 0) {
    displayReminderNotifications(reminders);
  }
}

function displayReminderNotifications(reminders) {
  const container = document.createElement('div');
  container.id = 'reminderNotifications';
  container.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 350px;
    max-height: 400px;
    overflow-y: auto;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    padding: 20px;
    z-index: 1000;
  `;

  container.innerHTML = `
    <h3 style="margin-top: 0;">New Reminders (${reminders.length})</h3>
    <div id="reminderList"></div>
    <button onclick="closeReminderNotifications()" style="width: 100%; margin-top: 10px;">Close</button>
  `;

  const list = container.querySelector('#reminderList');
  
  reminders.forEach(reminder => {
    const item = document.createElement('div');
    item.style.cssText = `
      background: #f0f4ff;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    `;
    
    item.innerHTML = `
      <strong>${reminder.sender.username}</strong> reminded you about <strong>${reminder.category}</strong>
      ${reminder.message ? `<br><em>"${reminder.message}"</em>` : ''}
      <br><small>${new Date(reminder.createdAt).toLocaleString()}</small>
      <br><button onclick="dismissReminder(${reminder.id})" style="margin-top: 8px; font-size: 12px;">Dismiss</button>
    `;
    
    list.appendChild(item);
  });

  document.body.appendChild(container);
}

window.dismissReminder = async (reminderId) => {
  await markReminderAsRead(reminderId);
  await checkAndDisplayReminders();
  const notifications = document.getElementById('reminderNotifications');
  if (notifications) {
    notifications.remove();
  }
};

window.closeReminderNotifications = () => {
  const notifications = document.getElementById('reminderNotifications');
  if (notifications) {
    notifications.remove();
  }
};

async function loadAndDisplayTasks() {
  const tasksByCategory = await loadTasks();
  if (tasksByCategory) {
    displayTasks(tasksByCategory, categoryOwners);
  } else {
    updateCategorySelect(new Set());
  }
}

// Event Listeners
document.getElementById('categorySelect').addEventListener('change', (e) => {
  const newCategoryInput = document.getElementById('newCategoryInput');
  if (e.target.value === '__custom__') {
    newCategoryInput.style.display = 'block';
    newCategoryInput.focus();
  } else {
    newCategoryInput.style.display = 'none';
  }
});

// Handle task type selection
const taskTypeSelect = document.getElementById('taskTypeSelect');
if (taskTypeSelect) {
  taskTypeSelect.addEventListener('change', (e) => {
    const textAreaContainer = document.getElementById('textAreaContainer');
    const imageInputContainer = document.getElementById('imageInputContainer');
    
    // Hide all type-specific inputs
    textAreaContainer.style.display = 'none';
    imageInputContainer.style.display = 'none';
    
    // Show relevant input based on type
    if (e.target.value === 'text') {
      textAreaContainer.style.display = 'block';
    } else if (e.target.value === 'image') {
      imageInputContainer.style.display = 'block';
    }
  });
}

document.getElementById('addTaskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const task = document.getElementById('taskInput').value;
  const select = document.getElementById('categorySelect');
  const taskType = taskTypeSelect ? taskTypeSelect.value : 'list';
  let category = select.value;
  
  if (category === '__custom__') {
    category = document.getElementById('newCategoryInput').value.trim();
    if (!category) {
      alert('Please enter a category name');
      return;
    }
  } else if (!category) {
    alert('Please select or create a category');
    return;
  }

  // Get type-specific data
  let file = null;
  let textContent = null;
  
  if (taskType === 'image') {
    const imageInput = document.getElementById('imageInput');
    if (imageInput && imageInput.files && imageInput.files[0]) {
      file = imageInput.files[0];
    } else {
      alert('Please select an image file');
      return;
    }
  } else if (taskType === 'text') {
    const textArea = document.getElementById('textArea');
    if (textArea) {
      textContent = textArea.value.trim();
      if (!textContent) {
        alert('Please enter text content');
        return;
      }
    }
  }
  const dueDateInput = document.getElementById('dueDateInput');
  const dueDate = dueDateInput && dueDateInput.value
  ? new Date(dueDateInput.value).toISOString()
  : null;

  

  const ownerId = categoryOwners[category];
  const result = await createTask(task, category, ownerId, taskType, file, textContent, dueDate);

  
  
  const messageEl = document.getElementById('taskMessage');
  
  if (result.success) {
    document.getElementById('taskInput').value = '';
    document.getElementById('newCategoryInput').value = '';
    if (document.getElementById('textArea')) document.getElementById('textArea').value = '';
    if (document.getElementById('imageInput')) document.getElementById('imageInput').value = '';
    select.value = '';
    if (taskTypeSelect) taskTypeSelect.value = 'list';
    messageEl.textContent = '';
    await loadAndDisplayTasks();
  } else {
    messageEl.textContent = result.message;
    messageEl.style.color = 'red';
  }
});

// Global handlers
window.toggleTaskHandler = async (taskId) => {
  const success = await toggleTask(taskId);
  if (success) {
    await loadAndDisplayTasks();
  } else {
    alert('Error updating task');
  }
};

window.deleteFolderHandler = async (category) => {
  if (!confirm(`Delete the entire folder "${category}" and all its tasks?`)) return;

  const success = await deleteFolder(category);
  if (success) {
    await loadAndDisplayTasks();
  } else {
    alert('Failed to delete folder');
  }
};


window.deleteTaskHandler = async (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    const success = await deleteTask(taskId);
    if (success) {
      await loadAndDisplayTasks();
    } else {
      alert('Failed to delete task');
    }
  }
};

window.openShareModal = (category) => {
  openShareModal(category, allUsers);
};

window.openReminderModal = (category) => {
  window.currentReminderCategory = category;
  const select = document.getElementById('reminderUserSelect');
  select.innerHTML = '<option value="">Select a user</option>';
  
  allUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.username;
    select.appendChild(option);
  });
  
  document.getElementById('reminderModal').style.display = 'block';
};

window.closeShareModal = closeShareModal;

window.closeReminderModal = () => {
  document.getElementById('reminderModal').style.display = 'none';
  document.getElementById('reminderMessage').value = '';
  window.currentReminderCategory = null;
};

window.confirmShare = async () => {
  const userId = document.getElementById('shareUserSelect').value;
  
  if (!userId) {
    alert('Please select a user');
    return;
  }

  const result = await shareFolder(window.currentShareCategory, userId);
  
  if (result.success) {
    alert('Folder shared successfully!');
    closeShareModal();
    await loadAndDisplayTasks();
  } else {
    alert(result.message);
  }
};

window.confirmSendReminder = async () => {
  const userId = document.getElementById('reminderUserSelect').value;
  const message = document.getElementById('reminderMessage').value;
  
  if (!userId) {
    alert('Please select a user');
    return;
  }

  const result = await sendReminder(userId, window.currentReminderCategory, message);
  
  if (result.success) {
    alert('Reminder sent successfully!');
    window.closeReminderModal();
  } else {
    alert(result.message);
  }
};

// Close modals when clicking outside
window.onclick = function(event) {
  const shareModal = document.getElementById('shareModal');
  const reminderModal = document.getElementById('reminderModal');
  
  if (event.target == shareModal) {
    closeShareModal();
  }
  if (event.target == reminderModal) {
    window.closeReminderModal();
  }
};

// Start app
initApp().catch(error => {
  console.error('Fatal error during app initialization:', error);
  displayNotLoggedIn();
});
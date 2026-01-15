import { allCategories, categoryOwners, updateCategorySelect } from './categories.js';

export async function loadTasks() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load tasks');

    const tasksByCategory = await response.json();
    displayTasks(tasksByCategory);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

function displayTasks(tasksByCategory) {
  allCategories.clear();
  
  Object.keys(tasksByCategory).forEach(cat => {
    allCategories.add(cat);
    if (tasksByCategory[cat].tasks.length > 0) {
      categoryOwners[cat] = tasksByCategory[cat].tasks[0].userId;
    }
  });

  updateCategorySelect();

  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';

  Object.keys(tasksByCategory).sort().forEach(category => {
    const catData = tasksByCategory[category];
    const categoryDiv = document.createElement('div');
    categoryDiv.style.marginBottom = '30px';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'category-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'category-title';
    titleSpan.innerHTML = `<h2>${category}</h2>`;

    if (catData.shared) {
      titleSpan.innerHTML += `<span class="shared-badge">Shared with you by ${catData.sharedBy}</span>`;
    }

    headerDiv.appendChild(titleSpan);

    // Only show share button for owner
    if (!catData.shared) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'share-btn';
      shareBtn.textContent = 'Share';
      shareBtn.onclick = () => window.openShareModal(category);
      headerDiv.appendChild(shareBtn);
    }

    categoryDiv.appendChild(headerDiv);

    const taskList = document.createElement('ul');
    taskList.id = `list-${category}`;

    catData.tasks.forEach(task => {
      const li = document.createElement('li');
      const strikethrough = task.completed ? 'style="text-decoration: line-through; color:#999;"' : '';

      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="window.toggleTask(${task.id})" 
               style="margin-right:10px; cursor:pointer;">
        <span ${strikethrough}>"${task.task}"</span>
        <span style="font-size:0.85em;color:#666;margin-left:10px;">
          Created by: ${task.username} ${task.createdAt}
        </span>
        <button onclick="window.deleteTask(${task.id})" 
                style="margin-left:10px;cursor:pointer;color:red;">Delete</button>
        ${task.completed && task.completedBy ? 
          `<br><span style="font-size:0.85em;color:#666;margin-left:40px;">
            Marked done by: ${task.completedBy} at ${new Date(task.completedAt).toLocaleString()}
          </span>` : ''}
      `;
      taskList.appendChild(li);
    });

    categoryDiv.appendChild(taskList);
    container.appendChild(categoryDiv);
  });
}

// Handle adding a new task
export async function addTask(event) {
  event.preventDefault();

  const taskInput = document.getElementById('taskInput').value;
  const taskType = document.getElementById('taskSelect').value;

  let taskContent = taskInput;
  if (taskType === 'text') {
    taskContent = document.getElementById('textAreaInput').value;
  } else if (taskType === 'image') {
    const imageFile = document.getElementById('imageInput').files[0];
    if (!imageFile) {
      alert('Please select an image');
      return;
    }
    taskContent = imageFile.name; // Store filename, handle upload separately
  }

  const select = document.getElementById('categorySelect');
  let category = select.value;

  if (category === '__custom__') {
    category = document.getElementById('newCategoryInput').value.trim();
    if (!category) return alert('Please enter a category name');
  } else if (!category) return alert('Please select or create a category');

  const messageEl = document.getElementById('taskMessage');

  try {
    const token = localStorage.getItem('token');
    const ownerId = categoryOwners[category];

    const body = { task: taskContent, category, ownerId };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      document.getElementById('taskInput').value = '';
      document.getElementById('newCategoryInput').value = '';
      select.value = '';
      if (taskType === 'text') document.getElementById('textAreaInput').value = '';
      if (taskType === 'image') document.getElementById('imageInput').value = '';
      loadTasks();
      messageEl.textContent = '';
    } else {
      const result = await response.json();
      messageEl.textContent = result.message || 'Error adding task';
      messageEl.style.color = 'red';
    }
  } catch (error) {
    console.error('Error adding task:', error);
    messageEl.textContent = 'Network error: ' + error.message;
    messageEl.style.color = 'red';
  }
}

// Toggle task completion
export async function toggleTask(taskId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      loadTasks();
    } else {
      alert('Error updating task');
    }
  } catch (error) {
    console.error('Error toggling task:', error);
    alert('Error updating task');
  }
}

// Delete task
export async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tasks/${taskId}/delete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      loadTasks();
    } else {
      alert('Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Error deleting task');
  }
}

// Make functions available globally for inline handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
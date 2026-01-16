export function displayTasks(tasksByCategory, categoryOwners) {
  const allCategories = new Set();
  
  Object.keys(tasksByCategory).forEach(cat => {
    allCategories.add(cat);
    if (tasksByCategory[cat].tasks.length > 0) {
      categoryOwners[cat] = tasksByCategory[cat].tasks[0].userId;
    }
  });
  
  updateCategorySelect(allCategories);

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
    
    if (!catData.shared) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'share-btn';
      shareBtn.textContent = 'Share';
      shareBtn.onclick = () => window.openShareModal(category);
      headerDiv.appendChild(shareBtn);
    }
//reminder button
const remindBtn = document.createElement('button');
remindBtn.className = 'share-btn';
remindBtn.textContent = 'Remind';
remindBtn.style.background = '#f59e0b';
remindBtn.onclick = () => window.openReminderModal(category);
headerDiv.appendChild(remindBtn);
    categoryDiv.appendChild(headerDiv);
    
    const taskList = document.createElement('ul');
    taskList.id = `list-${category}`;
    
    catData.tasks.forEach(task => {
      const li = document.createElement('li');
      const strikethrough = task.completed ? 'style="text-decoration: line-through; color: #999;"' : '';
      
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="window.toggleTaskHandler(${task.id})" 
               style="margin-right: 10px; cursor: pointer;">
        <span ${strikethrough}>"${task.task}"</span>
        <span style="font-size: 0.85em; color: #666; margin-left: 10px;">
          Created by: ${task.username} ${task.createdAt}
        </span> 
        <button onclick="window.deleteTaskHandler(${task.id})" 
                style="margin-left: 10px; cursor: pointer; color: red;">
          Delete
        </button>
        ${task.completed && task.completedBy ? `
          <br><span style="font-size: 0.85em; color: #666; margin-left: 40px;">
            Marked done by: ${task.completedBy} at ${new Date(task.completedAt).toLocaleString()}
          </span>
        ` : ''}
      `;
      taskList.appendChild(li);
    });
    
    categoryDiv.appendChild(taskList);
    container.appendChild(categoryDiv);
  });
}

export function updateCategorySelect(allCategories) {
  const select = document.getElementById('categorySelect');
  const defaultOption = select.options[0];
  select.innerHTML = '';
  select.appendChild(defaultOption);

  Array.from(allCategories).sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const customOption = document.createElement('option');
  customOption.value = '__custom__';
  customOption.textContent = '+ Create New Category';
  select.appendChild(customOption);
}

export function openShareModal(category, allUsers) {
  window.currentShareCategory = category;
  const select = document.getElementById('shareUserSelect');
  select.innerHTML = '<option value="">Select a user</option>';
  
  allUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.username;
    select.appendChild(option);
  });
  
  document.getElementById('shareModal').style.display = 'block';
}

export function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
  window.currentShareCategory = null;
}
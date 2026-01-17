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

  // Color palette for cards
  const colors = ['blue'];
  let colorIndex = 0;

  Object.keys(tasksByCategory).sort().forEach(category => {
    const catData = tasksByCategory[category];
    
    // Create card
    const categoryCard = document.createElement('div');
    categoryCard.className = 'category-card';
    categoryCard.setAttribute('data-color', colors[colorIndex % colors.length]);
    colorIndex++;
    
    // Header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'category-header';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'category-title';
    titleDiv.innerHTML = `<h2>${category}</h2>`;
    
    if (catData.shared) {
      titleDiv.innerHTML += `<span class="shared-badge">Shared by ${catData.sharedBy}</span>`;
    }
    
    headerDiv.appendChild(titleDiv);
    
    // Card Actions (share & remind buttons)
    if (!catData.shared) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'category-actions';
      
      const shareBtn = document.createElement('button');
      shareBtn.textContent = 'Share';
      shareBtn.title = 'Share';
      shareBtn.onclick = () => window.openShareModal(category);
      
      const remindBtn = document.createElement('button');
      remindBtn.textContent = 'Send reminder';
      remindBtn.title = 'Remind';
      remindBtn.onclick = () => window.openReminderModal(category);
      
      actionsDiv.appendChild(shareBtn);
      actionsDiv.appendChild(remindBtn);
      headerDiv.appendChild(actionsDiv);
    }
    
    categoryCard.appendChild(headerDiv);
    
    // Task list
    const taskList = document.createElement('ul');
    
    if (catData.tasks.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-category';
      emptyState.textContent = 'No tasks yet';
      categoryCard.appendChild(emptyState);
    } else {
      catData.tasks.forEach(task => {
        const li = document.createElement('li');
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => window.toggleTaskHandler(task.id);
        li.appendChild(checkbox);
        
        // Task content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';
        
        // Task title
        const titleSpan = document.createElement('div');
        titleSpan.className = task.completed ? 'task-title completed' : 'task-title';
        titleSpan.textContent = task.task;
        contentDiv.appendChild(titleSpan);
        
        // Image task
        if (task.taskType === 'image' && task.imageUrl) {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'task-image-container';
          
          const img = document.createElement('img');
          img.src = task.imageUrl;
          img.alt = task.task;
          img.className = 'task-image';
          img.onclick = () => window.open(task.imageUrl, '_blank');
          
          imgContainer.appendChild(img);
          contentDiv.appendChild(imgContainer);
        }
        
        // Text task
        if (task.taskType === 'text' && task.textContent) {
          const textContainer = document.createElement('div');
          textContainer.className = 'task-text-container';
          
          const textContent = document.createElement('p');
          textContent.className = 'task-text-content';
          textContent.textContent = task.textContent;
          
          textContainer.appendChild(textContent);
          contentDiv.appendChild(textContainer);
        }
        
        // Task metadata
        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';
        metaDiv.innerHTML = `Created by ${task.username}`;
        
        if (task.completed && task.completedBy) {
          metaDiv.innerHTML += ` • Done by ${task.completedBy}`;
        }
        
        contentDiv.appendChild(metaDiv);
        li.appendChild(contentDiv);
        
        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = () => window.deleteTaskHandler(task.id);
        
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        
        taskList.appendChild(li);
      });
      
      categoryCard.appendChild(taskList);
    }
    
    container.appendChild(categoryCard);
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
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
  if (!container) return;
  container.innerHTML = '';

  const colors = ['blue'];
  let colorIndex = 0;

  Object.keys(tasksByCategory).sort().forEach(category => {
    const catData = tasksByCategory[category];

    // Card
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

    // Category actions
    const categoryActionsDiv = document.createElement('div');
    categoryActionsDiv.className = 'category-actions';

    if (!catData.shared) {
      const shareBtn = document.createElement('button');
      shareBtn.textContent = 'Share';
      shareBtn.onclick = () => window.openShareModal(category);

      const remindBtn = document.createElement('button');
      remindBtn.textContent = 'Send reminder';
      remindBtn.onclick = () => window.openReminderModal(category);

      const deleteFolderBtn = document.createElement('button');
      deleteFolderBtn.textContent = 'Delete Folder';
      deleteFolderBtn.onclick = () => window.deleteFolderHandler(category);

      categoryActionsDiv.appendChild(shareBtn);
      categoryActionsDiv.appendChild(remindBtn);
      categoryActionsDiv.appendChild(deleteFolderBtn);
    }

    headerDiv.appendChild(categoryActionsDiv);
    categoryCard.appendChild(headerDiv);

    // Task list
    const taskList = document.createElement('ul');

    if (!catData.tasks || catData.tasks.length === 0) {
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

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        // Title
        const taskTitleDiv = document.createElement('div');
        taskTitleDiv.className = task.completed ? 'task-title completed' : 'task-title';
        taskTitleDiv.textContent = task.task;
        contentDiv.appendChild(taskTitleDiv);

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

          const textP = document.createElement('p');
          textP.className = 'task-text-content';
          textP.textContent = task.textContent;

          textContainer.appendChild(textP);
          contentDiv.appendChild(textContainer);
        }

        // Metadata
        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        const createdAt = task.createdAt
          ? new Date(task.createdAt).toLocaleString()
          : 'Unknown date';

        metaDiv.innerHTML = `Created by ${task.username} • ${createdAt}`;

        if (task.dueDate) {
          metaDiv.innerHTML += `<br>Due: ${new Date(task.dueDate).toLocaleString()}`;
        }

        if (task.completed && task.completedBy && task.completedAt) {
          metaDiv.innerHTML += `<br>Marked done by ${task.completedBy} at ${new Date(task.completedAt).toLocaleString()}`;
        }

        contentDiv.appendChild(metaDiv);
        li.appendChild(contentDiv);

        // Task actions
        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => window.deleteTaskHandler(task.id);

        taskActionsDiv.appendChild(deleteBtn);
        li.appendChild(taskActionsDiv);

        taskList.appendChild(li);
      });

      categoryCard.appendChild(taskList);
    }

    container.appendChild(categoryCard);
  });
}

export function updateCategorySelect(allCategories) {
  const select = document.getElementById('categorySelect');
  if (!select) return;

  const defaultOption = select.options[0];
  select.innerHTML = '';
  if (defaultOption) select.appendChild(defaultOption);

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
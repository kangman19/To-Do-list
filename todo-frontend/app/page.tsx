'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useReminders } from '@/hooks/useReminders';
import { useUsers } from '@/hooks/useUsers';
import { UserInfoBar } from '@/components/layout/UserInfoBar';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { ShareModal } from '@/components/modals/ShareModal';
import { ReminderModal } from '@/components/modals/ReminderModal';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  
  // Use custom hooks
  const { username, userId, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { 
    tasksByCategory, 
    categoryOwners, 
    allCategories, 
    loadTasks, 
    toggleTask, 
    deleteTask, 
    deleteFolder 
  } = useTasks();
  const { 
    unreadReminders, 
    notificationCount, 
    loadReminders, 
    dismissReminder 
  } = useReminders();
  const { allUsers, loadUsers } = useUsers();

  // Task form state
  const [taskInput, setTaskInput] = useState('');
  const [categorySelect, setCategorySelect] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [taskTypeSelect, setTaskTypeSelect] = useState('list');
  const [dueDateInput, setDueDateInput] = useState('');
  const [textArea, setTextArea] = useState('');
  const [imageInput, setImageInput] = useState<File | null>(null);
  const [taskMessage, setTaskMessage] = useState('');

  // UI state
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [currentShareCategory, setCurrentShareCategory] = useState('');
  const [currentReminderCategory, setCurrentReminderCategory] = useState('');
  const [shareUserSelect, setShareUserSelect] = useState('');
  const [reminderUserSelect, setReminderUserSelect] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  // Load data on auth success
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
      loadUsers();
      loadReminders();
    }
  }, [isAuthenticated]);

  // Handlers
  const toggleNotifications = async () => {
    if (notificationsVisible) {
      setNotificationsVisible(false);
    } else {
      await loadReminders();
      setNotificationsVisible(true);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const category = categorySelect === '__custom__' ? newCategoryInput.trim() : categorySelect;

    if (!category) {
      alert('Please select or create a category');
      return;
    }

    if (taskTypeSelect === 'text' && !textArea.trim()) {
      alert('Please enter text content');
      return;
    }

    if (taskTypeSelect === 'image' && !imageInput) {
      alert('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('task', taskInput);
      formData.append('category', category);
      formData.append('taskType', taskTypeSelect);

      if (categoryOwners[category]) {
        formData.append('ownerId', categoryOwners[category].toString());
      }

      if (taskTypeSelect === 'image' && imageInput) {
        formData.append('image', imageInput);
      } else if (taskTypeSelect === 'text') {
        formData.append('textContent', textArea);
      }

      if (dueDateInput) {
        formData.append('dueDate', new Date(dueDateInput).toISOString());
      }

      await api.tasks.create(formData);

      // Reset form
      setTaskInput('');
      setCategorySelect('');
      setNewCategoryInput('');
      setTaskTypeSelect('list');
      setDueDateInput('');
      setTextArea('');
      setImageInput(null);
      setTaskMessage('');
      
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      setTaskMessage(error instanceof Error ? error.message : 'Network error');
    }
  };

  const confirmShare = async () => {
    if (!shareUserSelect) {
      alert('Please select a user');
      return;
    }

    try {
      await api.shares.create(currentShareCategory, parseInt(shareUserSelect));
      alert('Folder shared successfully!');
      setShareModalVisible(false);
      setShareUserSelect('');
      await loadTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to share folder');
    }
  };

  const confirmSendReminder = async () => {
    if (!reminderUserSelect) {
      alert('Please select a user');
      return;
    }

    try {
      await api.reminders.create(
        parseInt(reminderUserSelect),
        currentReminderCategory,
        reminderMessage || undefined
      );
      alert('Reminder sent successfully!');
      setReminderModalVisible(false);
      setReminderUserSelect('');
      setReminderMessage('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send reminder');
    }
  };

  if (authLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div id="authRequired" style={{ textAlign: 'center', padding: '50px' }}>
        <p>Please <a href="/login">log in</a> to add tasks.</p>
        <p>No account? Register <a href="/signup">here</a></p>
      </div>
    );
  }

  return (
    <>
      <UserInfoBar
        username={username}
        notificationCount={notificationCount}
        onNotificationClick={toggleNotifications}
        onLogout={logout}
      />

      {notificationsVisible && (
        <NotificationPanel
          unreadReminders={unreadReminders}
          onClose={() => setNotificationsVisible(false)}
          onDismiss={dismissReminder}
        />
      )}

      {shareModalVisible && (
        <ShareModal
          category={currentShareCategory}
          allUsers={allUsers}
          currentUserId={userId}
          selectedUserId={shareUserSelect}
          onUserSelect={setShareUserSelect}
          onConfirm={confirmShare}
          onClose={() => {
            setShareModalVisible(false);
            setShareUserSelect('');
          }}
        />
      )}

      {reminderModalVisible && (
        <ReminderModal
          category={currentReminderCategory}
          allUsers={allUsers}
          currentUserId={userId}
          selectedUserId={reminderUserSelect}
          message={reminderMessage}
          onUserSelect={setReminderUserSelect}
          onMessageChange={setReminderMessage}
          onConfirm={confirmSendReminder}
          onClose={() => {
            setReminderModalVisible(false);
            setReminderUserSelect('');
            setReminderMessage('');
          }}
        />
      )}

      <div id="taskForm">
        <h1>To-Do List</h1>

        <form id="addTaskForm" onSubmit={handleTaskSubmit}>
          <input
            id="taskInput"
            placeholder="Enter task title"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            required
          />

          <select
            id="categorySelect"
            value={categorySelect}
            onChange={(e) => {
              setCategorySelect(e.target.value);
              setNewCategoryInput('');
            }}
          >
            <option value="">Select or enter category</option>
            {allCategories.sort().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__custom__">+ Create New Category</option>
          </select>

          {categorySelect === '__custom__' && (
            <input
              id="newCategoryInput"
              placeholder="New category (or existing)"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
            />
          )}

          <select
            id="taskTypeSelect"
            value={taskTypeSelect}
            onChange={(e) => {
              setTaskTypeSelect(e.target.value);
              setTextArea('');
              setImageInput(null);
            }}
          >
            <option value="list">List Item</option>
            <option value="text">Text Note</option>
            <option value="image">Image</option>
          </select>

          <div style={{ marginTop: '10px' }}>
            <label htmlFor="dueDateInput" style={{ fontSize: '14px', color: '#666' }}>
              Due Date (optional):
            </label>
            <input
              type="datetime-local"
              id="dueDateInput"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          {taskTypeSelect === 'text' && (
            <div id="textAreaContainer" style={{ width: '100%', marginTop: '10px' }}>
              <textarea
                id="textArea"
                placeholder="Enter detailed text here..."
                rows={4}
                value={textArea}
                onChange={(e) => setTextArea(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          )}

          {taskTypeSelect === 'image' && (
            <div id="imageInputContainer" style={{ marginTop: '10px' }}>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={(e) => setImageInput(e.target.files?.[0] || null)}
                style={{ padding: '8px' }}
              />
            </div>
          )}

          <button type="submit">Add Task</button>
        </form>

        <p id="taskMessage" style={{ color: 'red' }}>{taskMessage}</p>

        <div id="categoriesContainer">
          {Object.keys(tasksByCategory).sort().map((category) => {
            const catData = tasksByCategory[category];
            return (
              <div key={category} className="category-card" data-color="blue">
                <div className="category-header">
                  <div className="category-title">
                    <h2>{category}</h2>
                    {catData.shared && (
                      <span className="shared-badge">Shared by {catData.sharedBy}</span>
                    )}
                  </div>

                  {!catData.shared && (
                    <div className="category-actions">
                      <button onClick={() => {
                        setCurrentShareCategory(category);
                        setShareModalVisible(true);
                      }}>
                        Share
                      </button>
                      <button onClick={() => {
                        setCurrentReminderCategory(category);
                        setReminderModalVisible(true);
                      }}>
                        Send reminder
                      </button>
                      <button onClick={() => deleteFolder(category)}>
                        Delete Folder
                      </button>
                    </div>
                  )}
                </div>

                {catData.tasks.length === 0 ? (
                  <div className="empty-category">No tasks yet</div>
                ) : (
                  <ul>
                    {catData.tasks.map((task) => (
                      <li key={task.id}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />

                        <div className="task-content">
                          <div className={task.completed ? 'task-title completed' : 'task-title'}>
                            {task.task}
                          </div>

                          {task.taskType === 'image' && task.imageUrl && (
                            <div className="task-image-container">
                              <img
                                src={`${API_URL}${task.imageUrl}`}
                                alt={task.task}
                                className="task-image"
                                onClick={() => window.open(`${API_URL}${task.imageUrl}`, '_blank')}
                              />
                            </div>
                          )}

                          {task.taskType === 'text' && task.textContent && (
                            <div className="task-text-container">
                              <p className="task-text-content">{task.textContent}</p>
                            </div>
                          )}

                          <div className="task-meta">
                            Created by {task.username} • {new Date(task.createdAt).toLocaleString()}
                            {task.dueDate && (
                              <>
                                <br />Due: {new Date(task.dueDate).toLocaleString()}
                              </>
                            )}
                            {task.completed && task.completedBy && task.completedAt && (
                              <>
                                <br />Marked done by {task.completedBy} at {new Date(task.completedAt).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="task-actions">
                          <button onClick={() => deleteTask(task.id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
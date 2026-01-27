'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function HomePage() {
  const router = useRouter();
  
  // Auth state
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Task form state
  const [taskInput, setTaskInput] = useState('');
  const [categorySelect, setCategorySelect] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [taskTypeSelect, setTaskTypeSelect] = useState('list');
  const [dueDateInput, setDueDateInput] = useState('');
  const [textArea, setTextArea] = useState('');
  const [imageInput, setImageInput] = useState<File | null>(null);
  const [taskMessage, setTaskMessage] = useState('');

  // Tasks state
  const [tasksByCategory, setTasksByCategory] = useState<any>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [categoryOwners, setCategoryOwners] = useState<any>({});

  //Notification state
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadReminders, setUnreadReminders] = useState<any[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);

  // Modal state
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [currentShareCategory, setCurrentShareCategory] = useState('');
  const [currentReminderCategory, setCurrentReminderCategory] = useState('');
  const [shareUserSelect, setShareUserSelect] = useState('');
  const [reminderUserSelect, setReminderUserSelect] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);


  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        setUsername(user.username);
        setUserId(user.userId);
        setIsAuthenticated(true);
        
        // Load tasks and users
        await loadTasks();
        await loadUsers();
        await loadReminders();
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  //Loading reminders

// Load unread reminders
const loadReminders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/reminders/unread`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setUnreadReminders(data);
      setNotificationCount(data.length);
    }
  } catch (error) {
    console.error('Error loading reminders:', error);
  }
};

// Toggle notifications panel
const toggleNotifications = async () => {
  if (notificationsVisible) {
    setNotificationsVisible(false);
  } else {
    await loadReminders();
    setNotificationsVisible(true);
  }
};

// Dismiss a reminder
const dismissReminder = async (reminderId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/reminders/${reminderId}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await loadReminders();
    }
  } catch (error) {
    console.error('Error dismissing reminder:', error);
  }
};

//Close notification panel
const closeNotifications = () => {
  setNotificationsVisible(false);
};

//Loading tasks
  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTasksByCategory(data);
        
        // Extract category owners
        const owners: any = {};
        Object.keys(data).forEach(cat => {
          if (data[cat].tasks.length > 0) {
            owners[cat] = data[cat].tasks[0].userId;
          }
        });
        setCategoryOwners(owners);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleTaskSubmit = async (e: FormEvent) => {
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('task', taskInput);
      formData.append('category', category);
      formData.append('taskType', taskTypeSelect);

      if (categoryOwners[category]) {
        formData.append('ownerId', categoryOwners[category]);
      }

      if (taskTypeSelect === 'image' && imageInput) {
        formData.append('image', imageInput);
      } else if (taskTypeSelect === 'text') {
        formData.append('textContent', textArea);
      }

      if (dueDateInput) {
        formData.append('dueDate', new Date(dueDateInput).toISOString());
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        // Reset form
        setTaskInput('');
        setCategorySelect('');
        setNewCategoryInput('');
        setTaskTypeSelect('list');
        setDueDateInput('');
        setTextArea('');
        setImageInput(null);
        setTaskMessage('');
        
        // Reload tasks
        await loadTasks();
      } else {
        const data = await response.json();
        setTaskMessage(data.message || 'Error adding task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setTaskMessage('Network error');
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteFolder = async (category: string) => {
    if (!confirm(`Delete the entire folder "${category}" and all its tasks?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/folder/${encodeURIComponent(category)}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const openShareModal = (category: string) => {
    setCurrentShareCategory(category);
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
    setShareUserSelect('');
  };

  const confirmShare = async () => {
    if (!shareUserSelect) {
      alert('Please select a user');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shares`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: currentShareCategory,
          sharedWithUserId: parseInt(shareUserSelect)
        })
      });

      if (response.ok) {
        alert('Folder shared successfully!');
        closeShareModal();
        await loadTasks();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sharing folder:', error);
    }
  };

  const openReminderModal = (category: string) => {
    setCurrentReminderCategory(category);
    setReminderModalVisible(true);
  };

  const closeReminderModal = () => {
    setReminderModalVisible(false);
    setReminderUserSelect('');
    setReminderMessage('');
  };

  const confirmSendReminder = async () => {
    if (!reminderUserSelect) {
      alert('Please select a user');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: parseInt(reminderUserSelect),
          category: currentReminderCategory,
          message: reminderMessage || null
        })
      });

      if (response.ok) {
        alert('Reminder sent successfully!');
        closeReminderModal();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  // Get unique categories for dropdown
  const allCategories = Object.keys(tasksByCategory);

  if (loading) {
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
      {/* User Info Section */}
      <div id="userInfo">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#f5f5f5' }}>
          <p style={{ margin: 0 }}>Welcome, <strong>{username}</strong></p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Notification button */}
            <button
        id="notificationBtn"
        onClick={toggleNotifications}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          position: 'relative'
        }}
      >
        🔔
        {notificationCount > 0 && (
          <span
            id="notificationBadge"
            style={{
              display: 'block',
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              lineHeight: '20px'
            }}
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

            {/* Logout button */}
            <button onClick={handleLogout} style={{ padding: '8px 12px', cursor: 'pointer', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {notificationsVisible && (
        <div
          id="notificationPanel"
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            width: '350px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '15px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <button
              onClick={closeNotifications}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
          </div>

          {unreadReminders.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No new reminders</p>
          ) : (
            <div id="reminderList">
              {unreadReminders.map((reminder: any) => (
                <div
                  key={reminder.id}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                    borderLeft: '4px solid #667eea'
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{reminder.senderUsername}</strong> sent you a reminder
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    Category: <strong>{reminder.category}</strong>
                  </div>
                  {reminder.message && (
                    <div style={{ fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>
                      "{reminder.message}"
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                    {new Date(reminder.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => dismissReminder(reminder.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareModalVisible && (
        <div
          id="shareModal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              width: '400px',
              maxWidth: '90%'
            }}
          >
            <h3>Share "{currentShareCategory}" with:</h3>
            <select
              value={shareUserSelect}
              onChange={(e) => setShareUserSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}
            >
              <option value="">Select a user</option>
              {allUsers
                .filter(u => u.id !== userId)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmShare}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Share
              </button>
              <button
                onClick={closeShareModal}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModalVisible && (
        <div
          id="reminderModal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              width: '400px',
              maxWidth: '90%'
            }}
          >
            <h3>Send reminder for "{currentReminderCategory}"</h3>
            <select
              value={reminderUserSelect}
              onChange={(e) => setReminderUserSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}
            >
              <option value="">Select a user</option>
              {allUsers
                .filter(u => u.id !== userId)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
            <textarea
              placeholder="Optional message"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmSendReminder}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
              <button
                onClick={closeReminderModal}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form */}
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

          {/* Due Date Input */}
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="dueDateInput" style={{ fontSize: '14px', color: '#666' }}>Due Date (optional):</label>
            <input
              type="datetime-local"
              id="dueDateInput"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Text input (shown when taskType is 'text') */}
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

          {/* Image input (shown when taskType is 'image') */}
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

        {/* Categories Container */}
        <div id="categoriesContainer">
          {Object.keys(tasksByCategory).sort().map((category) => {
            const catData = tasksByCategory[category];
            return (
              <div key={category} className="category-card" data-color="blue">
                {/* Category Header */}
                <div className="category-header">
                  <div className="category-title">
                    <h2>{category}</h2>
                    {catData.shared && (
                      <span className="shared-badge">Shared by {catData.sharedBy}</span>
                    )}
                  </div>

                  {/* Category Actions */}
                  {!catData.shared && (
                    <div className="category-actions">
                      <button onClick={() => openShareModal(category)}>Share</button>
                      <button onClick={() => openReminderModal(category)}>Send reminder</button>
                      <button onClick={() => handleDeleteFolder(category)}>Delete Folder</button>
                    </div>
                  )}
                </div>

                {/* Task List */}
                {catData.tasks.length === 0 ? (
                  <div className="empty-category">No tasks yet</div>
                ) : (
                  <ul>
                    {catData.tasks.map((task: any) => (
                      <li key={task.id}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                        />

                        <div className="task-content">
                          <div className={task.completed ? 'task-title completed' : 'task-title'}>
                            {task.task}
                          </div>

                          {/* Image task */}
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

                          {/* Text task */}
                          {task.taskType === 'text' && task.textContent && (
                            <div className="task-text-container">
                              <p className="task-text-content">{task.textContent}</p>
                            </div>
                          )}

                          {/* Metadata */}
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
                          <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
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
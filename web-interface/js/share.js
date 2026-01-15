import { loadTasks } from './tasks.js';
import { categoryOwners } from './categories.js';

let allUsers = [];
let currentShareCategory = null;

export async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      allUsers = await response.json();
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

export function openShareModal(category) {
  currentShareCategory = category;
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
  currentShareCategory = null;
}

export async function confirmShare() {
  const userId = document.getElementById('shareUserSelect').value;
  if (!userId) return alert('Please select a user');

  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/shares', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        category: currentShareCategory, 
        sharedWithUserId: parseInt(userId)
      })
    });

    if (response.ok) {
      alert('Folder shared successfully!');
      closeShareModal();
      loadTasks();
    } else {
      const result = await response.json();
      alert(result.message || 'Error sharing folder');
    }
  } catch (error) {
    console.error('Error sharing folder:', error);
    alert('Network error');
  }
}

// Close modal if user clicks outside
window.onclick = function(event) {
  const modal = document.getElementById('shareModal');
  if (event.target == modal) {
    closeShareModal();
  }
};

// Make functions available globally for inline handlers
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.confirmShare = confirmShare;
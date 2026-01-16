let socket = null;

export function initializeSocket(onTaskUpdate, onReminderReceived) {
  socket = io();
  const token = localStorage.getItem('token');
  
  socket.emit('authenticate', token);
  
  socket.on('taskCreated', (data) => {
    console.log('Task created:', data.task);
    onTaskUpdate();
  });

  socket.on('taskToggled', (data) => {
    console.log('Task toggled:', data.task);
    onTaskUpdate();
  });

  socket.on('taskDeleted', (data) => {
    console.log('Task deleted:', data.taskId);
    onTaskUpdate();
  });

  socket.on('reminderReceived', (data) => {
    console.log('Reminder received:', data);
    if (onReminderReceived) {
      onReminderReceived();
    }
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated:', data);
  });
}

export function getSocket() {
  return socket;
}
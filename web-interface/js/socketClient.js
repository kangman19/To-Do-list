import { socket } from './socket.js';

export function initializeSocket(onTasksUpdated) {
  socket.on('taskCreated', (data) => {
    console.log('Task created:', data.task);
    onTasksUpdated();
  });

  socket.on('taskToggled', (data) => {
    console.log('Task toggled:', data.task);
    onTasksUpdated();
  });

  socket.on('taskDeleted', (data) => {
    console.log('Task deleted:', data.taskId);
    onTasksUpdated();
  });

  socket.on('taskReminder', (data) => {
    console.log('Task reminder:', data);
  });

  socket.on('taskShared', (data) => {
    console.log('Task shared:', data);
    onTasksUpdated();
  });
}

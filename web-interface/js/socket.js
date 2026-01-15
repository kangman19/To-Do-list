import { loadTasks } from './tasks.js';

const socket = io();
const token = localStorage.getItem('token');

socket.emit('authenticate', token);

socket.on('taskCreated', (data) => {
  console.log('Task created:', data.task);
  loadTasks();
});

socket.on('taskToggled', (data) => {
  console.log('Task toggled:', data.task);
  loadTasks();
});

socket.on('taskDeleted', (data) => {
  console.log('Task deleted:', data.taskId);
  loadTasks();
});

export { socket };
const socket = io();
const token = localStorage.getItem('token');

socket.emit('authenticate', token);

export { socket };
const socket = io();
const token = localStorage.getItem('token'); //grabs token from server

socket.emit('authenticate', token);

export { socket };
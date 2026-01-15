import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { connectDatabase } from './config/database.js';
import passport from './config/passport.js'; 
import { SocketService } from './services/socketService';
import { createRouter } from './routes/index.js';
import { PORT } from './utils/constants.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Initialize socket service
const socketService = new SocketService(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Static files
app.use(express.static('web-interface'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web-interface/home.html'));
});

// Routes
app.use('/', createRouter(socketService));

// Connect to database
connectDatabase();

// Start server
server.listen(PORT, () => {
  console.log(`App running here: http://localhost:${PORT}`);
});
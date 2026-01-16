import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { connectDatabase } from './config/database.js';
import passport from './config/passport.js';
import { createRouter } from './routes/index.js';
import { SocketService } from './services/socketService.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { PORT } from './utils/constants.js';

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Initialize Socket Service
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

// Home page route 
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../web-interface/home.html'));
});

// API routes 
app.use(createRouter(socketService));

// Error handling 
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    server.listen(PORT, () => {
      console.log(`App running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
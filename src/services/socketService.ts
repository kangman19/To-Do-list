import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants.js';
import { JwtPayload, TaskWithUser } from '../types/index.js';
import { Task, Share } from '../models/index.js';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export class SocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log('User connected:', socket.id);

      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
          socket.userId = decoded.userId;
          socket.username = decoded.username;

          // Join rooms for owned categories
          await this.joinUserRooms(socket);

          socket.emit('authenticated', { success: true });
        } catch (err) {
          console.error('Socket auth error:', err);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

//1
public async joinCategoryRoom(userId: number, category: string) {
  // Find all sockets for this user and make them join the new category room
  const sockets = await this.io.in(`user_${userId}`).fetchSockets();
  sockets.forEach(socket => {
    socket.join(`category_${userId}_${category}`);
  });
}

  private async joinUserRooms(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    // Join user-specific room for reminders
    socket.join(`user_${socket.userId}`);

    // Join rooms for owned categories
    const userTasks = await Task.findAll({
      where: { userId: socket.userId },
      attributes: ['category'],
      group: ['category']
    });
    const userCategories = [...new Set(userTasks.map((t: any) => t.category))];
    userCategories.forEach(cat => {
      socket.join(`category_${socket.userId}_${cat}`);
    });

    // Join rooms for shared categories
    const sharedCategories = await Share.findAll({
      where: { sharedWithUserId: socket.userId }
    });
    sharedCategories.forEach((share: any) => {
      socket.join(`category_${share.ownerId}_${share.category}`);
    });
  }

  // Emit task created event
  public emitTaskCreated(userId: number, category: string, task: TaskWithUser) {
    const roomName = `category_${userId}_${category}`;
    this.io.to(roomName).emit('taskCreated', { task, category });
  }

  // Emit task toggled event
  public emitTaskToggled(userId: number, category: string, task: TaskWithUser) {
    const roomName = `category_${userId}_${category}`;
    this.io.to(roomName).emit('taskToggled', { task, category });
  }

  // Emit task deleted event
  public emitTaskDeleted(userId: number, category: string, taskId: number) {
    const roomName = `category_${userId}_${category}`;
    this.io.to(roomName).emit('taskDeleted', { taskId, category });
  }

  // Emit reminder sent event
  public emitReminderSent(receiverId: number) {
    const roomName = `user_${receiverId}`;
    this.io.to(roomName).emit('reminderReceived', { timestamp: new Date() });
  }
}
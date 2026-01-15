import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants.js';
import { JwtPayload } from '../types/index.js';
import { Task, Share } from '../models/index.js';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export interface TaskWithUser {
  id: number;
  userId: number;
  task: string;
  category: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
  username: string;
  completedBy: string | null;
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

  private async joinUserRooms(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const userTasks = await Task.findAll({
      where: { userId: socket.userId },
      attributes: ['category'],
      group: ['category']
    });

    const categories = [...new Set(userTasks.map((t: any) => t.category))];

    categories.forEach(category => {
      socket.join(`category_${socket.userId}_${category}`);
    });

    const shared = await Share.findAll({
      where: { sharedWithUserId: socket.userId }
    });

    shared.forEach((share: any) => {
      socket.join(`category_${share.ownerId}_${share.category}`);
    });
  }

  public emitTaskCreated(userId: number, category: string, task: TaskWithUser) {
    this.io.to(`category_${userId}_${category}`).emit('taskCreated', {
      task,
      category
    });
  }

  public emitTaskToggled(userId: number, category: string, task: TaskWithUser) {
    this.io.to(`category_${userId}_${category}`).emit('taskToggled', {
      task,
      category
    });
  }

  public emitTaskDeleted(userId: number, category: string, taskId: number) {
    this.io.to(`category_${userId}_${category}`).emit('taskDeleted', {
      taskId,
      category
    });
  }
}

export const setupSocketIO = (app: any) => {
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  const socketService = new SocketService(io);

  // Attach socketService to app for controllers to use
  (app as any).socketService = socketService;

  return server;
};
import { Router } from 'express';
import authRoutes from './auth.js';
import { createTaskRouter } from './tasks.js';
import shareRoutes from './shares.js';
import userRoutes from './users.js';
import reminderRoutes from './reminder.js';
import { UserController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { SocketService } from '../services/socketService.js';

export const createRouter = (socketService: SocketService) => {
  const router = Router();
  const userController = new UserController();
  router.use('/api/reminders', reminderRoutes);

  // Auth routes
  router.use('/auth', authRoutes);
  
  // User info routes (kept in auth for backward compatibility)
  router.get('/auth/user', requireAuth, userController.getCurrentUser);
  router.post('/auth/logout', userController.logout);

  // API routes
  router.use('/api/tasks', createTaskRouter(socketService));
  router.use('/api/shares', shareRoutes);
  router.use('/api/users', userRoutes);
  router.use('/api/reminders', reminderRoutes);

  return router;
};
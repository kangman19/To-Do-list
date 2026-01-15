import { Router } from 'express';
import authRoutes from './auth';
import { createTaskRouter } from './tasks';
import shareRoutes from './shares';
import userRoutes from './users';
import { UserController } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { SocketService } from '../services/socketService.js';

export const createRouter = (socketService: SocketService) => {
  const router = Router();
  const userController = new UserController();

  // Auth routes
  router.use('/auth', authRoutes);
  
  // User info routes (kept in auth for backward compatibility)
  router.get('/auth/user', requireAuth, userController.getCurrentUser);
  router.post('/auth/logout', userController.logout);

  // API routes
  router.use('/api/tasks', createTaskRouter(socketService));
  router.use('/api/shares', shareRoutes);
  router.use('/api/users', userRoutes);

  return router;
};

const router = createRouter(null as any); // Placeholder for SocketService
export default router;
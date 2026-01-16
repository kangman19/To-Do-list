import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { SocketService } from '../services/socketService.js';

export const createTaskRouter = (socketService: SocketService) => {
  const router = Router();
  const taskController = new TaskController(socketService);

  // All routes require authentication
  router.use(requireAuth);

  // GET /api/tasks - Get all tasks
  router.get('/', taskController.getTasks);

  // POST /api/tasks - Create a new task (with optional image upload)
  router.post('/', upload.single('image'), taskController.createTask);

  // POST /api/tasks/:taskId/toggle - Toggle task completion
  router.post('/:taskId/toggle', taskController.toggleTask);

  // POST /api/tasks/:taskId/delete - Delete a task
  router.post('/:taskId/delete', taskController.deleteTask);

  return router;
};
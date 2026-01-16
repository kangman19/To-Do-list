import { Response } from 'express';
import { AuthRequest, CreateTaskBody } from '../types/index.js';
import { TaskService } from '../services/taskService.js';
import { SocketService } from '../services/socketService.js';

export class TaskController {
  private taskService: TaskService;
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.taskService = new TaskService();
    this.socketService = socketService;
  }

  // Get all tasks
  getTasks = async (req: AuthRequest, res: Response) => {
    try {
      const tasksByCategory = await this.taskService.getUserTasks(req.user.userId);
      res.json(tasksByCategory);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

  // Create task
  createTask = async (req: AuthRequest, res: Response) => {
    try {
      const { task, category, ownerId, taskType } = req.body;
      const file = (req as any).file; // Multer adds file to request

      if (!task) {
        return res.status(400).json({ message: 'Task is required' });
      }

      let imageUrl = null;
      if (file) {
        imageUrl = `/uploads/${file.filename}`;
      }

      const result = await this.taskService.createTask(
        req.user.userId,
        task,
        category,
        ownerId,
        taskType,
        imageUrl
      );

      // Emit socket event
      this.socketService.emitTaskCreated(result.userId, result.category, result.task);

      res.status(201).json({ 
        message: 'Task added successfully', 
        task: result.task 
      });
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ message: 'Failed to create task' });
    }
  };

  // Toggle task
  toggleTask = async (req: AuthRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);

      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID' });
      }

      const result = await this.taskService.toggleTask(taskId, req.user.userId);

      // Emit socket event
      this.socketService.emitTaskToggled(result.userId, result.category, result.task);

      res.json({ 
        message: 'Task toggled successfully', 
        task: result.task 
      });
    } catch (err: any) {
      console.error('Error toggling task:', err);
      if (err.message === 'Task not found') {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: 'Failed to toggle task' });
    }
  };

  // Delete task
  deleteTask = async (req: AuthRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);

      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID' });
      }

      const result = await this.taskService.deleteTask(taskId);

      // Emit socket event
      this.socketService.emitTaskDeleted(result.userId, result.category, taskId);

      res.json({ message: 'Task deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      if (err.message === 'Task not found') {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: 'Failed to delete task' });
    }
  };
}
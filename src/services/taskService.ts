// src/services/taskService.ts
import { Task, User, Share } from '../models/index.js';

export class TaskService {
  // Get user's own tasks and shared tasks
  async getUserTasks(userId: number) {
    // Get user's own tasks
    const userTasks = await Task.findAll({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['username'] },
        { model: User, as: 'completedByUser', attributes: ['username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const tasksByCategory: any = {};

    userTasks.forEach((task: any) => {
      const category = task.category || 'Uncategorized';
      if (!tasksByCategory[category]) {
        tasksByCategory[category] = { tasks: [], shared: false, sharedBy: null };
      }

      const taskData: any = task.toJSON();
      taskData.username = taskData.user?.username || 'Unknown';
      taskData.completedBy = taskData.completedByUser?.username || null;
      delete taskData.user;
      delete taskData.completedByUser;

      tasksByCategory[category].tasks.push(taskData);
    });

    // Get shared tasks
    const sharedCategories = await Share.findAll({
      where: { sharedWithUserId: userId },
      include: [{ model: User, as: 'owner', attributes: ['username'] }]
    });

    for (const share of sharedCategories) {
      const sharedTasks = await Task.findAll({
        where: { userId: share.ownerId, category: share.category },
        include: [
          { model: User, as: 'user', attributes: ['username'] },
          { model: User, as: 'completedByUser', attributes: ['username'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formattedSharedTasks = sharedTasks.map((task: any) => {
        const taskData: any = task.toJSON();
        taskData.username = taskData.user?.username || 'Unknown';
        taskData.completedBy = taskData.completedByUser?.username || null;
        delete taskData.user;
        delete taskData.completedByUser;
        return taskData;
      });

      tasksByCategory[share.category] = {
        tasks: formattedSharedTasks,
        shared: true,
        sharedBy: (share as any).owner?.username || 'Unknown'
      };
    }

    return tasksByCategory;
  }

  // Create a new task
  async createTask(
    userId: number,
    task: string,
    category?: string,
    ownerId?: number
  ) {
    const taskUserId = ownerId || userId;

    const newTask = await Task.create({
      id: Date.now(),
      userId: taskUserId,
      task,
      category: category || 'Uncategorized',
      createdAt: new Date(),
      completed: false,
      completedAt: null,
      completedById: null
    });

    const taskWithUser = await Task.findByPk(newTask.id, {
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });

    if (!taskWithUser) {
      throw new Error('Task not found after creation');
    }

    const taskData: any = taskWithUser.toJSON();
    taskData.username = taskData.user?.username || 'Unknown';
    taskData.completedBy = null;
    delete taskData.user;

    return {
      task: taskData,
      userId: taskUserId,
      category: newTask.category
    };
  }

  // Toggle task completion
  async toggleTask(taskId: number, userId: number) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    task.completed = !task.completed;

    if (task.completed) {
      task.completedAt = new Date();
      task.completedById = userId;
    } else {
      task.completedAt = null;
      task.completedById = null;
    }

    await task.save();

    const taskWithUser = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'user', attributes: ['username'] },
        { model: User, as: 'completedByUser', attributes: ['username'] }
      ]
    });

    if (!taskWithUser) {
      throw new Error('Task not found after update');
    }

    const taskData: any = taskWithUser.toJSON();
    taskData.username = taskData.user?.username || 'Unknown';
    taskData.completedBy = taskData.completedByUser?.username || null;
    delete taskData.user;
    delete taskData.completedByUser;

    return {
      task: taskData,
      category: task.category,
      userId: task.userId
    };
  }

  // Delete a task
  async deleteTask(taskId: number) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const taskData = {
      userId: task.userId,
      category: task.category
    };

    await task.destroy();

    return taskData;
  }
}
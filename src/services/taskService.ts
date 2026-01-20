import { User, Task, Share } from '../models/index.js';
import { TasksByCategory, TaskWithUser } from '../types/index.js';

export class TaskService {
  // Get all tasks for a user (owned + shared)
  async getUserTasks(userId: number): Promise<TasksByCategory> {
    // Get user's own tasks
    const userTasks = await Task.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username']
        },
        {
          model: User,
          as: 'completedByUser',
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get shared categories
    const sharedCategories = await Share.findAll({
      where: { sharedWithUserId: userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['username']
      }]
    });

    // Group tasks by category
    const tasksByCategory: TasksByCategory = {};

    userTasks.forEach((task: any) => {
      const category = task.category || 'Uncategorized';
      if (!tasksByCategory[category]) {
        tasksByCategory[category] = { tasks: [], shared: false, sharedBy: null };
      }

      const taskData: any = task.toJSON();
      const formattedTask: TaskWithUser = {
        ...taskData,
        username: taskData.user?.username || 'Unknown',
        completedBy: taskData.completedByUser?.username || null
      };
      delete (formattedTask as any).user;
      delete (formattedTask as any).completedByUser;

      tasksByCategory[category].tasks.push(formattedTask);
    });

    // Add shared category tasks
    for (const share of sharedCategories) {
      const sharedTasks = await Task.findAll({
        where: {
          userId: share.ownerId,
          category: share.category
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username']
          },
          {
            model: User,
            as: 'completedByUser',
            attributes: ['username']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formattedSharedTasks = sharedTasks.map((task: any) => {
        const taskData: any = task.toJSON();
        const formattedTask: TaskWithUser = {
          ...taskData,
          username: taskData.user?.username || 'Unknown',
          completedBy: taskData.completedByUser?.username || null
        };
        delete (formattedTask as any).user;
        delete (formattedTask as any).completedByUser;
        return formattedTask;
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
    category: string,
    ownerId?: number,
    taskType?: string,
    imageUrl?: string,
    textContent?: string,
    dueDate?: string | null
  ): Promise<any> {
    const taskUserId = ownerId || userId;

    console.log('TaskService.createTask - Preparing to create task with:', {
      taskUserId,
      task,
      category: category || 'Uncategorized',
      taskType: taskType || 'list',
      imageUrl: imageUrl || null,
      textContent: textContent || null,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    try {
      // Create task without manually setting ID
      const newTask = await Task.create({
        userId: taskUserId,
        task,
        category: category || 'Uncategorized',
        createdAt: new Date(),
        completed: false,
        completedAt: null,
        completedById: null,
        taskType: taskType || 'list',
        imageUrl: imageUrl || null,
        textContent: textContent || null,
        dueDate: dueDate ? new Date(dueDate) : null
      });

      console.log('TaskService.createTask - Task created with ID:', newTask.id);

      const taskWithUser = await Task.findByPk(newTask.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['username']
        }]
      });

      if (!taskWithUser) {
        throw new Error('Task not found after creation');
      }

      const taskData: any = taskWithUser.toJSON();
      taskData.username = taskData.user?.username || 'Unknown';
      delete taskData.user;

      console.log('TaskService.createTask - Returning formatted task:', taskData);

      return {
        task: taskData,
        userId: taskUserId,
        category: newTask.category
      };
    } catch (error: any) {
      console.error('TaskService.createTask - Error details:', {
        message: error.message,
        name: error.name,
        sql: error.sql,
        original: error.original
      });
      throw error;
    }
  }

  // Toggle task completion
  async toggleTask(taskId: number, userId: number): Promise<any> {
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
        {
          model: User,
          as: 'user',
          attributes: ['username']
        },
        {
          model: User,
          as: 'completedByUser',
          attributes: ['username']
        }
      ]
    });

    if (!taskWithUser) {
      throw new Error('Task not found after update');
    }

    const taskData: any = taskWithUser.toJSON();
    const formattedTask: TaskWithUser = {
      ...taskData,
      username: taskData.user?.username || 'Unknown',
      completedBy: taskData.completedByUser?.username || null
    };
    delete (formattedTask as any).user;
    delete (formattedTask as any).completedByUser;

    return {
      task: formattedTask,
      userId: task.userId,
      category: task.category
    };
  }

  // Delete a task
  async deleteTask(taskId: number): Promise<{ userId: number; category: string }> {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const deletedTaskData = {
      userId: task.userId,
      category: task.category
    };

    await task.destroy();

    return deletedTaskData;
  }

  //Delete folder/category
  async deleteFolder(userId: number, category: string): Promise<void> {
    await Task.destroy({
      where: {
        userId,
        category
      }
    });
  }
}
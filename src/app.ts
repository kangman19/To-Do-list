import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { Op } from 'sequelize';
import { sequelize, User, Task, Share } from './models/index.js';
import authRoutes from '../routes/auth.js';
import { JwtPayload, AuthRequest } from './types'; 

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Extend Socket interface
interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport JWT Strategy
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, (payload: JwtPayload, done) => {
  return done(null, payload);
}));

app.use(passport.initialize());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Static files
app.use(express.static('web-interface'));

// Routes
app.use('/auth', authRoutes);

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Socket.io connection handling
io.on('connection', (socket: AuthenticatedSocket) => {
  console.log('User connected:', socket.id);
  
  socket.on('authenticate', async (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      const userTasks = await Task.findAll({ 
        where: { userId: socket.userId },
        attributes: ['category'],
        group: ['category']
      });                                                  //any adds explicit types
      const userCategories = [...new Set(userTasks.map((t: any) => t.category))]; 
      userCategories.forEach(cat => {
        socket.join(`category_${socket.userId}_${cat}`);
      });
      
      const sharedCategories = await Share.findAll({ 
        where: { sharedWithUserId: socket.userId }
      });
      sharedCategories.forEach((share: any) => {
        socket.join(`category_${share.ownerId}_${share.category}`);
      });
      
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

// Get current user info
app.get('/auth/user', 
  passport.authenticate('jwt', { session: false }), 
  (req: AuthRequest, res: Response) => {
    res.json({ 
      userId: req.user?.userId, 
      username: req.user?.username 
    });
  }
);

// Logout endpoint
app.post('/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// Home page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../web-interface/home.html'));
});

// Get user's tasks by category
app.get('/api/tasks', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userTasks = await Task.findAll({ 
        where: { userId: req.user.userId },
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
      
      const sharedCategories = await Share.findAll({ 
        where: { sharedWithUserId: req.user.userId },
        include: [{
          model: User,
          as: 'owner',
          attributes: ['username']
        }]
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

      res.json(tasksByCategory);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  }
);

// Add task
app.post('/api/tasks', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { task, category, ownerId } = req.body;

      if (!task) {
        return res.status(400).json({ message: 'Task is required' });
      }

      const userId = ownerId || req.user.userId;

      const newTask = await Task.create({
        id: Date.now(),
        userId: userId,
        task,
        category: category || 'Uncategorized',
        createdAt: new Date(),
        completed: false,
        completedAt: null,
        completedById: null
      });

      const taskWithUser = await Task.findByPk(newTask.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['username']
        }]
      });

      if (taskWithUser) {
        const taskData: any = taskWithUser.toJSON();
        taskData.username = taskData.user?.username || req.user.username;
        delete taskData.user;

        const roomName = `category_${userId}_${newTask.category}`;
        io.to(roomName).emit('taskCreated', { task: taskData, category: newTask.category });

        res.status(201).json({ message: 'Task added successfully', task: taskData });
      }
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ message: 'Failed to create task' });
    }
  }
);

// Delete task
app.post('/api/tasks/:taskId/delete', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest<{ taskId: string }>, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await Task.findByPk(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const deletedTaskData = {
        userId: task.userId,
        category: task.category
      };

      await task.destroy();
      
      const roomName = `category_${deletedTaskData.userId}_${deletedTaskData.category}`;
      io.to(roomName).emit('taskDeleted', { taskId: taskId, category: deletedTaskData.category });
      
      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  }
);

// Toggle task completion
app.post('/api/tasks/:taskId/toggle', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const taskId = parseInt(req.params.taskId);
      const task = await Task.findByPk(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.completed = !task.completed;

      if (task.completed) {
        task.completedAt = new Date();
        task.completedById = req.user.userId;
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

      if (taskWithUser) {
        const taskData: any = taskWithUser.toJSON();
        taskData.username = taskData.user?.username || 'Unknown';
        taskData.completedBy = taskData.completedByUser?.username || null;
        delete taskData.user;
        delete taskData.completedByUser;

        const roomName = `category_${task.userId}_${task.category}`;
        io.to(roomName).emit('taskToggled', { task: taskData, category: task.category });
        
        res.json({ message: 'Task toggled successfully', task: taskData });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      res.status(500).json({ message: 'Failed to toggle task' });
    }
  }
);

// Get list of all users
app.get('/api/users', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const users = await User.findAll({
        where: {
          id: { [Op.ne]: req.user.userId }
        },
        attributes: ['id', 'username']
      });

      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
);

// Share a category
app.post('/api/shares', 
  passport.authenticate('jwt', { session: false }), 
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { category, sharedWithUserId } = req.body;

      if (!category || !sharedWithUserId) {
        return res.status(400).json({ message: 'Category and user are required' });
      }

      const existing = await Share.findOne({
        where: {
          ownerId: req.user.userId,
          category: category,
          sharedWithUserId: sharedWithUserId
        }
      });

      if (existing) {
        return res.status(409).json({ message: 'Already shared with this user' });
      }

      const share = await Share.create({
        id: Date.now(),
        ownerId: req.user.userId,
        category,
        sharedWithUserId,
        createdAt: new Date()
      });

      res.status(201).json({ message: 'Folder shared successfully', share });
    } catch (err) {
      console.error('Error creating share:', err);
      res.status(500).json({ message: 'Failed to create share' });
    }
  }
);

server.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
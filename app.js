const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {origin: "*", methods: ["GET", "POST"]}
})
const PORT = 3000;

// Import Sequelize models
const { sequelize, User, Task, Share } = require('./models');

const authRoutes = require('./routes/auth');

// Middleware BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Passport JWT Strategy
const JWT_SECRET = 'your_jwt_secret_key';

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}, (payload, done) => {
  return done(null, payload);
}));

app.use(passport.initialize());

// Add logging middleware
app.use((req, res, next) => { 
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.static('web-interface'));

// Routes AFTER middleware
app.use('/auth', authRoutes);

// Test database connection on startup
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      // Join rooms for owned categories
      const userTasks = await Task.findAll({ 
        where: { userId: socket.userId },
        attributes: ['category'],
        group: ['category']
      });
      const userCategories = [...new Set(userTasks.map(t => t.category))];
      userCategories.forEach(cat => {
        socket.join(`category_${socket.userId}_${cat}`);
      });
      
      // Join rooms for shared categories
      const sharedCategories = await Share.findAll({ 
        where: { sharedWithUserId: socket.userId }
      });
      sharedCategories.forEach(share => {
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

// Endpoint to get current user info
app.get('/auth/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ 
    userId: req.user.userId, 
    username: req.user.username 
  });
});

// Endpoint to logout
app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Home page (View tasks)
app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'web-interface/home.html'));
});

// API endpoint to get user's tasks by category (including shared folders)
app.get('/api/tasks', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Get user's own tasks
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
    
    // Get shared categories for this user
    const sharedCategories = await Share.findAll({ 
      where: { sharedWithUserId: req.user.userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['username']
      }]
    });
    
    // Group tasks by category
    const tasksByCategory = {};
    
    // REPLACE THE OLD forEach WITH THIS ONE:
    userTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!tasksByCategory[category]) {
        tasksByCategory[category] = { tasks: [], shared: false, sharedBy: null };
      }
      
      // Format the task data
      const taskData = task.toJSON();
      taskData.username = taskData.user?.username || 'Unknown';
      taskData.completedBy = taskData.completedByUser?.username || null;
      delete taskData.user;
      delete taskData.completedByUser;
      
      tasksByCategory[category].tasks.push(taskData);
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
      
      // Format shared tasks
      const formattedSharedTasks = sharedTasks.map(task => {
        const taskData = task.toJSON();
        taskData.username = taskData.user?.username || 'Unknown';
        taskData.completedBy = taskData.completedByUser?.username || null;
        delete taskData.user;
        delete taskData.completedByUser;
        return taskData;
      });
      
      tasksByCategory[share.category] = {
        tasks: formattedSharedTasks,
        shared: true,
        sharedBy: share.owner.username
      };
    }

    res.json(tasksByCategory);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});



// API endpoint to add task
app.post('/api/tasks', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { task, category, ownerId } = req.body;

    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }

    // If adding to a shared folder, set userId to the owner
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

    // Fetch the task with user info to send via socket
const taskWithUser = await Task.findByPk(newTask.id, {    // ← Fetch the task we just created
  include: [{
    model: User,
    as: 'user',                                            // ← Join with User table
    attributes: ['username']
  }]
});

const taskData = taskWithUser.toJSON();                    // ← Convert to plain JS
taskData.username = taskData.user?.username || req.user.username;  // ← Extract username
delete taskData.user;                                      // ← Remove nested object

    // Emit to owner's room so both owner and sharees see the new task
    const roomName = `category_${userId}_${newTask.category}`;
    io.to(roomName).emit('taskCreated', { task: taskData, category: newTask.category }); //When creating a new task, fetch it back with the username so Socket.io can send the complete data to all connected users.

    res.status(201).json({ message: 'Task added successfully', task: newTask });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// API endpoint to remove task
app.post('/api/tasks/:taskId/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
    
    // Emit to owner's room so both owner and sharees see the deletion
    const roomName = `category_${deletedTaskData.userId}_${deletedTaskData.category}`;
    io.to(roomName).emit('taskDeleted', { taskId: taskId, category: deletedTaskData.category });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

//API endpoint to toggle task completion
app.post('/api/tasks/:taskId/toggle', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
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

    // Fetch task with user info to send via socket
const taskWithUser = await Task.findByPk(taskId, {         //Fetch the updated task
  include: [
    {
      model: User,
      as: 'user',                                          //Get creator username
      attributes: ['username']
    },
    {
      model: User,
      as: 'completedByUser',                               //Get completer username
      attributes: ['username']
    }
  ]
});

const taskData = taskWithUser.toJSON();                    // Convert to plain JS
taskData.username = taskData.user?.username || 'Unknown';           // Extract creator username
taskData.completedBy = taskData.completedByUser?.username || null;  // Extract completer username
delete taskData.user;                                      // Remove nested objects
delete taskData.completedByUser;

    // Emit to the owner's room which includes owner and shared users 
    const roomName = `category_${task.userId}_${task.category}`;
    io.to(roomName).emit('taskToggled', { task: taskData, category: task.category });
    res.json({message: 'Task toggled successfully', task: taskData})
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ message: 'Failed to toggle task' });
  }
});

// API endpoint to get list of all users (for sharing)
app.get('/api/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [require('sequelize').Op.ne]: req.user.userId }
      },
      attributes: ['id', 'username']
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// API endpoint to share a category with a user
app.post('/api/shares', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { category, sharedWithUserId } = req.body;

    if (!category || !sharedWithUserId) {
      return res.status(400).json({ message: 'Category and user are required' });
    }

    // Check if already shared
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
});

// API endpoint to unshare a category
/* app.delete('/api/shares/:shareId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const shareId = parseInt(req.params.shareId);
    const share = await Share.findOne({
      where: {
        id: shareId,
        ownerId: req.user.userId
      }
    });

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    await share.destroy();
    res.json({ message: 'Share deleted successfully' });
  } catch (err) {
    console.error('Error deleting share:', err);
    res.status(500).json({ message: 'Failed to delete share' });
  }
}); */

server.listen(PORT, () => {
  console.log(`App successfully running at http://localhost:${PORT}`);
});
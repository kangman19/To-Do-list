const { Sequelize } = require('sequelize');

// Initialize Sequelize connection
const sequelize = new Sequelize('todo_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Doesn't spam the terminal with every SQL query running
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./users')(sequelize);
const Task = require('./tasks')(sequelize);
const Share = require('./shares')(sequelize);

// Define associations
// User has many Tasks
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks'
});
Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Task belongs to User (for completedBy)
Task.belongsTo(User, {
  foreignKey: 'completedById',
  as: 'completedByUser'
});

// Share belongs to User (owner)
Share.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// Share belongs to User (shared with)
Share.belongsTo(User, {
  foreignKey: 'sharedWithUserId',
  as: 'sharedWithUser'
});

// User has many Shares (as owner)
User.hasMany(Share, {
  foreignKey: 'ownerId',
  as: 'sharedByMe'
});

// User has many Shares (as recipient)
User.hasMany(Share, {
  foreignKey: 'sharedWithUserId',
  as: 'sharedWithMe'
});

module.exports = {
  sequelize,
  User,
  Task,
  Share
};
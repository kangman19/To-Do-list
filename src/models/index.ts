import { Sequelize } from 'sequelize';
import UserModel from './users';
import TaskModel from './tasks';
import ShareModel from './shares';
import ReminderModel from './reminders';

// Initialize Sequelize
const sequelize = new Sequelize('todo_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Initialize models
const User = UserModel(sequelize);
const Task = TaskModel(sequelize);
const Share = ShareModel(sequelize);
const Reminder = ReminderModel(sequelize);

// Define associations
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Task.belongsTo(User, { 
  foreignKey: 'completedById', 
  as: 'completedByUser' 
});

User.hasMany(Share, { foreignKey: 'ownerId', as: 'ownedShares' });
User.hasMany(Share, { foreignKey: 'sharedWithUserId', as: 'receivedShares' });

Share.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Share.belongsTo(User, { foreignKey: 'sharedWithUserId', as: 'sharedWith' });

// Reminder associations
User.hasMany(Reminder, { foreignKey: 'senderId', as: 'sentReminders' });
User.hasMany(Reminder, { foreignKey: 'receiverId', as: 'receivedReminders' });

Reminder.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Reminder.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

export { sequelize, User, Task, Share, Reminder };
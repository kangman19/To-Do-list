import { Sequelize } from 'sequelize';
import UserModel, { User } from '../models/users';
import TaskModel, { Task } from '../models/tasks';
import ShareModel, { Share } from '../models/shares';

const sequelize = new Sequelize('todo_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize models
const UserInstance = UserModel(sequelize);
const TaskInstance = TaskModel(sequelize);
const ShareInstance = ShareModel(sequelize);

// Define associations
// User has many Tasks
UserInstance.hasMany(TaskInstance, {
  foreignKey: 'userId',
  as: 'tasks'
});
TaskInstance.belongsTo(UserInstance, {
  foreignKey: 'userId',
  as: 'user'
});

// Task belongs to User (for completedBy)
TaskInstance.belongsTo(UserInstance, {
  foreignKey: 'completedById',
  as: 'completedByUser'
});

// Share belongs to User (owner)
ShareInstance.belongsTo(UserInstance, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// Share belongs to User (shared with)
ShareInstance.belongsTo(UserInstance, {
  foreignKey: 'sharedWithUserId',
  as: 'sharedWithUser'
});

// User has many Shares (as owner)
UserInstance.hasMany(ShareInstance, {
  foreignKey: 'ownerId',
  as: 'sharedByMe'
});

// User has many Shares (as recipient)
UserInstance.hasMany(ShareInstance, {
  foreignKey: 'sharedWithUserId',
  as: 'sharedWithMe'
});

export {
  sequelize,
  UserInstance as User,
  TaskInstance as Task,
  ShareInstance as Share
};
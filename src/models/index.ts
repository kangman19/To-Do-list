// src/models/index.ts
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

// Define associations (keep all your associations here)
// ... all the associations ...

export {
  sequelize,
  UserInstance as User,
  TaskInstance as Task,
  ShareInstance as Share
};
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { TaskAttributes } from '../types';

type TaskCreationAttributes = Optional<
  TaskAttributes,
  | 'id'
  | 'completed'
  | 'completedAt'
  | 'completedById'
  | 'taskType'
  | 'imageUrl'
  | 'textContent'
  | 'dueDate'
>;

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public userId!: number;
  public task!: string;
  public category!: string;
  public createdAt!: Date;
  public completed!: boolean;
  public completedAt!: Date | null;
  public completedById!: number | null;

  // Optional at TS level, defaulted at DB level
  public taskType?: string; // 'list' | 'text' | 'image'
  public imageUrl?: string | null;
  public textContent?: string | null;
  public dueDate?: Date | null;
}

export default (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      task: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Uncategorized'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedById: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      taskType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'list'
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      textContent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    
    {
      sequelize,
      tableName: 'tasks',
      timestamps: false
    }
  );

  return Task;
};

export { Task };

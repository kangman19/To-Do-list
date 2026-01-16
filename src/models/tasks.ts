import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { TaskAttributes } from '../types';

type TaskCreationAttributes = Optional<TaskAttributes, 'id' | 'completed' | 'completedAt' | 'completedById'>;

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public userId!: number;
  public task!: string;
  public category!: string;
  public createdAt!: Date;
  public completed!: boolean;
  public completedAt!: Date | null;
  public completedById!: number | null;
  public taskType?: string;
  public imageUrl?: string | null;
}

export default (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true
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


    },
    {
      sequelize,
      tableName: 'tasks',
      timestamps: false
    }
  );

  return Task;
};
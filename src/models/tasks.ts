import { DataTypes, Model, Sequelize } from 'sequelize';

export interface TaskAttributes {
  id: number;
  userId: number;
  task: string;
  category: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
}

export class Task extends Model<TaskAttributes> implements TaskAttributes {
  public id!: number;
  public userId!: number;
  public task!: string;
  public category!: string;
  public createdAt!: Date;
  public completed!: boolean;
  public completedAt!: Date | null;
  public completedById!: number | null;
}

export default (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      task: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
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
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      tableName: 'tasks',
      timestamps: false,
      indexes: [
        { fields: ['userId'] },
        { fields: ['category'] },
        { fields: ['userId', 'category'] }
      ]
    }
  );

  return Task;
};
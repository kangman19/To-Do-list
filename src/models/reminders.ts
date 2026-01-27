import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ReminderAttributes {
  id: number;
  senderId: number;
  receiverId: number;
  category: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
}

export class Reminder extends Model<ReminderAttributes> implements ReminderAttributes {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public category!: string;
  public message!: string | null;
  public isRead!: boolean;
  public createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  Reminder.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,  // Add auto-increment
        allowNull: false
      },
      senderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiverId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'reminders',
      timestamps: false,
      indexes: [
        { fields: ['receiverId'] },
        { fields: ['senderId'] },
        { fields: ['receiverId', 'isRead'] }
      ]
    }
  );

  return Reminder;
};
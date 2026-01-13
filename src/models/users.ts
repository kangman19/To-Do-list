import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: number;
  username: string;
  email: string | null;
  password: string;
  createdAt: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string | null;
  public password!: string;
  public createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false
    }
  );

  return User;
};
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ShareAttributes {
  id: number;
  category: string;
  ownerId: number;
  sharedWithUserId: number;
  createdAt: Date;
}

export class Share extends Model<ShareAttributes> implements ShareAttributes {
  public id!: number;
  public category!: string;
  public ownerId!: number;
  public sharedWithUserId!: number;
  public createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  Share.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      ownerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      sharedWithUserId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'shares',
      timestamps: false,
      indexes: [
        { fields: ['ownerId'] },
        { fields: ['sharedWithUserId'] },
        { fields: ['ownerId', 'category'] },
        {
          unique: true,
          fields: ['ownerId', 'category', 'sharedWithUserId']
        }
      ]
    }
  );

  return Share;
};
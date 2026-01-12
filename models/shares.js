const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Share = sequelize.define('Share', {
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
      },
      onDelete: 'CASCADE'
    },
    sharedWithUserId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'shares',
    timestamps: false,
    indexes: [
      {
        fields: ['ownerId']
      },
      {
        fields: ['sharedWithUserId']
      },
      {
        fields: ['ownerId', 'category']
      },
      {
        unique: true,
        fields: ['ownerId', 'category', 'sharedWithUserId']
      }
    ]
  });

  return Share;
};
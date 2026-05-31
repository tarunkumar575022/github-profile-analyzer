const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Repository = sequelize.define('Repository', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profile_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  repo_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  language: {
    type: DataTypes.STRING(100)
  },
  stars: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  forks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  watchers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_forked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  repo_url: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'repositories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Repository;

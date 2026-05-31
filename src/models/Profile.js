const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200)
  },
  bio: {
    type: DataTypes.TEXT
  },
  avatar_url: {
    type: DataTypes.STRING(500)
  },
  github_url: {
    type: DataTypes.STRING(500)
  },
  public_repos: {
    type: DataTypes.INTEGER
  },
  followers: {
    type: DataTypes.INTEGER
  },
  following: {
    type: DataTypes.INTEGER
  },
  total_stars: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_forks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  most_used_language: {
    type: DataTypes.STRING(100)
  },
  top_repo_name: {
    type: DataTypes.STRING(200)
  },
  top_repo_stars: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  account_created_at: {
    type: DataTypes.DATE
  },
  last_analyzed_at: {
    type: DataTypes.DATE
  },
  // Additional field for JSON language breakdown
  top_languages: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Profile;

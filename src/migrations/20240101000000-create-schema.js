'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(200)
      },
      bio: {
        type: Sequelize.TEXT
      },
      avatar_url: {
        type: Sequelize.STRING(500)
      },
      github_url: {
        type: Sequelize.STRING(500)
      },
      public_repos: {
        type: Sequelize.INTEGER
      },
      followers: {
        type: Sequelize.INTEGER
      },
      following: {
        type: Sequelize.INTEGER
      },
      total_stars: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_forks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      most_used_language: {
        type: Sequelize.STRING(100)
      },
      top_repo_name: {
        type: Sequelize.STRING(200)
      },
      top_repo_stars: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      account_created_at: {
        type: Sequelize.DATE
      },
      last_analyzed_at: {
        type: Sequelize.DATE
      },
      top_languages: {
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.createTable('repositories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      repo_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      language: {
        type: Sequelize.STRING(100)
      },
      stars: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      forks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      watchers: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_forked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      repo_url: {
        type: Sequelize.STRING(500)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('repositories');
    await queryInterface.dropTable('profiles');
  }
};

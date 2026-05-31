const Profile = require('./Profile');
const Repository = require('./Repository');

// Define associations
Profile.hasMany(Repository, {
  foreignKey: 'profile_id',
  as: 'repositories',
  onDelete: 'CASCADE'
});

Repository.belongsTo(Profile, {
  foreignKey: 'profile_id',
  as: 'profile'
});

module.exports = {
  Profile,
  Repository
};

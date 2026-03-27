const { sequelize, Sequelize } = require('../config/db-config');

const User = require('./user-model')(sequelize);

module.exports = {
    User,
    sequelize,
    Sequelize: sequelize.Sequelize
}
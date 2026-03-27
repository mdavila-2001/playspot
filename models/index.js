const { sequelize, Sequelize } = require('../config/db-config');

const User = require('./user.model')(sequelize);
const CourtType = require('./court-type.model')(sequelize);
const Court = require('./court.model')(sequelize);


Court.belongsTo(CourtType, {
    foreignKey: 'court_type_id',
    as: 'type'
});
CourtType.hasMany(Court, {
    foreignKey: 'court_type_id',
    as: 'courts'
});

module.exports = {
    User,
    sequelize,
    Sequelize: sequelize.Sequelize
}
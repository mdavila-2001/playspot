const { sequelize, Sequelize } = require('../config/db-config');

const User = require('./user.model')(sequelize);
const CourtType = require('./court-type.model')(sequelize);
const Court = require('./court.model')(sequelize);
const Schedule = require('./schedule.model')(sequelize);
const Booking = require('./booking.model')(sequelize);
const Review = require('./review.model')(sequelize);

CourtType.hasMany(Court, {
    foreignKey: 'court_type_id',
    as: 'courts'
});
Court.belongsTo(CourtType, {
    foreignKey: 'court_type_id',
    as: 'type'
});

Court.hasMany(Schedule, {
    foreignKey: 'court_id',
    as: 'schedules'
});
Schedule.belongsTo(Court, {
    foreignKey: 'court_id',
    as: 'court'
});

User.hasMany(Booking, {
    foreignKey: 'user_id',
    as: 'bookings'
});
Booking.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Schedule.hasMany(Booking, {
    foreignKey: 'schedule_id',
    as: 'bookings'
});
Booking.belongsTo(Schedule, {
    foreignKey: 'schedule_id',
    as: 'schedule'
});

User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews'
});
Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Court.hasMany(Review, {
    foreignKey: 'court_id',
    as: 'reviews'
});
Review.belongsTo(Court, {
    foreignKey: 'court_id',
    as: 'court'
});

module.exports = {
    User,
    CourtType,
    Court,
    Schedule,
    Booking,
    Review,
    sequelize,
    Sequelize: sequelize.Sequelize
}
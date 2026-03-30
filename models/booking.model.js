const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Booking = sequelize.define(
        'Booking',
        {
            status: {
                type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
                allowNull: false,
                defaultValue: 'confirmed'
            }
        },
        {
            tableName: 'bookings',
            timestamps: true
        }
    );
    return Booking;
}
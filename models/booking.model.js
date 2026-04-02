const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Booking = sequelize.define(
        'Booking',
        {
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
                allowNull: false,
                defaultValue: 'confirmed'
            },
            is_reviewed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            tableName: 'bookings',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['schedule_id', 'date', 'user_id']
                }
            ]
        }
    );
    return Booking;
};
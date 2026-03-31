const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Booking = sequelize.define(
        'Booking',
        {
            // La fecha específica que el cliente quiere reservar
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
                allowNull: false,
                defaultValue: 'confirmed'
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
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
            // schedule_id: FK al slot/plantilla (de qué hora a qué hora)
            // user_id: FK del cliente
            // Ambos FK vienen de las asociaciones en models/index.js
        },
        {
            tableName: 'bookings',
            timestamps: true,
            indexes: [
                // Índice único: un cliente no puede reservar el mismo slot en la misma fecha dos veces
                {
                    unique: true,
                    fields: ['schedule_id', 'date', 'user_id']
                }
            ]
        }
    );
    return Booking;
};
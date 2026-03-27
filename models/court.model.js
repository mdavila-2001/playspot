const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Court = sequelize.define(
        'Court',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price_per_hour: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            tableName: 'courts',
            timestamps: true
        }
    );
    return Court;
};
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Schedule = sequelize.define(
        'Schedule',
        {
            fecha: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            end_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            disponible: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            tableName: 'schedules',
            timestamps: true,
        }
    );
    return Schedule;
};
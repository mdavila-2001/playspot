const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Schedule = sequelize.define(
        'Schedule',
        {
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            isAvailable: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            tableName: 'schedules',
            timestamps: true,
            indexes: [
                {
                    fields: ['date', 'isAvailable']
                }
            ]
        }
    );
    return Schedule;
}
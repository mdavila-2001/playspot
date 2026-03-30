const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Schedule = sequelize.define(
        'Schedule',
        {
            day_of_week: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: { min: 0, max: 6 }
            },
            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            end_time: {
                type: DataTypes.TIME,
                allowNull: false,
            }
        },
        {
            tableName: 'schedules',
            timestamps: true,
        }
    );
    return Schedule;
};
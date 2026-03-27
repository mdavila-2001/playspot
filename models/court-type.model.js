const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CourtType = sequelize.define(
        "CourtType", {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            tableName: 'court_types',
            timestamps: true,
        }
    );

    return CourtType;
};
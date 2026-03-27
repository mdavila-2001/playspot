const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Review = sequelize.define(
        'Review',
        {
            rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5
                }
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: [0, 500]
                }
            }
        },
        {
            tableName: 'reviews',
            timestamps: true
        }
    );
    return Review;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class subscription_plans extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    subscription_plans.init({
        country_id: DataTypes.INTEGER,
        user_plan_amount: DataTypes.INTEGER,
        user_plan_length: DataTypes.INTEGER,
        artist_withdraw_amount: DataTypes.INTEGER,
        status : DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'subscription_plans',
    });
    return subscription_plans;
};
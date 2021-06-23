'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user_subscriptions extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    user_subscriptions.init({
        user_id: DataTypes.INTEGER,
        customer_id: DataTypes.STRING,
        subscription_id: DataTypes.STRING,
        invoice_id: DataTypes.STRING,
        price_id: DataTypes.STRING,
        product_id: DataTypes.STRING,
        price: DataTypes.INTEGER,
        currency: DataTypes.STRING,
        subscription_interval: DataTypes.STRING,
        subscription_interval_length : DataTypes.STRING,
        status : DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'user_subscriptions',
    });
    return user_subscriptions;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Countries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Countries.init({
    name: DataTypes.STRING,
    country_code: DataTypes.STRING,
    currency_code: DataTypes.STRING,
    currency_name: DataTypes.STRING,
    currency_symbol: DataTypes.STRING,
    telephone_code: DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    stripe_type: DataTypes.INTEGER,
    user_plan_amount: DataTypes.INTEGER,
    user_plan_length: DataTypes.INTEGER,
    artist_withdraw_amount: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'countries',
  });
  return Countries;
};
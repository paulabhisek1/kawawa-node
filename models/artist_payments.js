'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class artist_payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  artist_payments.init({
    artist_id: DataTypes.INTEGER,
    current_balance: DataTypes.INTEGER,
    already_paid: DataTypes.INTEGER,
    last_payment_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'artist_payments',
  });
  return artist_payments;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class artist_payment_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  artist_payment_details.init({
    artist_payment_id: DataTypes.INTEGER,
    payment_id: DataTypes.INTEGER,
    transaction_id: DataTypes.INTEGER,
    transaction_date: DataTypes.DATE,
    transaction_amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'artist_payment_details',
  });
  return artist_payment_details;
};
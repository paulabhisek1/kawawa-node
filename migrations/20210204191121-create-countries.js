'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('countries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      country_code: {
        type: Sequelize.STRING
      },
      currency_code: {
        type: Sequelize.STRING
      },
      currency_name: {
        type: Sequelize.STRING
      },
      currency_symbol: {
        type: Sequelize.STRING
      },
      telephone_code: {
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '0 => Inactive, 1 => Active'
      },
      stripe_type: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '1:- US, 2:- UK, 3:- IN, 4:- AU, 5:- BR,SG, 6:- CA, 7:- HK, 8:- JP, 9:- NZ,MY, 10:- MX, 11:- IBAN'
      },
      user_plan_amount: {
        type: Sequelize.INTEGER,
        comment: 'Amount For User'
      },
      user_plan_length: {
        type: Sequelize.INTEGER,
        comment: 'In Days'
      },
      artist_withdraw_amount: {
        type: Sequelize.INTEGER,
        comment: 'Withdrawl Amount For Artist'
      },
      createdAt: {
        allowNull: false,
        defaultValue : Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        defaultValue : Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Countries');
  }
};
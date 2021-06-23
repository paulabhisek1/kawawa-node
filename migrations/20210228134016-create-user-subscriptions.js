'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      customer_id: {
        type: Sequelize.STRING
      },
      subscription_id: {
        type: Sequelize.STRING
      },
      invoice_id: {
        type: Sequelize.STRING
      },
      price_id: {
        type: Sequelize.STRING
      },
      product_id: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      currency: {
        type: Sequelize.STRING
      },
      subscription_interval: {
        type: Sequelize.STRING
      },
      subscription_interval_length: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('user_subscriptionsuser_subscriptions');
  }
};
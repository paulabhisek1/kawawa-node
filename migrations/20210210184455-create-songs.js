'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Songs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      cover_picture: {
        type: Sequelize.STRING
      },
      length: {
        type: Sequelize.INTEGER
      },
      file_name: {
        type: Sequelize.STRING
      },
      details: {
        type: Sequelize.STRING
      },
      artist_id: {
        type: Sequelize.INTEGER
      },
      album_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_paid: {
        type: Sequelize.INTEGER
      },
      country_id: {
        type: Sequelize.INTEGER
      },
      genre_id: {
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '0 => Inactive, 1 => Active'
      },
      price: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        defaultValue: 'song'
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
    await queryInterface.dropTable('Songs');
  }
};
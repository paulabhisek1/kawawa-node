'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class cms_entities extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    cms_entities.init({
        privacy_policy: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'cms_entities',
    });
    return cms_entities;
};
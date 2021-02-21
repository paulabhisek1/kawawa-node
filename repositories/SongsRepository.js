const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const SongsModel = require('../models/songs')(sequelize, DataTypes);

// Find All
module.exports.findAll = (whereData) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const AdminsModel = require('../models/admins')(sequelize,DataTypes);

// Find One
module.exports.findOne = (whereData) => {
    return new Promise((resolve, reject) => {
        AdminsModel.findOne({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
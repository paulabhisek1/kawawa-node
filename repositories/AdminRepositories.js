const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const AdminsModel = require('../models/admins')(sequelize,DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);

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

// Find One
module.exports.countAdmin = (whereData) => {
    return new Promise((resolve, reject) => {
        AdminsModel.count({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.addCountry = (data) => {
    return new Promise((resolve, reject) => {
        CountryModel.create(data).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.countCountry = (whereData) => {
    return new Promise((resolve, reject) => {
        CountryModel.count({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.listCountry = (whereData, data) => {
    return new Promise((resolve, reject) => {
        CountryModel.findAndCountAll({
            where: whereData,
            limit: data.limit,
            offset: data.offset,
            group: ['id'],
            order: [['id', 'DESC'], ['is_active','DESC']]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
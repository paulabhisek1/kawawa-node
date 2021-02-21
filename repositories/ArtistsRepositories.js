const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);

// Associations
ArtistModel.belongsTo(CountryModel, { foreignKey: 'country_id' });


// Count
module.exports.count = (whereData) => {
    return new Promise((resolve, reject) => {
        ArtistModel.count(whereData).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find One
module.exports.findOne = (whereData) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findOne({
            where: whereData,
            include: [{
                model: CountryModel,
            }]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Create 
module.exports.create = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistModel.create(data, options)
            .then((result) => {
                result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

// Update
module.exports.update = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Find All
module.exports.findAll = (whereData) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAll({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
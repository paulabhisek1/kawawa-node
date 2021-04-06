const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const AlbumModel = require('../models/albums')(sequelize, DataTypes);

// Find All
module.exports.findAll = (where, data) => {
    return new Promise((resolve, reject) => {
        AlbumModel.findAll({
            where: where,
            order: [
                ['createdAt', 'desc']
            ],
            limit: data.limit,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
module.exports.count = (where) => {
    return new Promise((resolve, reject) => {
        AlbumModel.count({
            where: where,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
module.exports.findAndCountAll = (where, data) => {
    return new Promise((resolve, reject) => {
        AlbumModel.findAndCountAll({
            where: where,
            order: [
                ['createdAt', 'desc']
            ],
            limit: data.limit,
            offset: data.offset,
            group: ['id']
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.createAlbum = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
            //if trunsaction exist
        if (t != null) options.transaction = t;
        AlbumModel.create(data, options)
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
        AlbumModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}
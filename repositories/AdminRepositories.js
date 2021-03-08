const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const AdminsModel = require('../models/admins')(sequelize,DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const GenreModel = require('../models/genres')(sequelize, DataTypes);

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

// Count Admin
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

// Add Country
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

// Count Country
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

// Fetch Country
module.exports.fetchCountry = (whereData) => {
    return new Promise((resolve, reject) => {
        CountryModel.findOne({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Update Country
module.exports.updateCountry = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        CountryModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// List Country
module.exports.listCountry = (whereData, data) => {
    return new Promise((resolve, reject) => {
        CountryModel.findAndCountAll({
            where: whereData,
            limit: data.limit,
            offset: data.offset,
            group: ['id'],
            order: [ ['is_active','DESC'], ['id', 'DESC']]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Add Genre
module.exports.addGenre = (data) => {
    return new Promise((resolve, reject) => {
        GenreModel.create(data).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Count Genre
module.exports.countGenre = (whereData) => {
    return new Promise((resolve, reject) => {
        GenreModel.count({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Fetch Genre Details
module.exports.fetchGenre = (whereData) => {
    return new Promise((resolve, reject) => {
        GenreModel.findOne({
            where: whereData
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Update Genre
module.exports.updateGenre = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        GenreModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Delete Genre
module.exports.deleteGenre = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        GenreModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// List Genre
module.exports.listGenre = (whereData, data) => {
    return new Promise((resolve, reject) => {
        GenreModel.findAndCountAll({
            where: whereData,
            limit: data.limit,
            offset: data.offset,
            group: ['id'],
            order: [['id', 'DESC']]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
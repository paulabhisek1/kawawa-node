const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);
const FavouritesModel = require('../models/favourites')(sequelize, DataTypes);
const FollowedArtistsModel = require('../models/followed_artists')(sequelize, DataTypes);

// Associations
ArtistModel.belongsTo(CountryModel, { foreignKey: 'country_id' });
SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });
SongsModel.hasOne(FavouritesModel, { foreignKey: 'file_id', as: 'is_favourite' });
ArtistModel.hasOne(FollowedArtistsModel, { foreignKey: 'artist_id', as: 'is_followed' });


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

// Artist Details
module.exports.artistDetails = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findOne({
            where: whereData,
            attributes: ['id','full_name','profile_image'],
            include: [
                {
                    model: FollowedArtistsModel,
                    as: 'is_followed',
                    where: { user_id: data.user_id },
                    required: false
                }
            ]
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

// Find All
module.exports.artistList = (whereData) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAll({
            where: whereData,
            attributes: ['id','full_name','profile_image']
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
module.exports.artistListPaginate = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAndCountAll({
            where: whereData,
            attributes: ['id','full_name','profile_image'],
            offset: data.offset,
            limit: data.limit,
            group: ['id']
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Follow Artist
module.exports.followArtist = (data) => {
    return new Promise((resolve, reject) => {
        FollowedArtistsModel.create(data)
            .then((result) => {
                result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

// Unfollow Artist
module.exports.unfollowArtist = (where) => {
    return new Promise((resolve, reject) => {
        FollowedArtistsModel.destroy({
            where: where
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Fetch Follow Details
module.exports.followDetails = (where) => {
    return new Promise((resolve, reject) => {
        FollowedArtistsModel.findOne({
                where: where
            })
            .then((result) => {
                result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    })
}




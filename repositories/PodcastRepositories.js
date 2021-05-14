const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');

const PodcastsModel = require('../models/podcasts')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const PodcastCategoryModel = require('../models/podcast_categories')(sequelize, DataTypes);

PodcastsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
PodcastsModel.belongsTo(CountryModel, { foreignKey: 'country_id', as: 'country_details' });
PodcastsModel.belongsTo(PodcastCategoryModel, { foreignKey: 'category_id', as: 'podcast_category_details' });
PodcastsModel.belongsTo(PodcastCategoryModel, { foreignKey: 'category_id', as: 'category_details' });


// Create
module.exports.create = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
        //if trunsaction exist
        if (t != null) options.transaction = t;
        PodcastsModel.create(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Count
module.exports.count = (where) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.count({
            where: where,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Podcast Details
module.exports.podcastDetails = (where) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findOne({
            where: where,
            include: [{
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type']
                },
                {
                    model: PodcastCategoryModel,
                    as: 'category_details',
                    attributes: ['id', 'name']
                },
                {
                    model: CountryModel,
                    as: 'country_details',
                }
            ],
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Podcast List
module.exports.podcastsList = (where, data) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findAndCountAll({
            where: where,
            order: [
                ['createdAt', 'desc']
            ],
            include: [{
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type']
                },
                {
                    model: PodcastCategoryModel,
                    as: 'category_details',
                    attributes: ['id', 'name']
                },
                {
                    model: CountryModel,
                    as: 'country_details',
                }
            ],
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

// Update
module.exports.update = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        PodcastsModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Destroy
module.exports.delete = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        PodcastsModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Find One
module.exports.findOne = (where) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findOne({
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
module.exports.findAllPodcastCategory = (whereData) => {
    return new Promise((resolve, reject) => {
        PodcastCategoryModel.findAll(whereData).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.userPodcastList = (where, data) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findAndCountAll({
            where: where,
            attributes: [
                'id', 
                'name', 
                'cover_picture', 
                'file_name', 
                'length', 
                'is_paid', 
                'type', 
                'artist_id', 
                'category_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = podcasts.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = podcasts.id AND favourites.type = 'podcast')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = podcasts.id AND downloads.type = 'podcast')`), 'isDownloaded'],
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type']
                },
                {
                    model: PodcastCategoryModel,
                    as: 'podcast_category_details',
                    attributes: ['id', 'name']
                },
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

module.exports.userPodcastSearchList = (where, data) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findAll({
            where: where,
            attributes: [
                'id', 
                'name', 
                'cover_picture', 
                'file_name', 
                'length', 
                'is_paid', 
                'type', 
                'artist_id', 
                'category_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = podcasts.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = podcasts.id AND favourites.type = 'podcast')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = podcasts.id AND downloads.type = 'podcast')`), 'isDownloaded'],
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type']
                },
                {
                    model: PodcastCategoryModel,
                    as: 'podcast_category_details',
                    attributes: ['id', 'name']
                },
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



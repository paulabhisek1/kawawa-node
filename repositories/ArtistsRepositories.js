const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);
const FavouritesModel = require('../models/favourites')(sequelize, DataTypes);
const FollowedArtistsModel = require('../models/followed_artists')(sequelize, DataTypes);
const ArtistDetailsModel = require('../models/artist_details')(sequelize, DataTypes);
const DownloadsModel = require('../models/downloads')(sequelize, DataTypes);
const UserPlayedModel = require('../models/user_played_histories')(sequelize, DataTypes);
const PodcastsModel = require('../models/podcasts')(sequelize, DataTypes);
const commonService = require('../helpers/commonFunctions');
const _ = require('lodash');

// Associations
ArtistModel.belongsTo(CountryModel, { foreignKey: 'country_id' });
SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });
SongsModel.hasOne(FavouritesModel, { foreignKey: 'file_id', as: 'is_favourite' });
ArtistModel.hasOne(FollowedArtistsModel, { foreignKey: 'artist_id', as: 'is_followed' });
ArtistModel.hasOne(ArtistDetailsModel, { foreignKey: 'artist_id', as: 'artist_account_details' });
ArtistDetailsModel.belongsTo(GenresModel, { foreignKey: 'sample_song_type', as: 'sample_song_type_details' });
ArtistDetailsModel.belongsTo(AlbumsModel, { foreignKey: 'sample_song_album', as: 'sample_song_album_details' });
ArtistDetailsModel.belongsTo(CountryModel, { foreignKey: 'bank_country', as: 'country_details' });
DownloadsModel.belongsTo(SongsModel, { foreignKey: 'file_id', as: 'download_song_details' });
DownloadsModel.belongsTo(PodcastsModel, { foreignKey: 'file_id', as: 'download_podcast_details' });
UserPlayedModel.belongsTo(SongsModel, { foreignKey: 'file_id', as: 'played_song_details' });
UserPlayedModel.belongsTo(PodcastsModel, { foreignKey: 'file_id', as: 'played_podcast_details' });
ArtistModel.belongsTo(FollowedArtistsModel, { foreignKey: 'artist_id', as: 'is_artist_followed' });


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
            attributes: [
                'id',
                'full_name',
                'email',
                'dob',
                'profile_image',
                'country_id',
                'mobile_no',
                'is_active',
                'login_type', [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = ${whereData.id})`), 'isFollowedArtist'],
            ],
            include: [{
                model: ArtistDetailsModel,
                as: 'artist_account_details',
                include: [{
                        model: GenresModel,
                        as: 'sample_song_type_details'
                    },
                    {
                        model: AlbumsModel,
                        as: 'sample_song_album_details'
                    }
                ],
                required: false
            }]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Artist Details Admin
module.exports.artistDetailsAdmin = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findOne({
            where: whereData,
            attributes: ['id', 'full_name', 'email', 'mobile_no', 'dob', 'login_type', 'is_active', 'current_reg_step', 'reg_steps_completed', 'profile_image', 'country_id'],
            include: [{
                    model: ArtistDetailsModel,
                    as: 'artist_account_details',
                    include: [{
                            model: CountryModel,
                            as: 'country_details'
                        },
                        {
                            model: GenresModel,
                            as: 'sample_song_type_details'
                        },
                        {
                            model: AlbumsModel,
                            as: 'sample_song_album_details'
                        }
                    ],
                    required: false
                },
                {
                    model: CountryModel,
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

// Delete Artist Details
module.exports.deleteArtistDetails = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistDetailsModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Count Artist Details
module.exports.countArtistDetails = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistDetailsModel.count(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

// Create Artist Details
module.exports.createArtistDetails = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistDetailsModel.create(data, options)
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
module.exports.updateArtist = (where, data, t = null) => {
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

// Update
module.exports.updateArtistDetails = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
                where: where
            }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        ArtistDetailsModel.update(data, options).then((result) => {
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
            attributes: ['id', 'full_name', 'profile_image']
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
module.exports.artistListSearch = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAll({
            where: whereData,
            attributes: ['id', 'full_name', 'profile_image'],
            limit: data.limit
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
module.exports.followedArtistList = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAndCountAll({
            where: whereData,
            include: [{
                model: FollowedArtistsModel,
                where: { user_id: data.user_id },
                as: 'is_followed',
                required: true
            }],
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

// Find All
module.exports.artistListPaginate = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAndCountAll({
            where: whereData,
            // attributes: ['id', 'full_name', 'profile_image'],
            include: [{
                model: FollowedArtistsModel,
                where: { user_id: data.user_id },
                as: 'is_artist_followed',
                required: false
            }],
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

// Find All
module.exports.artistListAdmin = (whereData, data) => {
    return new Promise((resolve, reject) => {
        ArtistModel.findAndCountAll({
            where: whereData,
            order: [
                ['createdAt', 'desc']
            ],
            attributes: ['id', 'full_name', 'email', 'mobile_no', 'profile_image', 'is_active', 'current_reg_step', 'login_type', 'reg_steps_completed'],
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

module.exports.followedArtistsList = (where) => {
    return new Promise((resolve, reject) => {
        FollowedArtistsModel.findAll({
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

module.exports.artistGraphSong = (where, data) => {
    return new Promise((resolve, reject) => {
        DownloadsModel.findAll({
                where: where,
                attributes: [
                    [sequelize.fn('count', sequelize.col('downloads.id')), 'downloadCount'],
                    [sequelize.fn('date_format', sequelize.col('downloads.createdAt'), '%Y-%m-%d'), 'date']
                ],
                include: [{
                    model: SongsModel,
                    where: { artist_id: data.artistID },
                    attributes: [],
                    as: 'download_song_details',
                    required: true
                }],
                group: [sequelize.literal(`date`)],
                order: [
                    [sequelize.literal(`date`), 'DESC']
                ]
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

module.exports.artistGraphSongListen = (where, data) => {
    return new Promise((resolve, reject) => {
        UserPlayedModel.findAll({
                where: where,
                attributes: [
                    [sequelize.fn('count', sequelize.col('user_played_histories.id')), 'playedCount'],
                    [sequelize.fn('date_format', sequelize.col('user_played_histories.updatedAt'), '%Y-%m-%d'), 'date']
                ],
                include: [{
                    model: SongsModel,
                    where: { artist_id: data.artistID },
                    attributes: [],
                    as: 'played_song_details',
                    required: true
                }],
                group: [sequelize.literal(`date`)],
                order: [
                    [sequelize.literal(`date`), 'DESC']
                ]
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

module.exports.artistGraphPodcast = (where, data) => {
    return new Promise((resolve, reject) => {
        DownloadsModel.findAll({
                where: where,
                attributes: [
                    [sequelize.fn('count', sequelize.col('downloads.id')), 'downloadCount'],
                    [sequelize.fn('date_format', sequelize.col('downloads.createdAt'), '%Y-%m-%d'), 'date']
                ],
                include: [{
                    model: PodcastsModel,
                    where: { artist_id: data.artistID },
                    attributes: [],
                    as: 'download_podcast_details',
                    required: true
                }],
                group: ['file_id'],
                order: [
                    [sequelize.literal(`date`), 'DESC']
                ]
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

module.exports.artistGraphPodcastListen = (where, data) => {
    return new Promise((resolve, reject) => {
        UserPlayedModel.findAll({
                where: where,
                attributes: [
                    [sequelize.fn('count', sequelize.col('user_played_histories.id')), 'playedCount'],
                    [sequelize.fn('date_format', sequelize.col('user_played_histories.updatedAt'), '%Y-%m-%d'), 'date']
                ],
                group: ['file_id'],
                include: [{
                    model: PodcastsModel,
                    where: { artist_id: data.artistID },
                    attributes: [],
                    as: 'played_podcast_details',
                    required: true
                }],
                order: [
                    [sequelize.literal(`date`), 'DESC']
                ]
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

module.exports.totalFollowers = (where) => {
    return new Promise((resolve, reject) => {
        FollowedArtistsModel.count({
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



// Find One artist details data
module.exports.getArtistDetailsData = (whereData) => {
    return new Promise((resolve, reject) => {
        ArtistDetailsModel.findOne({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
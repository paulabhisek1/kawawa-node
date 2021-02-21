const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const PlayedHistoryModel = require('../models/user_played_histories')(sequelize, DataTypes);
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);

PlayedHistoryModel.belongsTo(SongsModel, { foreignKey: 'file_id', as: 'song_details' });
SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });

module.exports.allRecentlyPlayed = (where, data) => {
    return new Promise((resolve, reject) => {
        PlayedHistoryModel.findAndCountAll({
            where: where,
            order: [
                ['updatedAt', 'desc']
            ],
            include: [{
                model: SongsModel,
                where: { is_active: 1 },
                attributes: ['id', 'name', 'cover_picture', 'file_name', 'length', 'is_paid', 'type'],
                // include: [
                //     {
                //         model: ArtistModel,
                //         as: 'artist_details',
                //         attributes: ['id','full_name', 'profile_image', 'type']
                //     },
                //     {
                //         model: GenresModel,
                //         as: 'genre_details',
                //         attributes: ['id','name']
                //     },
                //     {
                //         model: AlbumsModel,
                //         as: 'album_details',
                //         attributes: ['id','name','cover_picture','total_songs']
                //     }
                // ],
                as: 'song_details',
                required: true
            }],
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

module.exports.recentlyPlayed = (where, data) => {
    return new Promise((resolve, reject) => {
        PlayedHistoryModel.findAll({
            where: where,
            order: [
                ['updatedAt', 'desc']
            ],
            include: [{
                model: SongsModel,
                where: { is_active: 1 },
                attributes: ['id', 'name', 'cover_picture', 'file_name', 'length', 'is_paid', 'type'],
                // include: [{
                //         model: ArtistModel,
                //         as: 'artist_details',
                //         attributes: ['id', 'full_name', 'profile_image', 'type']
                //     },
                //     {
                //         model: GenresModel,
                //         as: 'genre_details',
                //         attributes: ['id', 'name']
                //     },
                //     {
                //         model: AlbumsModel,
                //         as: 'album_details',
                //         attributes: ['id', 'name', 'cover_picture', 'total_songs']
                //     }
                // ],
                as: 'song_details',
                required: true
            }],
            limit: data.limit,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.recentlyPlayedAllData = (where, data) => {
    return new Promise((resolve, reject) => {
        PlayedHistoryModel.findAll({
            where: where,
            order: [
                ['updatedAt', 'desc']
            ],
            include: [{
                model: SongsModel,
                where: { is_active: 1 },
                attributes: ['id', 'name', 'cover_picture', 'file_name', 'length', 'is_paid', 'type'],
                // include: [{
                //         model: ArtistModel,
                //         as: 'artist_details',
                //         attributes: ['id', 'full_name', 'profile_image', 'type']
                //     },
                //     {
                //         model: GenresModel,
                //         as: 'genre_details',
                //         attributes: ['id', 'name']
                //     },
                //     {
                //         model: AlbumsModel,
                //         as: 'album_details',
                //         attributes: ['id', 'name', 'cover_picture', 'total_songs']
                //     }
                // ],
                as: 'song_details',
                required: true
            }],
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
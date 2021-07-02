const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const PlaylistModel = require('../models/playlists')(sequelize, DataTypes);
const PlaylistSongsModel = require('../models/playlist_songs')(sequelize, DataTypes);
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const PodcastModel = require('../models/podcasts')(sequelize, DataTypes);
const FavouritesModel = require('../models/favourites')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);
const PodcastCategoryModel = require('../models/podcast_categories')(sequelize, DataTypes);


SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });
SongsModel.hasMany(FavouritesModel, { foreignKey: 'file_id', as: 'is_favourite' });
PlaylistSongsModel.belongsTo(SongsModel, { foreignKey: 'file_id', as: 'song_details' });
PlaylistSongsModel.belongsTo(PodcastModel, { foreignKey: 'file_id', as: 'podcast_details' });
PodcastModel.belongsTo(PodcastCategoryModel, { foreignKey: 'category_id', as: 'podcast_category_details' });
PodcastModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });

// Create Playlist
module.exports.createPlaylist = (data) => {
    return new Promise((resolve, reject) => {
        PlaylistModel.create(data).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Create Playlist
module.exports.findOne = (where) => {
    return new Promise((resolve, reject) => {
        PlaylistModel.findOne({
            where: where
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Count
module.exports.count = (whereData) => {
    return new Promise((resolve, reject) => {
        PlaylistModel.count({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.removeFile = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        PlaylistSongsModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.playlistSongsCount = (where) => {
    return new Promise((resolve, reject) => {
        PlaylistSongsModel.count({
            where: where
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.playlistSongsAdd = (data) => {
    return new Promise((resolve, reject) => {
        PlaylistSongsModel.create(data).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.playlistList = (where, data) => {
    return new Promise((resolve, reject) => {
        PlaylistModel.findAndCountAll({
            where: where,
            attributes: ['id', 'name'],
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

module.exports.playlistSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        PlaylistSongsModel.findAndCountAll({
            where: where,
            include: [
                {
                    model: SongsModel,
                    where: { is_active: 1 },
                    as: 'song_details',
                    include: [
                        {
                            model: ArtistModel,
                            as: 'artist_details',
                            attributes: ['id', 'full_name', 'profile_image', 'type']
                        },
                        {
                            model: GenresModel,
                            as: 'genre_details',
                            attributes: ['id', 'name']
                        },
                        {
                            model: AlbumsModel,
                            as: 'album_details',
                            attributes: ['id', 'name', 'cover_picture', 'total_songs']
                        }
                    ],
                    attributes: [
                        'id',
                        'name',
                        'cover_picture',
                        'file_name',
                        'length',
                        'is_paid',
                        'type',
                        'artist_id',
                        'genre_id',
                        'album_id',
                        'country_id',
                        'is_paid',
                        'createdAt',
                        'updatedAt', [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = song_details.artist_id)`), 'isFollowedArtist'],
                        [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = song_details.id  AND favourites.type = 'song')`), 'isFavourite'],
                        [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = song_details.id  AND downloads.type = 'song')`), 'isDownloaded'],
                    ],
                    required: false
                },
                {
                    model: PodcastModel,
                    where: { is_active: 1 },
                    as: 'podcast_details',
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
                        [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = song_details.artist_id)`), 'isFollowedArtist'],
                        [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = song_details.id  AND favourites.type = 'song')`), 'isFavourite'],
                        [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = song_details.id  AND downloads.type = 'song')`), 'isDownloaded'],
                    ],
                    required: false
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
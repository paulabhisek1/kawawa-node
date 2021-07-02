const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);
const FavouritesModel = require('../models/favourites')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const DownloadsModel = require('../models/downloads')(sequelize, DataTypes);
const PlaylistSongsModel = require('../models/playlist_songs')(sequelize, DataTypes);


SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });
SongsModel.hasMany(FavouritesModel, { foreignKey: 'file_id', as: 'is_favourite' });
SongsModel.hasMany(DownloadsModel, { foreignKey: 'file_id', as: 'is_download' });
SongsModel.belongsTo(CountryModel, { foreignKey: 'country_id', as: 'country_details' });
SongsModel.hasMany(PlaylistSongsModel, { foreignKey: 'file_id', as: 'playlist_data' });

module.exports.findAll = (whereData) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: whereData,
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type',
                'artist_id',
                'genre_id',
                'album_id',
                'country_id',
                'is_paid',
                'createdAt',
                'updatedAt'
            ],
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.findOne = (whereData) => {
    return new Promise((resolve, reject) => {
        SongsModel.findOne({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.count = (whereData) => {
    return new Promise((resolve, reject) => {
        SongsModel.count({
            where: whereData,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.findAndCountAll = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
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
                'genre_id', 
                'album_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            order: [
                ['createdAt', 'desc']
            ],
            include: [{
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

module.exports.favouriteSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
            where: where,
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type', 
                'artist_id',
                'genre_id',
                'album_id',
                'is_paid',
                'country_id',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded']
            ],
            include: [{
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
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    where: { user_id: data.user_id },
                    required: true
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

module.exports.downloadSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
            where: where,
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type', 
                'artist_id',
                'genre_id',
                'album_id',
                'is_paid',
                'country_id',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded']
            ],
            include: [{
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
                },
                {
                    model: DownloadsModel,
                    as: 'is_download',
                    where: { user_id: data.user_id },
                    required: true
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

module.exports.freeSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
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
                'genre_id', 
                'album_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            order: [
                ['createdAt', 'desc']
            ],
            include: [{
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

module.exports.freeSongsPaginate = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
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
                'genre_id', 
                'album_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            order: [
                ['createdAt', 'desc']
            ],
            include: [{
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type'],
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

module.exports.recommendedSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: where,
            order: [
                ['createdAt', 'desc']
            ],
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type',
                'artist_id',
                'genre_id',
                'album_id',
                'country_id',
                'is_paid',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            include: [{
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
            limit: data.limit,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.recommendedSongsPaginate = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
            where: where,
            order: [
                ['createdAt', 'desc']
            ],
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type',
                'artist_id',
                'genre_id',
                'album_id',
                'is_paid',
                'country_id',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded']
            ],
            include: [{
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

module.exports.weeklyTopTen = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: where,
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type', 
                'artist_id',
                'genre_id',
                'album_id',
                'is_paid',
                'country_id',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id)`), 'totalFavourites'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.file_id = songs.id)`), 'totalDownloads'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.file_id = songs.id AND downloads.type = 'song') + (SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id AND favourites.type = 'song')`), 'totalSum'],
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded']
            ],
            include: [{
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
            having: sequelize.literal('`totalSum` > 0'),
            order: [
                [sequelize.literal(`totalSum`), 'desc']
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

module.exports.weeklyTopTenPaginate = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: where,
            subQuery: false,
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type',
                'artist_id',
                'genre_id',
                'album_id',
                'country_id',
                'is_paid',
                'createdAt',
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id)`), 'totalFavourites'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.file_id = songs.id)`), 'totalDownloads'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.file_id = songs.id AND downloads.type = 'song') + (SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id AND favourites.type = 'song')`), 'totalSum'],
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            include: [{
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
            having: sequelize.literal('`totalSum` > 0'),
            order: [
                [sequelize.literal(`totalSum`), 'desc']
            ],
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

module.exports.markFavouriteInsert = (data) => {
    return new Promise((resolve, reject) => {
        FavouritesModel.create(data)
            .then((result) => {
                result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

module.exports.favDestroy = (where) => {
    return new Promise((resolve, reject) => {
        FavouritesModel.destroy({
            where: where
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.favouriteFindDetails = (where) => {
    return new Promise((resolve, reject) => {
        FavouritesModel.findOne({
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

module.exports.update = (where, data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        SongsModel.update(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.delete = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        SongsModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.songDelete = (where, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {
            where: where
        }
            //if trunsaction exist
        if (t != null) options.transaction = t;
        SongsModel.destroy(options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.create = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
        //if trunsaction exist
        if (t != null) options.transaction = t;
        SongsModel.create(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.songDetails = (where) => {
    return new Promise((resolve, reject) => {
        SongsModel.findOne({
            where: where,
            include: [{
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

module.exports.songsList = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
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
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id', 'name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id', 'name', 'cover_picture', 'total_songs']
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

module.exports.searchSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
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
                'genre_id', 
                'album_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            order: [
                ['createdAt', 'desc']
            ],
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

module.exports.searchPlaylistSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
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
                'genre_id', 
                'album_id', 
                'country_id', 
                'is_paid', 
                'createdAt', 
                'updatedAt',
                [sequelize.literal(`(SELECT count(*) FROM followed_artists WHERE followed_artists.user_id = ${data.user_id} AND followed_artists.artist_id = songs.artist_id)`), 'isFollowedArtist'],
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.user_id = ${data.user_id} AND favourites.file_id = songs.id AND favourites.type = 'song')`), 'isFavourite'],
                [sequelize.literal(`(SELECT count(*) FROM downloads WHERE downloads.user_id = ${data.user_id} AND downloads.file_id = songs.id AND downloads.type = 'song')`), 'isDownloaded'],
            ],
            order: [
                ['createdAt', 'desc']
            ],
            include: [
                {
                    model: PlaylistSongsModel,
                    as: 'playlist_data',
                    where: { type: 'song' },
                    required: false
                },
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
                },
            ],
            offset: data.offset,
            limit: data.limit,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}
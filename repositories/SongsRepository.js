const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const SongsModel = require('../models/songs')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const GenresModel = require('../models/genres')(sequelize, DataTypes);
const AlbumsModel = require('../models/albums')(sequelize, DataTypes);
const FavouritesModel = require('../models/favourites')(sequelize, DataTypes);


SongsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
SongsModel.belongsTo(GenresModel, { foreignKey: 'genre_id', as: 'genre_details' });
SongsModel.belongsTo(AlbumsModel, { foreignKey: 'album_id', as: 'album_details' });
SongsModel.hasOne(FavouritesModel, { foreignKey: 'file_id', as: 'is_favourite' });

// Find All
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
                'type'
            ],
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Find All
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

// Free Songs Without Pagination
module.exports.freeSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: where,
            order: [['createdAt', 'desc']],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
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

// Free Songs Without Pagination
module.exports.freeSongsPaginate = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
            where: where,
            order: [['createdAt', 'desc']],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
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

// Recommended Songs Without Pagination
module.exports.recommendedSongs = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAll({
            where: where,
            order: [['createdAt', 'desc']],
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type'
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
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

// Recommended Songs With Pagination
module.exports.recommendedSongsPaginate = (where, data) => {
    return new Promise((resolve, reject) => {
        SongsModel.findAndCountAll({
            where: where,
            order: [['createdAt', 'desc']],
            attributes: [
                'id',
                'name',
                'cover_picture',
                'length',
                'file_name',
                'type'
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
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

// Weekly Top 10 Songs Without Pagination
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
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id HAVING count(*) > 0)`),'totalFavourites']
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
                }
            ],
            order: [[sequelize.literal(`totalFavourites`), 'desc']],
            limit: data.limit,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

// Weekly Top 10 Songs With Pagination
module.exports.weeklyTopTenPaginate = (where, data) => {
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
                [sequelize.literal(`(SELECT count(*) FROM favourites WHERE favourites.file_id = songs.id)`),'totalFavourites']
            ],
            include: [
                {
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id','full_name', 'profile_image', 'type']
                },
                {
                    model: GenresModel,
                    as: 'genre_details',
                    attributes: ['id','name']
                },
                {
                    model: AlbumsModel,
                    as: 'album_details',
                    attributes: ['id','name','cover_picture','total_songs']
                },
                {
                    model: FavouritesModel,
                    as: 'is_favourite',
                    attributes: ['id']
                }
            ],
            order: [[sequelize.literal(`totalFavourites`), 'desc']],
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

// Add To Liked Songs
module.exports.markFavouriteInsert = (data) => {
    return new Promise((resolve, reject)=>{
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

// Remove From Liked Songs
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

// Fetch Favourite Details
module.exports.favouriteFindDetails = (where) => {
    return new Promise((resolve, reject)=>{
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
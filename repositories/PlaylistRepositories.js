const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const PlaylistModel = require('../models/playlists')(sequelize, DataTypes);
const PlaylistSongsModel = require('../models/playlist_songs')(sequelize, DataTypes);
const SongsModel = require('../models/songs')(sequelize, DataTypes);

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
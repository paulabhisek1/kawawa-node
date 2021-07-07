const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// All Recently Played Schema
module.exports.allRecentlyPlayed = Joi.object().keys({
    page: Joi.number().min(0).required(),
    playlist_id: Joi.number().min(0),
    number_of_items: Joi.number().min(0),
    album_id: Joi.number().allow(),
    artist_id: Joi.number().allow()
});

// All Recently Played Schema
module.exports.followedArtistsLists = Joi.object().keys({
    page: Joi.number().min(0).required(),
});

// Search Schema
module.exports.searchSchema = Joi.object().keys({
    search_text: Joi.string().required().allow('', null),
});

// Search Schema
module.exports.searchPlaylistFileSchema = Joi.object().keys({
    page: Joi.number().min(1).required(),
    search_text: Joi.string().required().allow('', null),
    playlist_id: Joi.number().required(),
});

// Artist Wise Songs Schema
module.exports.artistSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    artist_id: Joi.number().required(),
    playlist_id: Joi.number().min(0),
    number_of_items: Joi.number().min(0),
    album_id: Joi.number().allow(),
});

// Album Wise Songs Schema
module.exports.albumSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    album_id: Joi.number().required(),
    playlist_id: Joi.number().min(0),
    number_of_items: Joi.number().min(0),
    artist_id: Joi.number().allow()
});

// Genre Wise Songs Schema
module.exports.genreSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    genre_id: Joi.number().required(),
    playlist_id: Joi.number().min(0),
    number_of_items: Joi.number().min(0),
    artist_id: Joi.number().allow()
});

// Create Playlist
module.exports.createPlaylist = Joi.object().keys({
    name: Joi.string().required().label('Playlist name'),
});

// Add Song Playlist
module.exports.addSongToPlaylist = Joi.object().keys({
    file_id: Joi.number().required().label('File id'),
    playlist_id: Joi.number().required().label('Playlist id'),
});

// Playlist List
module.exports.playlistList = Joi.object().keys({
    page: Joi.number().min(1).required(),
});

// Playlist Songs
module.exports.playlistSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    playlist_id: Joi.number().required(),
});
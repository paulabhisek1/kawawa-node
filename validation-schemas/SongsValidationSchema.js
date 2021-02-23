const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// All Recently Played Schema
module.exports.allRecentlyPlayed = Joi.object().keys({
    page: Joi.number().min(1).required(),
});

// Artist Wise Songs Schema
module.exports.artistSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    artist_id: Joi.number().required(),
});

// Album Wise Songs Schema
module.exports.albumSongs = Joi.object().keys({
    page: Joi.number().min(1).required(),
    album_id: Joi.number().required(),
});

// Create Playlist
module.exports.createPlaylist = Joi.object().keys({
    name: Joi.string().min(1).label('Playlist name'),
});
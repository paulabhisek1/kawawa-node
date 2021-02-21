const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// All Recently Played Schema
module.exports.allRecentlyPlayed = Joi.object().keys({
    page: Joi.number().min(1).required(),
});
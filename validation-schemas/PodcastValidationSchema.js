const Joi = require("joi");

// Homepage Schema
module.exports.homepageData = Joi.object().keys({
    page: Joi.number().min(0).required(),
    artist_id: Joi.number().allow(),
    category_id: Joi.number().allow(0)
});

// All Recently Schema
module.exports.allRecentlyPlayed = Joi.object().keys({
    page: Joi.number().min(0).required(),
});
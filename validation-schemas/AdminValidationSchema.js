const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// Login Schema
module.exports.loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
});

// Add Country Schema
module.exports.addCountrySchema = Joi.object().keys({
    name: Joi.string().required(),
    country_code: Joi.string().required(),
    telephone_code: Joi.number().required(),
});

// Add Genre Schema
module.exports.addGenreSchema = Joi.object().keys({
    name: Joi.string().required(),
});

// Add Country Schema
module.exports.listCountrySchema = Joi.object().keys({
    page: Joi.number().min(1).required(),
});
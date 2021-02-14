const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// Login Schema
module.exports.loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
});
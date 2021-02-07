const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// User Register Schema
module.exports.userRegisterSchema = Joi.object().keys({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile_no: Joi.string().required(),
    password: Joi.string().required().min(8).max(25).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*(){}:;_+-/=<>,.?|`~"\']+$')).messages({
        'string.pattern.base': "Your password must be at least 8 characters long, contain at least one number and have a mixture of uppercase and lowercase letters",
    }), //password must include at least 1 upper case letter, 1 lower case letter, and 1 numeric digit
    confirm_password: Joi.string().equal(Joi.ref('password')).required().messages({
        'any.only': `"confirm_password" should match with "password"`,
    }), //Confirm password must be same as password
    dob: Joi.date().required().format("YYYY-MM-DD"),
    country_id: Joi.number().required()
});

// OTP Verification Schema
module.exports.otpVerificationSchema = Joi.object().keys({
    otp: Joi.string().required(),
    email: Joi.string().email().required()
});

// Login Schema
module.exports.loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
});


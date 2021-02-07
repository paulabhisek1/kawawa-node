const express = require('express');
const router = express.Router();

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');

/* ############################################ Joi Validation Schema ############################################ */
const usersValidationSchema = require('../validation-schemas/UsersValidationSchemas');

/* ############################################ Controllers ############################################ */
const usersController = require('../controllers/Api/UsersController');
const commonController = require('../controllers/Common/CommonController');

/* ############################################ Routes  ############################################ */

// User Registration Route
router.post('/register', validateRequest.validate(usersValidationSchema.userRegisterSchema, 'body'), usersController.registerUser);

// OTP Verification Routes
router.post('/verify-otp', validateRequest.validate(usersValidationSchema.otpVerificationSchema, 'body'), usersController.verifyOTP);

// OTP Verification Routes
router.post('/login', validateRequest.validate(usersValidationSchema.loginSchema, 'body'), usersController.userLogin);

module.exports = router;
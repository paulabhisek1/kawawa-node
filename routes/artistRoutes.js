const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');

/* ############################################ Joi Validation Schema ############################################ */
const artistValidationSchema = require('../validation-schemas/ArtistValidationSchema');

/* ############################################ Controllers ############################################ */
const artistController = require('../controllers/Artist/ArtistController');
const commonController = require('../controllers/Common/CommonController');

/* ############################################ Routes  ############################################ */


// SET STORAGE FOR SONG
var storageSong = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.fieldname == 'song') {
            const path = 'uploads/songs';
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
        }
        if(file.fieldname == 'cover') {
            const path = 'uploads/songs_cover';
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
        }
    },
    filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var uploadSong = multer({ storage: storageSong })

router.post('/register', validateRequest.validate(artistValidationSchema.userRegisterSchema, 'body'), artistController.registerArtist); // User Registration Route
router.post('/login', validateRequest.validate(artistValidationSchema.loginSchema, 'body'), artistController.artistLogin); // System Login Route
router.post('/social-login', validateRequest.validate(artistValidationSchema.socialLoginSchema, 'body'), artistController.socialLogin); // System Login Route
router.post('/forgot-password', validateRequest.validate(artistValidationSchema.forgotPassSchema, 'body'), artistController.forgotPassword); // Forgot Password Route
router.post('/verify-otp', validateRequest.validate(artistValidationSchema.otpVerificationSchema, 'body'), artistController.verifyOTP); // OTP Verification Route
router.post('/reset-password', validateRequest.validate(artistValidationSchema.resetPassSchema, 'body'), artistController.resetPassword); // Reset Password Route
router.get('/countries', commonController.fetchCountries); // Fetch Countries

module.exports = router;
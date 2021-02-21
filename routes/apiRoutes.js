const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');

/* ############################################ Joi Validation Schema ############################################ */
const usersValidationSchema = require('../validation-schemas/UsersValidationSchemas');

/* ############################################ Controllers ############################################ */
const usersController = require('../controllers/Api/UsersController');
const commonController = require('../controllers/Common/CommonController');
const songsController = require('../controllers/Api/SongsController');

/* ############################################ Routes  ############################################ */


// SET STORAGE FOR SONG
var storageSong = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.fieldname == 'song') {
            const path = 'uploads/songs';
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
        }
        if (file.fieldname == 'cover') {
            const path = 'uploads/songs_cover';
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var uploadSong = multer({ storage: storageSong })

router.post('/register', validateRequest.validate(usersValidationSchema.userRegisterSchema, 'body'), usersController.registerUser); // User Registration Route
router.post('/login', validateRequest.validate(usersValidationSchema.loginSchema, 'body'), usersController.userLogin); // System Login Route
router.post('/social-login', validateRequest.validate(usersValidationSchema.socialLoginSchema, 'body'), usersController.socialLogin); // System Login Route
router.post('/forgot-password', validateRequest.validate(usersValidationSchema.forgotPassSchema, 'body'), usersController.forgotPassword); // Forgot Password Route
router.post('/verify-otp', validateRequest.validate(usersValidationSchema.otpVerificationSchema, 'body'), usersController.verifyOTP); // OTP Verification Route
router.post('/reset-password', validateRequest.validate(usersValidationSchema.resetPassSchema, 'body'), usersController.resetPassword); // Reset Password Route
router.get('/countries', commonController.fetchCountries); // Fetch Countries
router.get('/homepage', songsController.fetchHomePageData); // Fetch Home page data
router.get('/see-all-recently-played', songsController.seeAllRecentlyPlayed); // See All Recently played songs

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const authenticationMiddleware = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Joi Validation Schema ############################################ */
const usersValidationSchema = require('../validation-schemas/UsersValidationSchemas');
const songsValidationsSchema = require('../validation-schemas/SongsValidationSchema');

/* ############################################ Controllers ############################################ */
const usersController = require('../controllers/Api/UsersController');
const commonController = require('../controllers/Common/CommonController');
const songsController = require('../controllers/Api/SongsController');
const artistAPIController = require('../controllers/Api/ArtistController');

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

router.post('/mark-unmark-liked/:id', authenticationMiddleware.authenticateRequestAPI, songsController.favouriteAndUnfavourite); // Fetch Home page data

// ################################### HOMEPAGE ########################################### //
router.get('/homepage', authenticationMiddleware.authenticateRequestAPI, songsController.fetchHomePageData); // Fetch Home page data
router.get('/all-recently-played', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allRecentlyPlayed); // See All Recently played songs
router.get('/all-recommend', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allRecommend); // See All Recommend songs
router.get('/all-weekly-top', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.allWeeklyTop); // See All weekly top songs
router.get('/all-artist', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.allArtist); // See All artist
router.get('/all-free-songs', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.allFreeSongs); // See All Free songs

// ################################### SONGS ########################################### //
router.get('/artist-songs', validateRequest.validate(songsValidationsSchema.artistSongs, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.artistWiseTrack); // Artist wise songs
router.get('/album-songs', validateRequest.validate(songsValidationsSchema.albumSongs, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.albumWiseTrack); // Album wise songs
router.get('/artist-albums', validateRequest.validate(songsValidationsSchema.artistSongs, 'query'), authenticationMiddleware.authenticateRequestAPI,  songsController.allAlbumsList); // Artist wise songs

// ################################### SONGS ########################################### //
router.post('/artist-follow/:id', authenticationMiddleware.authenticateRequestAPI, artistAPIController.followArtist); // Artist Follow
router.get('/artist-follow-details/:id', authenticationMiddleware.authenticateRequestAPI, artistAPIController.artistFollowDetails); // Artist Follow Details

// ################################### Playlist ########################################### //
router.post('/create-playlist', validateRequest.validate(songsValidationsSchema.createPlaylist, 'body'), authenticationMiddleware.authenticateRequestAPI, songsController.createPlaylist); // Create Playlist

module.exports = router;
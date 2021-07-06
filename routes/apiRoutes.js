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
const podcastsValidationsSchema = require('../validation-schemas/PodcastValidationSchema');

/* ############################################ Controllers ############################################ */
const usersController = require('../controllers/Api/UsersController');
const commonController = require('../controllers/Common/CommonController');
const songsController = require('../controllers/Api/SongsController');
const artistAPIController = require('../controllers/Api/ArtistController');
const podcastController = require('../controllers/Api/PodcastsController');

/* ############################################ Routes  ############################################ */


// SET STORAGE FOR PROFILE PICTURE
var storageProfilePicture = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/profile_images';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var uploadProfilePicture = multer({ storage: storageProfilePicture })

// ################################### AUTH ########################################### //
router.post('/register', validateRequest.validate(usersValidationSchema.userRegisterSchema, 'body'), usersController.registerUser); // User Registration Route
router.post('/login', validateRequest.validate(usersValidationSchema.loginSchema, 'body'), usersController.userLogin); // System Login Route
router.post('/social-login', validateRequest.validate(usersValidationSchema.socialLoginSchema, 'body'), usersController.socialLogin); // System Login Route
router.post('/forgot-password', validateRequest.validate(usersValidationSchema.forgotPassSchema, 'body'), usersController.forgotPassword); // Forgot Password Route
router.post('/verify-otp', validateRequest.validate(usersValidationSchema.otpVerificationSchema, 'body'), usersController.verifyOTP); // OTP Verification Route
router.post('/reset-password', validateRequest.validate(usersValidationSchema.resetPassSchema, 'body'), usersController.resetPassword); // Reset Password Route
router.get('/fetch-user-details', authenticationMiddleware.authenticateRequestAPI, usersController.fetchUserDetails); // Fetch User Details
router.put('/update-user-details', validateRequest.validate(usersValidationSchema.updateUserDetails, 'body'), authenticationMiddleware.authenticateRequestAPI, usersController.updateUserName); // Fetch User Details
router.put('/update-user-picture', authenticationMiddleware.authenticateRequestAPI, uploadProfilePicture.single('file'), usersController.updateProfilePicture); // Fetch User Details
router.put('/update-user-country', validateRequest.validate(usersValidationSchema.updateUserCountry, 'body'), authenticationMiddleware.authenticateRequestAPI, usersController.updateUserCountry); // Fetch User Details

// ################################### COMMON ########################################### //
router.get('/countries', commonController.fetchCountries); // Fetch Countries

// ################################### HOMEPAGE ########################################### //
router.get('/homepage', authenticationMiddleware.authenticateRequestAPI, songsController.fetchHomePageData); // Fetch Home page data
router.get('/all-recently-played', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allRecentlyPlayed); // See All Recently played songs
router.get('/all-recommend', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allRecommend); // See All Recommend songs
router.get('/all-weekly-top', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allWeeklyTop); // See All weekly top songs
router.get('/all-artist', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allArtist); // See All artist
router.get('/all-free-songs', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allFreeSongs); // See All Free songs

// ################################### SONGS ########################################### //
router.get('/artist-songs', validateRequest.validate(songsValidationsSchema.artistSongs, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.artistWiseTrack); // Artist wise songs
router.get('/album-songs', validateRequest.validate(songsValidationsSchema.albumSongs, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.albumWiseTrack); // Album wise songs
router.get('/genre-songs', validateRequest.validate(songsValidationsSchema.genreSongs, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.genreWiseSongs); // Genre wise songs
router.get('/artist-albums', validateRequest.validate(songsValidationsSchema.artistSongs, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allAlbumsList); // Artist wise album list
router.post('/mark-unmark-liked/:id', authenticationMiddleware.authenticateRequestAPI, songsController.favouriteAndUnfavourite); // Mark & Unmark Favourite
router.post('/artist-follow/:id', authenticationMiddleware.authenticateRequestAPI, artistAPIController.followArtist); // Artist Follow
router.get('/followed-artists', validateRequest.validate(songsValidationsSchema.followedArtistsLists, 'query'), authenticationMiddleware.authenticateRequestAPI, artistAPIController.allFollowedArtists); // Artist Follow
router.get('/favourite-songs', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allFavouriteSongs); // See All Favourite songs
router.get('/downloaded-songs', validateRequest.validate(songsValidationsSchema.allRecentlyPlayed, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.allDownloadSongs); // See All Downloaded songs
router.get('/search-landing-page', authenticationMiddleware.authenticateRequestAPI, songsController.searchLandingPage); // Search Landing Page
router.get('/search', validateRequest.validate(songsValidationsSchema.searchSchema, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.search); // Search
router.get('/search-playlist-files', validateRequest.validate(songsValidationsSchema.searchPlaylistFileSchema, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.playlistSongSearch); // Search Playlist Files

// ################################### PLAYLISTS ########################################### //
router.post('/create-playlist', validateRequest.validate(songsValidationsSchema.createPlaylist, 'body'), authenticationMiddleware.authenticateRequestAPI, songsController.createPlaylist); // Create Playlist
router.put('/add-remove-song-to-playlist', validateRequest.validate(songsValidationsSchema.addSongToPlaylist, 'body'), authenticationMiddleware.authenticateRequestAPI, songsController.addRemoveSongToPlaylist); // Add Or Remove Song To Playlist
router.put('/add-remove-podcast-to-playlist', validateRequest.validate(songsValidationsSchema.addSongToPlaylist, 'body'), authenticationMiddleware.authenticateRequestAPI, songsController.addRemovePodcastToPlaylist); // Add Or Remove Podcast To Playlist
router.get('/playlist-list', validateRequest.validate(songsValidationsSchema.playlistList, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.playlistList); // Playlist List
router.get('/playlist-songs', validateRequest.validate(songsValidationsSchema.playlistSongs, 'query'), authenticationMiddleware.authenticateRequestAPI, songsController.playlistSongs); // Playlist Songs

// ################################### PODCASTS ########################################### //
router.get('/podcast/homepage', authenticationMiddleware.authenticateRequestAPI, validateRequest.validate(podcastsValidationsSchema.homepageData, 'query'), podcastController.podcastHomepage); // Podcast Homepage
router.get('/podcast/all-recently-played', authenticationMiddleware.authenticateRequestAPI, validateRequest.validate(podcastsValidationsSchema.allRecentlyPlayed, 'query'), podcastController.allRecentlyPlayed); // All Recently Played Podcasts


// ################################### SUBSCRIPTION ########################################### //
router.post('/create-subscription', authenticationMiddleware.authenticateRequestAPI, validateRequest.validate(usersValidationSchema.userSubscriptionSchema, 'body'), usersController.createSubscription); //Create Subscription

module.exports = router;
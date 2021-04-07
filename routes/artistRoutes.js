const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const authenticationMiddleware = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Joi Validation Schema ############################################ */
const artistValidationSchema = require('../validation-schemas/ArtistValidationSchema');

/* ############################################ Controllers ############################################ */
const artistController = require('../controllers/Artist/ArtistController');
const commonController = require('../controllers/Common/CommonController');

/* ############################################ Routes  ############################################ */


// SET STORAGE FOR PROFILE PICTURE
var storagePicture = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/profile_images';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

// SET STORAGE FOR GOVT ID FRONT
var storagePictureGovtIDFront = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/govt_ids';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '_front' + path.extname(file.originalname))
    }
})

// SET STORAGE FOR GOVT ID BACK
var storagePictureGovtIDBack = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/govt_ids';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '_back' + path.extname(file.originalname))
    }
})

// SET STORAGE FOR ARTIST COVER
var storagePictureAlbumCover = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/album_covers';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '_cover' + path.extname(file.originalname))
    }
})

// SET STORAGE FOR SAMPLE SONG
var storageSampleSong = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/songs/sample';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, 'sample_' + Date.now() + path.extname(file.originalname))
    }
})

var uploadProfilePicture = multer({ storage: storagePicture });
var uploadGovtIDFront = multer({ storage: storagePictureGovtIDFront });
var uploadGovtIDBack = multer({ storage: storagePictureGovtIDBack });
var uploadSampleSong = multer({ storage: storageSampleSong });
var uploadAlbumCover = multer({ storage: storagePictureAlbumCover });

router.post('/register', validateRequest.validate(artistValidationSchema.userRegisterSchema, 'body'), artistController.registerArtist); // User Registration Route
router.post('/login', validateRequest.validate(artistValidationSchema.loginSchema, 'body'), artistController.artistLogin); // System Login Route
router.post('/social-login', validateRequest.validate(artistValidationSchema.socialLoginSchema, 'body'), artistController.socialLogin); // System Login Route
router.post('/forgot-password', validateRequest.validate(artistValidationSchema.forgotPassSchema, 'body'), artistController.forgotPassword); // Forgot Password Route
router.post('/verify-otp', validateRequest.validate(artistValidationSchema.otpVerificationSchema, 'body'), artistController.verifyOTP); // OTP Verification Route
router.post('/reset-password', validateRequest.validate(artistValidationSchema.resetPassSchema, 'body'), artistController.resetPassword); // Reset Password Route
router.get('/countries', commonController.fetchCountries); // Fetch Countries
router.get('/active-countries', commonController.fetchActiveCountries); // Fetch Active Countries
router.post('/artist-details/upload-profile-picture', authenticationMiddleware.authenticateArtistRequestAPI, uploadProfilePicture.single('file'), artistController.uploadArtistProfilePicture); // Upload Artist Profile Picture
router.post('/artist-details/upload-govt-id-front', authenticationMiddleware.authenticateArtistRequestAPI, uploadGovtIDFront.single('file'), artistController.uploadArtistGovtIDFront); // Upload Artist Govt ID Front
router.post('/artist-details/upload-govt-id-back', authenticationMiddleware.authenticateArtistRequestAPI, uploadGovtIDBack.single('file'), artistController.uploadArtistGovtIDBack); // Upload Artist Govt ID Back
router.post('/artist-details/upload-sample-song', authenticationMiddleware.authenticateArtistRequestAPI, uploadSampleSong.single('file'), artistController.uploadSampleSong); // Upload Artist Sample Song
router.post('/artist-details/step-one', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepOne, 'body'), artistController.saveArtistDetailsStepOne) // Save Artist Details Step One
router.post('/artist-details/step-two', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepTwo, 'body'), artistController.saveArtistDeatislStepTwo) // Save Artist Details Step Two
router.post('/artist-details/step-three', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepThree, 'body'), artistController.saveArtistDeatislStepThree) // Save Artist Details Step Three
router.post('/artist-details/step-four', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepFour, 'body'), artistController.saveArtistDeatislStepFour) // Save Artist Details Step Four
router.get('/artist-details', authenticationMiddleware.authenticateArtistRequestAPI, artistController.fetchArtistDetails); // Fetch Artist Details
router.get('/common-details', authenticationMiddleware.authenticateArtistRequestAPI, artistController.fetchCommonDetails); // Fetch Common Details
router.post('/create-album', authenticationMiddleware.authenticateArtistRequestAPI, uploadAlbumCover.single('file'), validateRequest.validate(artistValidationSchema.createAlbum, 'body'), artistController.createAlbum); // Create Album
router.put('/update-album/:id', authenticationMiddleware.authenticateArtistRequestAPI, uploadAlbumCover.single('file'), validateRequest.validate(artistValidationSchema.createAlbum, 'body'), artistController.updateAlbum); // Update Album
router.get('/album-details/:id', authenticationMiddleware.authenticateArtistRequestAPI, artistController.albumDetails); // Album Details
router.get('/album-list', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.listAlbums, 'query'), artistController.alubumsList); // Album List

module.exports = router;
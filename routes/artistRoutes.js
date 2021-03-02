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
    destination: function (req, file, cb) {
            const path = 'uploads/profile_images';
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
    },
    filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

// SET STORAGE FOR GOVT ID FRONT
var storagePictureGovtIDFront = multer.diskStorage({
        destination: function (req, file, cb) {
                const path = 'uploads/govt_ids';
                fs.mkdirSync(path, { recursive: true });
                cb(null, path);
        },
        filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + '_front' + path.extname(file.originalname))
        }
})

// SET STORAGE FOR GOVT ID BACK
var storagePictureGovtIDBack = multer.diskStorage({
        destination: function (req, file, cb) {
                const path = 'uploads/govt_ids';
                fs.mkdirSync(path, { recursive: true });
                cb(null, path);
        },
        filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + '_back' + path.extname(file.originalname))
        }
})

var uploadProfilePicture = multer({ storage: storagePicture });
var uploadGovtIDFront = multer({ storage: storagePictureGovtIDFront });
var uploadGovtIDBack = multer({ storage: storagePictureGovtIDBack });

router.post('/register', validateRequest.validate(artistValidationSchema.userRegisterSchema, 'body'), artistController.registerArtist); // User Registration Route
router.post('/login', validateRequest.validate(artistValidationSchema.loginSchema, 'body'), artistController.artistLogin); // System Login Route
router.post('/social-login', validateRequest.validate(artistValidationSchema.socialLoginSchema, 'body'), artistController.socialLogin); // System Login Route
router.post('/forgot-password', validateRequest.validate(artistValidationSchema.forgotPassSchema, 'body'), artistController.forgotPassword); // Forgot Password Route
router.post('/verify-otp', validateRequest.validate(artistValidationSchema.otpVerificationSchema, 'body'), artistController.verifyOTP); // OTP Verification Route
router.post('/reset-password', validateRequest.validate(artistValidationSchema.resetPassSchema, 'body'), artistController.resetPassword); // Reset Password Route
router.get('/countries', commonController.fetchCountries); // Fetch Countries
router.post('/artist-details/upload-profile-picture', authenticationMiddleware.authenticateRequestAPI, uploadProfilePicture.single('file'), artistController.uploadArtistProfilePicture);
router.post('/artist-details/upload-govt-id-front', authenticationMiddleware.authenticateRequestAPI, uploadGovtIDFront.single('file'), artistController.uploadArtistGovtIDFront);
router.post('/artist-details/upload-govt-id-back', authenticationMiddleware.authenticateRequestAPI, uploadGovtIDBack.single('file'), artistController.uploadArtistGovtIDBack);
router.post('/artist-details/step-one', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepOne, 'body'), artistController.saveArtistDetailsStepOne) // Save Artist Details Step One
router.post('/artist-details/step-two', authenticationMiddleware.authenticateArtistRequestAPI, validateRequest.validate(artistValidationSchema.artistDetailsStepTwo, 'body'), artistController.saveArtistDeatislStepTwo) // Save Artist Details Step Two

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const authenticationMiddleware = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Joi Validation Schema ############################################ */
const adminValidationSchema = require('../validation-schemas/AdminValidationSchema');

/* ############################################ Controllers ############################################ */
const adminController = require('../controllers/Admin/AdminController');

// SET STORAGE FOR Gener COVER IMAGE
var storageGenerCover = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'uploads/gener_covers';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function(req, file, cb) {
        cb(null, 'gener_cover_' + Date.now() + path.extname(file.originalname))
    }
})

var uploadGenerCover = multer({ storage: storageGenerCover });

/* ############################################ Routes  ############################################ */

router.post('/login', validateRequest.validate(adminValidationSchema.loginSchema, 'body'), adminController.adminLogin); // System Login Route
router.put('/country-update/:id', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.addCountrySchema, 'body'), adminController.updateCountry); // Update Country
router.get('/country-details/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.countryDetails); // Country Details
router.get('/country-list', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listCountrySchema, 'query'), adminController.listCountry); // List Country
router.put('/country-status-change/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.statusChangeCountry); // Country Status Change
router.post('/genre-add', authenticationMiddleware.authenticateAdminRequestAPI, uploadGenerCover.single('file'), validateRequest.validate(adminValidationSchema.addGenreSchema, 'body'), adminController.addGenre); // Add Genre
router.put('/genre-edit/:id', authenticationMiddleware.authenticateAdminRequestAPI, uploadGenerCover.single('file'), validateRequest.validate(adminValidationSchema.addGenreSchema, 'body'), adminController.editGenre); // Update Genre
router.get('/genre-list', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listCountrySchema, 'query'), adminController.listGenre); // List Genre
router.delete('/delete-genre/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.deleteGenre); // Delete Genre
router.get('/genre-details/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.genreDetails); // Genre Details
router.get('/artist-list', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listCountrySchema, 'query'), adminController.listArtists); // List Artists
router.get('/artist-details/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.artistDetails); // Artists Details
router.put('/artist-verify/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.verifyArtist); // Artists verify
router.put('/accept-artist/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.acceptArtist); // Accept verify
router.put('/decline-artist/:id', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.declineArtistSchema, 'body'), adminController.declineArtist); // Decline Artist
router.post('/podcast-category-add', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.addPodcastCategorySchema, 'body'), adminController.addPodcastCategory); // Add Podcast Category
router.get('/podcast-category-list', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listPodcastcategorySchema, 'query'), adminController.listPodcastCategory); // List Podcast Category
router.delete('/delete-podcast-category/:id', authenticationMiddleware.authenticateAdminRequestAPI, adminController.deletePodcastCategory); // Delete Podcast Category

router.post('/privacy-policy-add', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.addPrivacyPolicySchema, 'body'), adminController.addPrivacyPolicy); // Add Podcast Category
router.get('/privacy-policy', authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listPrivacyPolicySchema, 'query'), adminController.privacyPolicy); // List Podcast Category

module.exports = router;
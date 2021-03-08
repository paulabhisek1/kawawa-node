const express = require('express');
const router = express.Router();

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const authenticationMiddleware = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Joi Validation Schema ############################################ */
const adminValidationSchema = require('../validation-schemas/AdminValidationSchema');

/* ############################################ Controllers ############################################ */
const adminController = require('../controllers/Admin/AdminController');

/* ############################################ Routes  ############################################ */

router.post('/login', validateRequest.validate(adminValidationSchema.loginSchema, 'body'), adminController.adminLogin); // System Login Route
router.post('/country-add',authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.addCountrySchema, 'body'), adminController.addCountry); // Add Country
router.get('/country-list',authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listCountrySchema, 'query'), adminController.listCountry); // List Country
router.put('/country-status-change/:id',authenticationMiddleware.authenticateAdminRequestAPI, adminController.statusChangeCountry); // Country Status Change
router.post('/genre-add',authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.addGenreSchema, 'body'), adminController.addGenre); // Add Country
router.get('/genre-list',authenticationMiddleware.authenticateAdminRequestAPI, validateRequest.validate(adminValidationSchema.listCountrySchema, 'query'), adminController.listGenre); // List Genre
router.delete('/delete-genre/:id',authenticationMiddleware.authenticateAdminRequestAPI, adminController.deleteGenre); // Delete Genre

module.exports = router;
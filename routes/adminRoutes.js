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

module.exports = router;
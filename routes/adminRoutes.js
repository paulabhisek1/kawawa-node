const express = require('express');
const router = express.Router();

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');

/* ############################################ Joi Validation Schema ############################################ */
const adminValidationSchema = require('../validation-schemas/AdminValidationSchema');

/* ############################################ Controllers ############################################ */
const adminController = require('../controllers/Admin/AdminController');

/* ############################################ Routes  ############################################ */

router.post('/login', validateRequest.validate(adminValidationSchema.loginSchema, 'body'), adminController.adminLogin); // System Login Route

module.exports = router;
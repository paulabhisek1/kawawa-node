/*!
 * UsersController.js
 * Containing all the controller actions related to `USER`
 * Author: Suman Rana
 * Date: 7th February, 2021`
 * MIT Licensed
 */
/**
 * Module dependencies.
 * @private
 */

// ################################ Repositories ################################ //
const userRepositories = require('../../repositories/UsersRepositories');

// ################################ Sequelize ################################ //
const sequelize = require('../../config/dbConfig').sequelize;

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

// ################################ Common Function ################################ //
const commonFunction = require('../../helpers/commonFunctions');

// ################################ NPM Packages ################################ //
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  registerUser
| Response          :  Respective response message in JSON format
| Logic             :  Register User
| Request URL       :  BASE_URL/api/register
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.registerUser = (req, res) => {
    (async() => {
        let purpose = "Register User"
        try {
            let body = req.body;
            let userCount = await userRepositories.count({ where: { email: body.email } });

            if (userCount == 0) {
                let userData;
                await sequelize.transaction(async(t) => {
                    let createUserData = {
                        full_name: body.full_name,
                        email: body.email,
                        mobile_no: body.mobile_no,
                        password: md5(body.password),
                        dob: body.dob,
                        profile_image: `/uploads/profile_images/default_image.png`,
                        country_id: body.country_id,
                        login_type: 'system',
                    }

                    userData = await userRepositories.create(createUserData, t);
                })

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;

                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                userData['access_token'] = accessToken;
                userData['refresh_token'] = refreshToken;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.registrationSuccess,
                    data: userData,
                    purpose: purpose
                })
            } else {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("REGISTER USER ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

/*
|------------------------------------------------ 
| API name          :  userLogin
| Response          :  Respective response message in JSON format
| Logic             :  User Login
| Request URL       :  BASE_URL/api/login
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.userLogin = (req, res) => {
    (async() => {
        let purpose = "User Login";
        try {
            let body = req.body;
            let whereData = {
                email: body.email,
                password: md5(body.password),
                is_active: 1
            }
            let userData = await userRepositories.findOne(whereData);

            if (userData) {
                let jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
                let jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;
                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;

                userData['access_token'] = accessToken;
                userData['refresh_token'] = refreshToken;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: userData,
                    purpose: purpose
                })
            } else {
                return res.status(403).send({
                    status: 403,
                    msg: responseMessages.invalidCreds,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("User Login ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

/*
|------------------------------------------------ 
| API name          :  socialLogin
| Response          :  Respective response message in JSON format
| Logic             :  Social Login
| Request URL       :  BASE_URL/api/social-login
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.socialLogin = (req, res) => {
    (async() => {
        let purpose = "Social Login";
        try {
            let body = req.body;
            let userDetails = await userRepositories.findOne({ email: body.email });
            if (userDetails) {
                let accessToken = jwt.sign({ user_id: userDetails.id, email: userDetails.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userDetails.id, email: userDetails.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);
                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken
                    },
                    purpose: purpose
                })
            } else {
                let createUserData = {
                    full_name: body.full_name,
                    email: body.email,
                    mobile_no: body.mobile_no ? body.mobile_no : null,
                    password: md5(body.password),
                    dob: body.dob ? body.dob : null,
                    profile_image: body.profile_image ? body.profile_image : null,
                    login_type: body.login_type,
                }

                let userData = await userRepositories.create(createUserData);

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;

                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                userData['access_token'] = accessToken;
                userData['refresh_token'] = refreshToken;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: userData,
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Social Login ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

/*
|------------------------------------------------ 
| API name          :  forgotPassword
| Response          :  Respective response message in JSON format
| Logic             :  Forgot Password
| Request URL       :  BASE_URL/api/forgot-password
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.forgotPassword = (req, res) => {
    (async() => {
        let purpose = "Forgot Password"
        try {
            let body = req.body;
            let userDetails = await userRepositories.findOne({ email: body.email });

            if (!userDetails) {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.invalidUser,
                    data: {},
                    purpose: purpose
                })
            }

            const otpValue = Math.floor(1000 + Math.random() * 9000);
            let updateData = await userRepositories.update({ id: userDetails.id }, { otp: otpValue });

            if (updateData[0] == 1) {
                let mailData = {
                    toEmail: userDetails.email,
                    subject: 'Forgot Password',
                    html: `<p>Your OTP is <b>${otpValue}</b></p>`
                }
                await commonFunction.sendMail(mailData);

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.otpSendMessgae,
                    data: {},
                    purpose: purpose
                })
            }
            console.log("UPDATE : ", updateData);
        } catch (e) {
            console.log("Forgot Password ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

/*
|------------------------------------------------ 
| API name          :  verifyOTP
| Response          :  Respective response message in JSON format
| Logic             :  Verify OTP
| Request URL       :  BASE_URL/api/verify-otp
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.verifyOTP = (req, res) => {
    (async() => {
        let purpose = "Verify OTP";
        try {
            let body = req.body;
            let whereData = {
                otp: body.otp,
                email: body.email
            }
            let checkOTP = await userRepositories.findOne(whereData)

            if (checkOTP) {
                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.validOTP,
                    data: {},
                    purpose: purpose
                })
            } else {
                return res.status(403).send({
                    status: 403,
                    msg: responseMessages.invalidOTP,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Verify OTP ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

/*
|------------------------------------------------ 
| API name          :  resetPassword
| Response          :  Respective response message in JSON format
| Logic             :  Reset Password
| Request URL       :  BASE_URL/api/reset-password
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.resetPassword = (req, res) => {
    (async() => {
        let purpose = "Reset Password";
        try {
            let body = req.body;
            let userDetails = await userRepositories.findOne({ otp: body.otp });

            if (userDetails) {
                let updateData = await userRepositories.update({ id: userDetails.id }, { password: md5(body.password), otp: null });

                if (updateData[0] == 1) {
                    return res.status(200).send({
                        status: 200,
                        msg: responseMessages.resetPass,
                        data: {},
                        purpose: purpose
                    })
                } else {
                    return res.status(500).send({
                        status: 500,
                        msg: responseMessages.serverError,
                        data: {},
                        purpose: purpose
                    })
                }
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.invalidOTP,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Reset Password ERROR : ", e);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
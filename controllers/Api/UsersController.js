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
    (async()=>{
        let purpose = "Register User"
        try{
            let body = req.body;
            let userCount = await userRepositories.count({ where: { email: body.email } });

            if(userCount == 0) {
                let userData;
                // const otpValue = Math.floor(1000 + Math.random() * 9000);
                await sequelize.transaction(async (t) => {
                    let createUserData = {
                        full_name: body.full_name,
                        email: body.email,
                        mobile_no: body.mobile_no,
                        password: md5(body.password),
                        dob: body.dob,
                        profile_image: `/uploads/profile_images/default_image.png`,
                        country_id: body.country_id,
                        login_type: 'system',
                        // otp: otpValue,
                    }

                    userData = await userRepositories.create(createUserData, t);
                })

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;
                

                let jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
                let jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;
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
            }
            else{
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(e) {
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
    (async()=>{
        let purpose = "User Login";
        try{
            let body = req.body;
            let whereData = {
                email: body.email,
                password: md5(body.password),
                is_active: 1
            }
            let userData = await userRepositories.findOne(whereData);

            if(userData) {
                let jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
                let jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;
                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken
                    },
                    purpose: purpose
                })
            }
            else{
                return res.status(403).send({
                    status: 403,
                    msg: responseMessages.invalidCreds,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(e) {
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
        try{
            let body = req.body;
            let whereData = {
                otp: body.otp,
                email: body.email
            }
            let checkOTP = await userRepositories.findOne(whereData)

            if(checkOTP) {
                let updateData = await userRepositories.update({ id: checkOTP.id }, { otp: null });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.validOTP,
                    data: {},
                    purpose: purpose
                })
            }
            else{
                return res.status(500).send({
                    status: 500,
                    msg: responseMessages.invalidOTP,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(e) {
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
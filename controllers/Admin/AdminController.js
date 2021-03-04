/*!
 * AdminController.js
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
const adminRepositories = require('../../repositories/AdminRepositories');

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
| API name          :  userLogin
| Response          :  Respective response message in JSON format
| Logic             :  User Login
| Request URL       :  BASE_URL/api/login
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.adminLogin = (req, res) => {
    (async() => {
        let purpose = "Admin Login";
        try {
            let body = req.body;
            let whereData = {
                email: body.email,
                password: md5(body.password),
                is_active: 1
            }
            let userData = await adminRepositories.findOne(whereData);

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
| API name          :  addCountry
| Response          :  Respective response message in JSON format
| Logic             :  Add Country
| Request URL       :  BASE_URL/api/country-add
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.addCountry = (req, res) => {
    (async()=>{
        let purpose = "Add Country";
        try{
            let body = req.body;
            let countryCount = await adminRepositories.countCountry({ country_code: body.country_code.toUpperCase() });

            if(countryCount > 0) {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.duplicateCountry,
                    data: {},
                    purpose: purpose
                })
            }
            else{
                let createData = {
                    name: body.name,
                    country_code: body.country_code.toUpperCase(),
                    telephone_code: body.telephone_code
                }

                let countryDet = await adminRepositories.addCountry(createData);
                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.countryAdd,
                    data: countryDet,
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Add Country ERROR : ", err);
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
| API name          :  listCountry
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Country List
| Request URL       :  BASE_URL/api/country-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.listCountry = (req, res) => {
    (async()=>{
        let purpose = "List Country";
        try{
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;

            let countryList = await adminRepositories.listCountry(where, data);
            let dataResp = {
                country_list: countryList.rows,
                total_count: countryList.count.length
            }
            return res.status(200).send({
                status: 200,
                msg: responseMessages.countryList,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("List Country ERROR : ", err);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
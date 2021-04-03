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
const artistRepositories = require('../../repositories/ArtistsRepositories');

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
| Request URL       :  BASE_URL/admin/login
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
| Request URL       :  BASE_URL/admin/country-add
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
| Request URL       :  BASE_URL/admin/country-list
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
            data.order = [];

            if(queryParam.sortKey && queryParam.sortType) {
                data.order = [[queryParam.sortKey, queryParam.sortType.toUpperCase()]];
            }
            else{
                data.order = [ ['is_active','DESC'], ['id', 'DESC'] ]
            }

            if(queryParam.search) {
                where.name = { $like: `%${queryParam.search}%` };
            }

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

/*
|------------------------------------------------ 
| API name          :  statusChangeCountry
| Response          :  Respective response message in JSON format
| Logic             :  Country Status Change
| Request URL       :  BASE_URL/admin/country-status-change/<< Country ID >>
| Request method    :  PUT
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.statusChangeCountry = (req, res) => {
    (async()=>{
        let purpose = "Country Status Change";
        try{
            let countryID = req.params.id;

            let countryDetails = await adminRepositories.fetchCountry({ id: countryID });

            if(countryDetails) {
                let updateData = {};
                if(countryDetails.is_active == 1)  updateData.is_active = 0;
                else updateData.is_active = 1;

                await adminRepositories.updateCountry({ id: countryID }, updateData);

                let respData = await adminRepositories.fetchCountry({ id: countryID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.countryUpdate,
                    data: {
                        country_details: respData
                    },
                    purpose: purpose
                })

            }
            else{
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.countryNoyFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Country Status Change ERROR : ", err);
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
| API name          :  addGenre
| Response          :  Respective response message in JSON format
| Logic             :  Add Genre
| Request URL       :  BASE_URL/admin/genre-add
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.addGenre = (req, res) => {
    (async()=>{
        let purpose = "Add Genre";
        try{
            let body = req.body;
            let genreCount = await adminRepositories.countGenre({ name: body.name });

            if(genreCount > 0) {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.duplicateGenre,
                    data: {},
                    purpose: purpose
                })
            }
            else{
                let createData = {
                    name: body.name,
                }

                let genreDet = await adminRepositories.addGenre(createData);

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.genreAdd,
                    data: genreDet,
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Add Genre ERROR : ", err);
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
| API name          :  listGenre
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Genre List
| Request URL       :  BASE_URL/admin/genre-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.listGenre = (req, res) => {
    (async()=>{
        let purpose = "List Genre";
        try{
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            
            if(queryParam.search) {
                where.name = { $like: `%${queryParam.search}%` };
            }

            let genreList = await adminRepositories.listGenre(where, data);
            let dataResp = {
                genre_list: genreList.rows,
                total_count: genreList.count.length
            }
            return res.status(200).send({
                status: 200,
                msg: responseMessages.genreList,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("List Genre ERROR : ", err);
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
| API name          :  deleteGenre
| Response          :  Respective response message in JSON format
| Logic             :  Delete Genre
| Request URL       :  BASE_URL/admin/delete-genre/<< Genre ID >>
| Request method    :  DELETE
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.deleteGenre = (req, res) => {
    (async()=>{
        let purpose = "Delete Genre";
        try{
            let genreID = req.params.id;

            let genreCount = await adminRepositories.countGenre({ id: genreID });

            if(genreCount > 0) {
                await adminRepositories.deleteGenre({ id: genreID })

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.genreDelete,
                    data: {},
                    purpose: purpose
                })

            }
            else{
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.genreNoyFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Delete Genre ERROR : ", err);
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
| API name          :  artistList
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Artist List
| Request URL       :  BASE_URL/admin/genre-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.listArtists = (req, res) => {
    (async()=>{
        let purpose = "Artists List"
        try{
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;

            if(queryParam.search) {
                where.full_name = { $like: `%${queryParam.search}%` };
            }

            let artistList = await artistRepositories.artistListAdmin(where, data);

            return res.status(200).json({
                status: 200,
                msg: responseMessages.artistListAdmin,
                data: {
                    artistList: artistList.rows,
                    totalCount: artistList.count.length
                },
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Artists List ERROR : ", err);
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
| API name          :  artistDetails
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Artist Details
| Request URL       :  BASE_URL/admin/artist-details/<< Artist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.artistDetails = (req, res) => {
    (async()=>{
        let purpose = "Artist Details"
        try {
            let artistID = req.params.id;

            let artistCount = await artistRepositories.count({ id: artistID });
            if (artistCount > 0) {
                let artistDetails = await artistRepositories.artistDetailsAdmin({ id: artistID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.artistDetailsFetch,
                    data: {
                        artist_details: artistDetails
                    },
                    purpose: purpose
                })
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.artistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Artist Details ERROR : ", err);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}

module.exports.verifyArtist = (req, res) => {
    (async()=>{
        let purpose = "Verify Artist";
        try {
            let artistID = req.params.id;

            let artistCount = await artistRepositories.count({ id: artistID });

            if (artistCount > 0) {
                let artistDetails = await artistRepositories.artistDetailsAdmin({ id: artistID });

                let updateData = {};
                updateData.is_active = !artistDetails.is_active;

                await artistRepositories.updateArtist({ id: artistID }, updateData);

                let msg = '';
                if(artistDetails.is_active == 0) msg = 'Artist verified successfully';
                else msg = 'Artist unverified successfully';

                return res.status(200).send({
                    status: 200,
                    msg: msg,
                    data: {},
                    purpose: purpose
                })
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.artistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Verify Artist ERROR : ", err);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
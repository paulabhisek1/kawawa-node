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
const songRepository = require('../../repositories/SongsRepository');
const artistRepositories = require('../../repositories/ArtistsRepositories');

// ################################ Sequelize ################################ //
const sequelize = require('../../config/dbConfig').sequelize;

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

// ################################ Common Function ################################ //
// const commonFunction = require('../../helpers/commonFunctions');

// ################################ NPM Packages ################################ //
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  fetchHomePageData
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Home Page Data
| Request URL       :  BASE_URL/api/fetchHomePageData
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.fetchHomePageData = (req, res) => {
    (async() => {
        let purpose = "Fetch Home Page Data";
        try {
            let whereData = { is_active: 1 };
            let songsData = await songRepository.findAll(whereData);
            let artistData = await artistRepositories.findAll(whereData);

            let data = {
                recently_played: songsData,
                recomended: songsData,
                weekly_top: songsData,
                artist: artistData,
                free_songs: songsData,
            }

            return res.send({
                status: 200,
                msg: responseMessages.homeFetch,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("Fetch Home Page Data Error : ", e);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
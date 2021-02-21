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

/*
|------------------------------------------------ 
| API name          :  allRecentlyPlayed
| Response          :  Respective response message in JSON format
| Logic             :  See All Recently played songs
| Request URL       :  BASE_URL/api/allRecentlyPlayed
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allRecentlyPlayed = (req, res) => {
    (async() => {
        let purpose = "All Recently played songs";
        try {
            let whereData = { is_active: 1 };
            let allRecentlyPlayed = await songRepository.findAll(whereData);

            let data = {
                recently_played: allRecentlyPlayed,
            }

            return res.send({
                status: 200,
                msg: responseMessages.allrecentlyplayed,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("All Recently played songs Error : ", e);
            return res.send({
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
| API name          :  allRecommend
| Response          :  Respective response message in JSON format
| Logic             :  See All Recommend songs
| Request URL       :  BASE_URL/api/allRecommend
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allRecommend = (req, res) => {
    (async() => {
        let purpose = "All Recommend songs";
        try {
            let whereData = { is_active: 1 };
            let allrecommend = await songRepository.findAll(whereData);

            let data = {
                allrecommend: allrecommend,
            }

            return res.send({
                status: 200,
                msg: responseMessages.allrecommend,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("All Recommend songs Error : ", e);
            return res.send({
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
| API name          :  allWeeklyTop
| Response          :  Respective response message in JSON format
| Logic             :  See All weekly top songs
| Request URL       :  BASE_URL/api/allWeeklyTop
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allWeeklyTop = (req, res) => {
    (async() => {
        let purpose = "All weekly top songs";
        try {
            let whereData = { is_active: 1 };
            let allweeklytop = await songRepository.findAll(whereData);

            let data = {
                allweeklytop: allweeklytop,
            }

            return res.send({
                status: 200,
                msg: responseMessages.allweeklytop,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("All weekly top songs Error : ", e);
            return res.send({
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
| API name          :  allArtist
| Response          :  Respective response message in JSON format
| Logic             :  See All Artist
| Request URL       :  BASE_URL/api/allArtist
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allArtist = (req, res) => {
    (async() => {
        let purpose = "All Artist";
        try {
            let whereData = { is_active: 1 };
            let allartist = await artistRepositories.findAll(whereData);

            let data = {
                allartist: allartist,
            }

            return res.send({
                status: 200,
                msg: responseMessages.allartist,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("All Artist Error : ", e);
            return res.send({
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
| API name          :  allFreeSongs
| Response          :  Respective response message in JSON format
| Logic             :  See All Free songs
| Request URL       :  BASE_URL/api/allFreeSongs
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allFreeSongs = (req, res) => {
    (async() => {
        let purpose = "All Free Songs";
        try {
            let whereData = { is_active: 1, is_paid: 0 };
            let allfreesongs = await songRepository.findAll(whereData);

            let data = {
                allfreesongs: allfreesongs,
            }

            return res.send({
                status: 200,
                msg: responseMessages.allfreesongs,
                data: data,
                purpose: purpose
            })
        } catch (e) {
            console.log("All Free Songs Error : ", e);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
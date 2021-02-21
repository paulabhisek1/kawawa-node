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
const userPlayedHistoryRepo = require('../../repositories/UserPlayedHistoriesRepositories');
const artistRepository = require('../../repositories/ArtistsRepositories');

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
            let where = {};
            let data = {};
            let subData = {};
            subData.limit = 4;
            data.limit = 10;
            let userID = req.headers.userID;

            // Recently Played
            where.user_id = userID;
            let allRecentlyPlayed = await userPlayedHistoryRepo.recentlyPlayed(where, data);
            let newAllRecentlyPlayed = [];
            allRecentlyPlayed.forEach((item, index) => {
                newAllRecentlyPlayed.push(item.song_details);
            });
            console.log('newAllRecentlyPlayed', newAllRecentlyPlayed);
            if (newAllRecentlyPlayed.artist_details.genre_details == "") { newAllRecentlyPlayed.artist_details.genre_details = {}; }
            allRecentlyPlayed = newAllRecentlyPlayed;

            // Free Songs
            where = {};
            data = {};
            where.is_active = 1;
            where.is_paid = 0;
            let freeSongs = await songRepository.freeSongs(where, data);

            // Artist List
            where = {};
            where.is_active = 1;
            let artistData = await artistRepositories.artistList(where);

            // Recommended
            let allRecenData = await userPlayedHistoryRepo.recentlyPlayedAllData({ user_id: userID });
            where = {};
            let recommendArtistList = [];
            let recommentGenreList = [];
            allRecenData.forEach((item, index) => {
                if (recommendArtistList.findIndex(x => x === item.song_details.artist_details.id) < 0) {
                    recommendArtistList.push(item.song_details.artist_details.id)
                }
                if (recommentGenreList.findIndex(x => x === item.song_details.genre_details.id) < 0) {
                    recommentGenreList.push(item.song_details.genre_details.id)
                }
            })
            where.$or = [
                { artist_id: { $in: recommendArtistList } },
                { genre_id: { $in: recommentGenreList } },
            ];
            where.is_active = 1;
            let recommendedSongsData = await songRepository.recommendedSongs(where, data);

            // Weekly Top 10
            where = {};
            where.is_active = 1;
            let topTenSongsData = await songRepository.weeklyTopTen(where, subData);

            let dataResp = {
                recently_played: allRecentlyPlayed,
                recomended: recommendedSongsData,
                weekly_top: topTenSongsData,
                artist: artistData,
                free_songs: freeSongs,
            }

            return res.send({
                status: 200,
                msg: responseMessages.homeFetch,
                data: dataResp,
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
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let userID = req.headers.userID;
            where.user_id = userID;
            let allRecentlyPlayed = await userPlayedHistoryRepo.allRecentlyPlayed(where, data);

            let newAllRecentlyPlayed = [];
            allRecentlyPlayed.rows.forEach((item, index) => {
                newAllRecentlyPlayed.push(item.song_details);
            });

            let dataResp = {
                recently_played: newAllRecentlyPlayed,
                total_count: allRecentlyPlayed.count.length
            }

            return res.send({
                status: 200,
                msg: responseMessages.allrecentlyplayed,
                data: dataResp,
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
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let userID = req.headers.userID;
            where.user_id = userID;
            let allRecenData = await userPlayedHistoryRepo.recentlyPlayedAllData({ user_id: userID });
            let recommendArtistList = [];
            let recommentGenreList = [];
            allRecenData.forEach((item, index) => {
                if (recommendArtistList.findIndex(x => x === item.song_details.artist_details.id) < 0) {
                    recommendArtistList.push(item.song_details.artist_details.id)
                }
                if (recommentGenreList.findIndex(x => x === item.song_details.genre_details.id) < 0) {
                    recommentGenreList.push(item.song_details.genre_details.id)
                }
            })
            where = {};
            where.$or = [
                { artist_id: { $in: recommendArtistList } },
                { genre_id: { $in: recommentGenreList } },
            ];
            where.is_active = 1;
            let recommendedSongsData = await songRepository.recommendedSongsPaginate(where, data);

            let dataResp = {
                allrecommend: recommendedSongsData.rows,
                total_count: recommendedSongsData.count.length
            }

            return res.send({
                status: 200,
                msg: responseMessages.allrecommend,
                data: dataResp,
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
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let userID = req.headers.userID;
            where.is_active = 1;
            let allweeklytop = await songRepository.weeklyTopTenPaginate(where, data);

            let dataResp = {
                allweeklytop: allweeklytop.rows,
                total_count: allweeklytop.count.length
            }

            return res.send({
                status: 200,
                msg: responseMessages.allweeklytop,
                data: dataResp,
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
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let userID = req.headers.userID;
            where.is_active = 1;
            let allartist = await artistRepositories.artistListPaginate(where, data);

            let dataResp = {
                allartist: allartist.rows,
                total_count: allartist.count.length
            }

            return res.send({
                status: 200,
                msg: responseMessages.allartist,
                data: dataResp,
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
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let userID = req.headers.userID;
            where.is_active = 1;
            where.is_paid = 0;
            let allfreesongs = await songRepository.freeSongsPaginate(where, data);

            let dataResp = {
                allfreesongs: allfreesongs.rows,
                total_count: allfreesongs.count.length
            }

            return res.send({
                status: 200,
                msg: responseMessages.allfreesongs,
                data: dataResp,
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

/*
|------------------------------------------------ 
| API name          :  favouriteAndUnfavourite
| Response          :  Respective response message in JSON format
| Logic             :  See All Free songs
| Request URL       :  BASE_URL/api/mark-unmark-liked/<<Song ID>>
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.favouriteAndUnfavourite = (req, res) => {
    (async() => {
        let purpose = "Mark Favourite & Unfavourite";
        try {
            let songID = req.params.id;
            let userID = req.headers.userID;
            let songDetails = await songRepository.findOne({ id: songID, is_active: 1 });

            if (songDetails) {
                let favDetails = await songRepository.favouriteFindDetails({ user_id: userID, file_id: songID });
                if (favDetails) {
                    await songRepository.favDestroy({ id: favDetails.id });

                    return res.send({
                        status: 404,
                        msg: responseMessages.unfavMessage,
                        data: {},
                        purpose: purpose
                    })
                } else {
                    let createData = {
                        user_id: userID,
                        file_id: songDetails.id,
                        type: songDetails.type
                    }
                    await songRepository.markFavouriteInsert(createData);

                    return res.send({
                        status: 404,
                        msg: responseMessages.favMessage,
                        data: {},
                        purpose: purpose
                    })
                }
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.songNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (err) {
            console.log("Mark Favourite & Unfavourite Error : ", err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
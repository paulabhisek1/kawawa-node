/*!
 * PodcastsController.js
 * Containing all the controller actions related to `PODCASTS`
 * Author: Suman Rana
 * Date: 7th May, 2021`
 * MIT Licensed
 */
/**
 * Module dependencies.
 * @private
 */

// ################################ Repositories ################################ //
const podcastRepository = require('../../repositories/PodcastRepositories');
const artistRepositories = require('../../repositories/ArtistsRepositories');
const userRepositories = require('../../repositories/UsersRepositories');
const userPlayedHistoryRepo = require('../../repositories/UserPlayedHistoriesRepositories');

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
const { allrecentlyplayed } = require('../../ResponseMessages');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  podcastHomepage
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Home Page Data For Podcasts
| Request URL       :  BASE_URL/api/podcast/homepage
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.podcastHomepage = (req, res) => {
    (async()=>{
        let purpose = "Podcast Homepage";
        try {
            let whereCategory = {
                where: { is_active: 1 },
                order: [['createdAt','desc']]
            };
            let podcastCategories = await podcastRepository.findAllPodcastCategory(whereCategory);
            podcastCategories.unshift(
                {
                    "id": 0,
                    "name": "All",
                    "is_active": 1,
                }
            )

            let where = {};
            let data = {};
            data.limit = 6;
            let userID = req.headers.userID;
            data.user_id = userID;

            // Recently Played
            where.user_id = userID;
            where.type = 'podcast';
            let allRecentlyPlayed = await userPlayedHistoryRepo.recentlyPlayedPodcasts(where, data);
            let newAllRecentlyPlayed = [];
            allRecentlyPlayed.forEach((item, index) => {
                item.podcast_details.playListId = item.id; // Push the playlist item id it the array
                if (item.podcast_details.podcast_category_details == '') {
                    item.podcast_details.podcast_category_details = {};
                }
                if (item.podcast_details.podcast_artist_details == '') {
                    item.podcast_details.podcast_artist_details = {};
                }
                newAllRecentlyPlayed.push(item.podcast_details);
            });
            allRecentlyPlayed = newAllRecentlyPlayed;

            let queryParam = req.query;
            where = {};
            data = {};
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if(queryParam.category_id && queryParam.category_id > 0) where.category_id = queryParam.category_id;
            where.is_active = 1;
            data.user_id = userID;
            let allPodcastsList = await podcastRepository.userPodcastList(where, data);

            allPodcastsList.rows.forEach((item, index) => {
                item.playListId = item.id
                if (item.podcast_category_details == '') {
                    item.podcast_category_details = {};
                }
                if (item.artist_details == '') {
                    item.artist_details = {};
                }
            });

            let totalPages = Math.ceil(allPodcastsList.count.length / data.limit);

            let dataResp = {
                categories: podcastCategories,
                recentlyPlayed: allRecentlyPlayed,
                podcastsList: {
                    podcasts: allPodcastsList.rows,
                    total_count: allPodcastsList.count.length,
                    total_page: totalPages
                }
            }

            return res.send({
                status: 200,
                msg: responseMessages.homeFetch,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Podcast Homepage Error : ", err);
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
| Logic             :  Fetch All Recently Played Podcasts
| Request URL       :  BASE_URL/api/podcast/all-recently-played
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allRecentlyPlayed = (req, res) => {
    (async()=>{
        let purpose = "All Recently Played Podcasts";
        try {
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            let userID = req.headers.userID;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            where.user_id = userID;
            where.type = 'podcast';
            data.user_id = userID;

            let allRecentlyPlayedPodcasts = await userPlayedHistoryRepo.allRecentlyPlayedPodcasts(where, data);
            let newAllRecentlyPlayed = [];
            allRecentlyPlayedPodcasts.rows.forEach((item, index) => {
                item.podcast_details.playListId = item.id; // Push the playlist item id it the array
                if (item.podcast_details.podcast_category_details == '') {
                    item.podcast_details.podcast_category_details = {};
                }
                if (item.podcast_details.podcast_artist_details == '') {
                    item.podcast_details.podcast_artist_details = {};
                }
                newAllRecentlyPlayed.push(item.podcast_details);
            });
            allRecentlyPlayedPodcasts.rows = newAllRecentlyPlayed;

            let totalPages = Math.ceil(allRecentlyPlayedPodcasts.count.length / data.limit);

            let dataResp = {
                podcasts: allRecentlyPlayedPodcasts.rows,
                total_count: allRecentlyPlayedPodcasts.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.allrecentlyplayedpodcasts,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("All Recently Played Podcasts Error : ", err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
/*!
 * ArtistController.js
 * Containing all the controller actions related to `ARTIST`
 * Author: Suman Rana
 * Date: 7th February, 2021`
 * MIT Licensed
 */
/**
 * Module dependencies.
 * @private
 */

// ################################ Repositories ################################ //
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
| API name          :  followArtist
| Response          :  Respective response message in JSON format
| Logic             :  Follow & Unfollow Artist
| Request URL       :  BASE_URL/api/artist-follow/<< Artist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.followArtist = (req, res) => {
    (async()=>{
        let purpose = "Follow Artist"
        try{
            let artistID = req.params.id;
            let userID = req.headers.userID;

            let artistDetails = await artistRepositories.findOne({ id: artistID, is_active: 1 });

            if(artistDetails) {
                let followDetails = await artistRepositories.followDetails({ user_id: userID, artist_id: artistID });

                if(followDetails) {
                    await artistRepositories.unfollowArtist({ id: followDetails.id });

                    return res.send({
                        status: 200,
                        msg: `${responseMessages.artistUnfollowed} ${artistDetails.full_name}`,
                        data: {
                            isFollowedArtist: 0
                        },
                        purpose: purpose
                    })
                }
                else{
                    await artistRepositories.followArtist({user_id: userID, artist_id: artistID  });

                    return res.send({
                        status: 200,
                        msg: `${responseMessages.artistFollowed} ${artistDetails.full_name}`,
                        data: {
                            isFollowedArtist: 1
                        },
                        purpose: purpose
                    })
                }
            }
            else{
                return res.send({
                    status: 404,
                    msg: responseMessages.artistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Follow Artist Error : ", err);
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
| API name          :  followArtist
| Response          :  Respective response message in JSON format
| Logic             :  Follow & Unfollow Artist
| Request URL       :  BASE_URL/api/artist-follow/<< Artist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allFollowedArtists = (req, res) => {
    (async()=>{
        let purpose = "Follow Artist"
        try{
            let userID = req.headers.userID;

            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            where.is_active = 1;
            data.user_id = userID;

            let artistList = await artistRepositories.followedArtistList(where, { user_id: userID });

            let totalPages = Math.ceil(artistList.count.length / data.limit);
            let dataResp = {
                followedArtists: artistList.rows,
                total_count: artistList.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.followedArtists,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Follow Artist List Error : ", err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
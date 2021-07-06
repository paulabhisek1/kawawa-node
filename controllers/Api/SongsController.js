/*!
 * SongsController.js
 * Containing all the controller actions related to `SONGS`
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
const albumRepository = require('../../repositories/AlbumRepositories');
const playlistRepository = require('../../repositories/PlaylistRepositories');
const userRepositories = require('../../repositories/UsersRepositories');
const podcastRepositories = require('../../repositories/PodcastRepositories');
const genresRepositories = require('../../repositories/GenresRepositories');

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
            data.limit = 6;
            let userID = req.headers.userID;
            data.user_id = userID;

            // Recently Played
            where.user_id = userID;
            where.type = 'song';
            let allRecentlyPlayed = await userPlayedHistoryRepo.recentlyPlayed(where, data);
            let newAllRecentlyPlayed = [];
            allRecentlyPlayed.forEach((item, index) => {
                item.song_details.playListId = item.id; // Push the playlist item id it the array
                if (item.song_details.genre_details == '') {
                    item.song_details.genre_details = {};
                }
                if (item.song_details.album_details == '') {
                    item.song_details.album_details = {};
                }
                newAllRecentlyPlayed.push(item.song_details);
            });
            allRecentlyPlayed = newAllRecentlyPlayed;

            // Free Songs
            where = {};
            where.is_active = 1;
            where.is_paid = 0;
            let freeSongs = await songRepository.freeSongs(where, data);
            freeSongs.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            // Artist List
            where = {};
            where.is_active = 1;
            let artistData = await artistRepositories.artistList(where);

            // Recommended
            let allRecenData = await userPlayedHistoryRepo.recentlyPlayedAllData({ user_id: userID });
            let followedArtists = await artistRepositories.followedArtistsList({ user_id: userID });
            where = {};
            let recommendArtistList = [];
            let recommentGenreList = [];
            let followedArtistsList = [];
            followedArtists.forEach((item, index) => {
                followedArtistsList.push(item.artist_id);
            })

            allRecenData.forEach((item, index) => {
                if (recommendArtistList.findIndex(x => x === item.song_details.artist_details.id) < 0) {
                    recommendArtistList.push(item.song_details.artist_details.id)
                }
                if (recommentGenreList.findIndex(x => x === item.song_details.genre_details.id) < 0) {
                    recommentGenreList.push(item.song_details.genre_details.id)
                }
            })

            let artistsList = [...new Set([...recommendArtistList, ...followedArtistsList])]

            where.$or = [
                { artist_id: { $in: artistsList } },
                { genre_id: { $in: recommentGenreList } },

            ];
            where.is_active = 1;
            let recommendedSongsData = await songRepository.recommendedSongs(where, data);

            if (recommendedSongsData.length < 6) {
                let userDetails = await userRepositories.findOne({ id: userID });
                let newWhere = {
                    is_active: 1,
                    country_id: userDetails.country_id
                }
                let newData = {
                    user_id: userID,
                    limit: (data.limit - recommendedSongsData.length)
                }
                let recommendedSongsDataNew = await songRepository.findAndCountAll(newWhere, newData);

                recommendedSongsDataNew.rows.forEach((item, index) => {
                    let ind = recommendedSongsData.findIndex(x => x.id === item.id);
                    if (ind < 0) recommendedSongsData.push(item);
                })
            }

            recommendedSongsData.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            // Weekly Top 10
            where = {};
            where.is_active = 1;
            let topTenSongsData = await songRepository.weeklyTopTen(where, data);
            topTenSongsData.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

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
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            let userID = req.headers.userID;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.user_id = userID;
            where.type = 'song';
            data.user_id = userID;


            let allRecentlyPlayed = await userPlayedHistoryRepo.allRecentlyPlayed(where, data);

            let newAllRecentlyPlayed = [];
            allRecentlyPlayed.rows.forEach((item, index) => {
                item.song_details.playListId = item.id; // Push the playlist item id it the array
                if (item.song_details.genre_details == '') {
                    item.song_details.genre_details = {};
                }
                if (item.song_details.album_details == '') {
                    item.song_details.album_details = {};
                }
                newAllRecentlyPlayed.push(item.song_details);
            });

            // Implementing Circular Queue
            if (allRecentlyPlayed.count.length < data.limit && playlistId > 0 && (numberOfItems > allRecentlyPlayed.count.length)) {
                data.limit = data.limit - parseInt(allRecentlyPlayed.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newRecentlyPlayed = await userPlayedHistoryRepo.allRecentlyPlayed(where, data);

                let newAllRecentlyPlayed2 = [];
                newRecentlyPlayed.rows.forEach((item, index) => {
                    item.song_details.playListId = item.id; // Push the playlist item id it the array
                    if (item.song_details.genre_details == '') {
                        item.song_details.genre_details = {};
                    }
                    if (item.song_details.album_details == '') {
                        item.song_details.album_details = {};
                    }
                    newAllRecentlyPlayed2.push(item.song_details);
                });

                allRecentlyPlayed.count.length = allRecentlyPlayed.count.length + newRecentlyPlayed.count.length;
                newAllRecentlyPlayed = newAllRecentlyPlayed.concat(newAllRecentlyPlayed2);
            }

            let totalPages = Math.ceil(allRecentlyPlayed.count.length / data.limit);
            let dataResp = {
                recently_played: newAllRecentlyPlayed,
                total_count: allRecentlyPlayed.count.length,
                total_page: totalPages
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
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            let userID = req.headers.userID;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if (playlistId > 0) where.id = { $lte: playlistId };
            // where.user_id = userID;
            data.user_id = userID;

            let followedArtists = await artistRepositories.followedArtistsList({ user_id: userID });
            let allRecenData = await userPlayedHistoryRepo.recentlyPlayedAllData({ user_id: userID });
            let recommendArtistList = [];
            let recommentGenreList = [];
            let followedArtistsList = [];
            followedArtists.forEach((item, index) => {
                followedArtistsList.push(item.artist_id);
            })

            allRecenData.forEach((item, index) => {
                if (recommendArtistList.findIndex(x => x === item.song_details.artist_details.id) < 0) {
                    recommendArtistList.push(item.song_details.artist_details.id)
                }
                if (recommentGenreList.findIndex(x => x === item.song_details.genre_details.id) < 0) {
                    recommentGenreList.push(item.song_details.genre_details.id)
                }
            })
            let artistsList = [...new Set([...recommendArtistList, ...followedArtistsList])]
            where.$or = [
                { artist_id: { $in: artistsList } },
                { genre_id: { $in: recommentGenreList } },
            ];
            where.is_active = 1;
            let recommendedSongsData = await songRepository.recommendedSongsPaginate(where, data);


            if (recommendedSongsData.count.length < data.limit) {
                let userDetails = await userRepositories.findOne({ id: userID });
                let newWhere = {
                    is_active: 1,
                    country_id: userDetails.country_id
                }
                let newData = {
                    user_id: userID,
                    limit: (data.limit - recommendedSongsData.count.length)
                }
                let recommendedSongsDataNew = await songRepository.findAndCountAll(newWhere, newData);

                recommendedSongsDataNew.rows.forEach((item, index) => {
                    let ind = recommendedSongsData.rows.findIndex(x => x.id === item.id);
                    if (ind < 0) {
                        recommendedSongsData.rows.push(item);
                        recommendedSongsData.count.length += 1;
                    }
                })
            }

            // Implementing Circular Queue
            if (recommendedSongsData.count.length < data.limit && playlistId > 0 && (numberOfItems > recommendedSongsData.count.length)) {
                data.limit = data.limit - parseInt(recommendedSongsData.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newRecomendedSongs = await songRepository.recommendedSongsPaginate(where, data);

                recommendedSongsData.count.length = recommendedSongsData.count.length + newRecomendedSongs.count.length;
                recommendedSongsData.rows = recommendedSongsData.rows.concat(newRecomendedSongs.rows);
            }

            recommendedSongsData.rows.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            let totalPages = Math.ceil(recommendedSongsData.count.length / data.limit);

            let dataResp = {
                allrecommend: recommendedSongsData.rows,
                total_count: recommendedSongsData.count.length,
                total_page: totalPages
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
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 10;
            let userID = req.headers.userID;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            data.user_id = userID;
            let allweeklytop = await songRepository.weeklyTopTenPaginate(where, data);
            allweeklytop.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            // // Implementing Circular Queue
            // if(allweeklytop.length < 10 && playlistId > 0) {
            //     data.limit = 10 - parseInt(allweeklytop.count.length);
            //     data.offset = data.limit ? data.limit * (page - 1) : null;
            //     if (playlistId > 0) where.id = { $gt: playlistId };

            //     let newWeeklyTop = await songRepository.weeklyTopTenPaginate(where, data);
            //     newWeeklyTop.rows.forEach((item, index) => {
            //         element.playListId = element.id
            //     });

            //     allweeklytop = allweeklytop.concat(newWeeklyTop);
            // }

            let dataResp = {
                allweeklytop: allweeklytop,
                // total_count: allweeklytop.count.length
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
            data.user_id = userID;
            where.is_active = 1;
            let allartist = await artistRepositories.artistListPaginate(where, data);
            allartist.rows.forEach(element => {

                if (element.is_artist_followed.length > 0) {
                    element.is_followed = 1;
                } else {
                    element.is_followed = 0;
                }
                delete element.is_artist_followed;
            });

            //console.log('-----------------------', allartist.rows);

            let totalPages = Math.ceil(allartist.count.length / 20);
            let dataResp = {
                allartist: allartist.rows,
                total_count: allartist.count.length,
                total_page: totalPages
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
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            let userID = req.headers.userID;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            where.is_paid = 0;
            data.user_id = userID;

            let allfreesongs = await songRepository.freeSongsPaginate(where, data);
            allfreesongs.rows.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            // Implementing Circular Queue
            if (allfreesongs.count.length < data.limit && playlistId > 0 && (numberOfItems > allfreesongs.count.length)) {
                data.limit = data.limit - parseInt(allfreesongs.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newAllFreeSongs = await songRepository.freeSongsPaginate(where, data);
                newAllFreeSongs.rows.forEach((item, index) => {
                    item.playListId = item.id
                    if (item.genre_details == '') {
                        item.genre_details = {};
                    }
                    if (item.album_details == '') {
                        item.album_details = {};
                    }
                });

                allfreesongs.count.length = allfreesongs.count.length + newAllFreeSongs.count.length
                allfreesongs.rows = allfreesongs.rows.concat(newAllFreeSongs.rows);
            }

            let totalPages = Math.ceil(allfreesongs.count.length / data.limit);
            let dataResp = {
                allfreesongs: allfreesongs.rows,
                total_count: allfreesongs.count.length,
                total_page: totalPages
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
| Logic             :  Favourite And Unfavourite Song
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
                        status: 200,
                        msg: responseMessages.unfavMessage,
                        data: {
                            isFavourite: 0
                        },
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
                        status: 200,
                        msg: responseMessages.favMessage,
                        data: {
                            isFavourite: 1
                        },
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

/*
|------------------------------------------------ 
| API name          :  artistWiseTrack
| Response          :  Respective response message in JSON format
| Logic             :  Artist Wise Songs & Albums
| Request URL       :  BASE_URL/api/artist-songs?page=<< Page No >>&artist_id=<< Artist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.artistWiseTrack = (req, res) => {
    (async() => {
        let purpose = "Artist Wise Track List"
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let artistID = queryParam.artist_id;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            where.album_id = 0;
            where.artist_id = artistID;
            data.user_id = userID;

            let artistDetails = await artistRepositories.artistDetails({ id: artistID, is_active: 1 }, { user_id: userID });

            if (artistDetails) {

                if (artistDetails.is_followed == "") artistDetails.is_followed = {};
                let artistSongs = await songRepository.findAndCountAll(where, data);
                let albumsList = await albumRepository.findAll({ artist_id: artistID, is_active: 1, total_songs: { $gt: 0 } }, 6)


                // Implementing Circular Queue
                if (artistSongs.count.length < data.limit && playlistId > 0 && (numberOfItems > artistSongs.count.length)) {
                    data.limit = data.limit - parseInt(artistSongs.count.length);
                    data.offset = data.limit ? data.limit * (page - 1) : null;
                    if (playlistId > 0) where.id = { $gt: playlistId };

                    let newArtistSongs = await songRepository.findAndCountAll(where, data);

                    artistSongs.count.length = artistSongs.count.length + newArtistSongs.count.length
                    artistSongs.rows = artistSongs.rows.concat(newArtistSongs.rows);
                }

                let totalPages = Math.ceil(artistSongs.count.length / 20);

                artistSongs.rows.forEach((item, index) => {
                    item.playListId = item.id;
                    if (item.genre_details == '') {
                        item.genre_details = {};
                    }
                    if (item.album_details == '') {
                        item.album_details = {};
                    }
                })

                let dataResp = {
                    artist_details: artistDetails,
                    artist_songs: {
                        songs: artistSongs.rows,
                        total_count: artistSongs.count.length
                    },
                    albums_list: albumsList,
                    total_page: totalPages
                }

                return res.send({
                    status: 200,
                    msg: responseMessages.artistSongs,
                    data: dataResp,
                    purpose: purpose
                })
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.artistNotFound,
                    data: {},
                    purpose: purpose
                })
            }


        } catch (err) {
            console.log("Artist Wise Track List : ", err);
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
| API name          :  albumWiseTrack
| Response          :  Respective response message in JSON format
| Logic             :  Album Wise Songs
| Request URL       :  BASE_URL/api/album-songs?page=<< Page No >>&album_id=<< Album ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.albumWiseTrack = (req, res) => {
    (async() => {
        let purpose = "Album Wise Track List"
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let albumID = queryParam.album_id;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            where.album_id = albumID;
            data.user_id = userID;

            let albumSongs = await songRepository.findAndCountAll(where, data);

            // Implementing Circular Queue
            if (albumSongs.count.length < data.limit && playlistId > 0 && (numberOfItems > albumSongs.count.length)) {
                data.limit = data.limit - parseInt(albumSongs.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newAlbumSongs = await songRepository.findAndCountAll(where, data);

                albumSongs.count.length = albumSongs.count.length + newAlbumSongs.count.length
                albumSongs.rows = albumSongs.rows.concat(newAlbumSongs.rows);
            }

            albumSongs.rows.forEach((item, index) => {
                item.playListId = item.id
                if (item.genre_details == '') {
                    item.genre_details = {};
                }
                if (item.album_details == '') {
                    item.album_details = {};
                }
            });

            let totalPages = Math.ceil(albumSongs.count.length / 20);
            let dataResp = {
                album_songs: albumSongs.rows,
                total_count: albumSongs.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.albumSongs,
                data: dataResp,
                purpose: purpose
            })
        } catch (err) {
            console.log("Album Wise Track List Err : ", err);
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
| API name          :  allAlbumsList
| Response          :  Respective response message in JSON format
| Logic             :  See All Albums
| Request URL       :  BASE_URL/api/artist-albums?page=<< Page No >>&artist_id=<< Artist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allAlbumsList = (req, res) => {
    (async() => {
        let purpose = "All Albums List"
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let artistID = queryParam.artist_id;
            where.is_active = 1;
            where.artist_id = artistID;
            where.total_songs = { $gt: 0 };
            data.user_id = userID;

            let albumList = await albumRepository.findAndCountAll(where, data);
            let totalPages = Math.ceil(albumList.count.length / 20);
            let dataResp = {
                all_albums: albumList.rows,
                total_count: albumList.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.albumList,
                data: dataResp,
                purpose: purpose
            })
        } catch (err) {
            console.log("All Albums List Err : ", err);
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
| API name          :  createPlaylist
| Response          :  Respective response message in JSON format
| Logic             :  Create Playlist
| Request URL       :  BASE_URL/api/create-playlist
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.createPlaylist = (req, res) => {
    (async() => {
        let purpose = "Create Playlist"
        try {
            let userID = req.headers.userID;
            let body = req.body;

            let createData = {
                name: body.name,
                user_id: userID
            }
            let playlistData = await playlistRepository.createPlaylist(createData);

            return res.send({
                status: 200,
                msg: responseMessages.playlistCreate,
                data: {
                    playlist: playlistData
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Create Playlist Error : ", err);
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
| API name          :  addSongToPlaylist
| Response          :  Respective response message in JSON format
| Logic             :  Add Song To Playlist
| Request URL       :  BASE_URL/api/add-song-to-playlist
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.addRemoveSongToPlaylist = (req, res) => {
    (async() => {
        let purpose = "Add Song To Playlist"
        try {
            let playlistID = req.body.playlist_id;
            let songID = req.body.file_id;
            let userID = req.headers.userID;

            let playlistDetails = await playlistRepository.findOne({ id: playlistID, user_id: userID });

            if (playlistDetails) {
                let songCount = await songRepository.count({ id: songID, is_active: 1, type: 'song' });

                if (songCount > 0) {
                    let playlistSong = await playlistRepository.playlistSongsCount({ file_id: songID, playlist_id: playlistID, type: 'song' });

                    if (playlistSong > 0) {
                        await playlistRepository.removeFile({ playlist_id: playlistID, file_id: songID, type: 'song' });
                
                        return res.send({
                            status: 200,
                            msg: `Removed from ${playlistDetails.name}`,
                            data: {},
                            purpose: purpose
                        })
                    } else {
                        let createData = {
                            file_id: songID,
                            playlist_id: playlistID,
                            type: 'song'
                        }
                        await playlistRepository.playlistSongsAdd(createData);

                        return res.send({
                            status: 200,
                            msg: `Added to ${playlistDetails.name}`,
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
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.playlistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (err) {
            console.log("Add Song To Playlist Error : ", err);
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
| API name          :  addSongToPlaylist
| Response          :  Respective response message in JSON format
| Logic             :  Add Podcast To Playlist
| Request URL       :  BASE_URL/api/add-podcast-to-playlist
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.addRemovePodcastToPlaylist = (req, res) => {
    (async() => {
        let purpose = "Add Podcast To Playlist"
        try {
            let playlistID = req.body.playlist_id;
            let podcastID = req.body.file_id;
            let userID = req.headers.userID;

            let playlistDetails = await playlistRepository.findOne({ id: playlistID, user_id: userID });

            if (playlistDetails) {
                let podcastCount = await podcastRepositories.count({ id: podcastID, is_active: 1, type: 'podcast' });

                if (podcastCount > 0) {
                    let playlistSong = await playlistRepository.playlistSongsCount({ file_id: podcastID, playlist_id: playlistID, type: 'podcast' });

                    if (playlistSong > 0) {
                        await playlistRepository.removeFile({ playlist_id: playlistID, file_id: podcastID, type: 'podcast' });
                
                        return res.send({
                            status: 200,
                            msg: `Removed from ${playlistDetails.name}`,
                            data: {},
                            purpose: purpose
                        })
                    } else {
                        let createData = {
                            file_id: podcastID,
                            playlist_id: playlistID,
                            type: 'podcast'
                        }
                        await playlistRepository.playlistSongsAdd(createData);

                        return res.send({
                            status: 200,
                            msg: `Added to ${playlistDetails.name}`,
                            data: {},
                            purpose: purpose
                        })
                    }
                } else {
                    return res.send({
                        status: 404,
                        msg: responseMessages.podcastNotFound,
                        data: {},
                        purpose: purpose
                    })
                }
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.playlistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (err) {
            console.log("Add Podcast To Playlist Error : ", err);
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
| API name          :  playlistList
| Response          :  Respective response message in JSON format
| Logic             :  List Of Playlists
| Request URL       :  BASE_URL/api/playlist-list?page=<< Page No >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.playlistList = (req, res) => {
    (async() => {
        let purpose = "Playlist List";
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            where.user_id = userID;

            let playlist = await playlistRepository.playlistList(where, data);
            let totalPages = Math.ceil(playlist.count.length / 20);
            let dataResp = {
                playlist_list: playlist.rows,
                total_count: playlist.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.playlistList,
                data: dataResp,
                purpose: purpose
            })
        } catch (err) {
            console.log("Playlist List Error : ", err);
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
| API name          :  playlistSongs
| Response          :  Respective response message in JSON format
| Logic             :  List Of Playlist Songs
| Request URL       :  BASE_URL/api/playlist-songs?page=<< Page No >>&playlist_id=<< Playlist ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.playlistSongs = (req, res) => {
    (async() => {
        let purpose = "Playlist Songs";
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let playlistID = queryParam.playlist_id;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            data.user_id = userID;

            let playlistCount = await playlistRepository.count({ id: playlistID, user_id: userID });

            if (playlistCount > 0) {
                where.playlist_id = playlistID;
                let playlistSongs = await playlistRepository.playlistSongs(where, data);
                let totalPages = Math.ceil(playlistSongs.count.length / 20);

                let newArray = [];
                playlistSongs.rows.forEach(x => {
                    let mergedData = {};
                    let newObj = {
                        playlist_id: x.playlist_id,
                        file_id: x.file_id,
                        type: x.type,
                    }

                    if(x.song_details) {
                        x.song_details.songID = x.song_details.id;
                        delete x.song_details.id;
                        mergedData = Object.assign({}, newObj, x.song_details);
                    }
                    else if(x.podcast_details) {
                        x.podcast_details.podcastID = x.podcast_details.id;
                        delete x.podcast_details.id;
                        mergedData = Object.assign({}, newObj, x.podcast_details);
                    }
                   
                    newArray.push(mergedData);
                })

                newArray.forEach((item, index) => {
                    if (item.genre_details == '') {
                        item.genre_details = {};
                    }
                    if (item.album_details == '') {
                        item.album_details = {};
                    }
                    if(item.podcast_category_details == '') {
                        item.podcast_category_details = {};
                    }
                });

                let dataResp = {
                    playlist_songs: newArray,
                    total_count: playlistSongs.count.length,
                    total_page: totalPages
                }

                return res.send({
                    status: 200,
                    msg: responseMessages.playlistSongs,
                    data: dataResp,
                    purpose: purpose
                })
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.playlistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (err) {
            console.log("Playlist Songs Error : ", err);
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
| API name          :  allFavouriteSongs
| Response          :  Respective response message in JSON format
| Logic             :  See All Favourite songs
| Request URL       :  BASE_URL/api/favourite-songs
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allFavouriteSongs = (req, res) => {
    (async() => {
        let purpose = "All Favourite Songs";
        try {
            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            let userID = req.headers.userID;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            data.user_id = userID;

            let allfavsongs = await songRepository.favouriteSongs(where, data);
            allfavsongs.rows.forEach(element => {
                element.playListId = element.id // add a new key `playListId` in the response
                if (element.genre_details == '') {
                    element.genre_details = {};
                }
                if (element.album_details == '') {
                    element.album_details = {};
                }
            });

            // Implementing Circular Queue
            if (allfavsongs.count.length < data.limit && playlistId > 0 && (numberOfItems > allfavsongs.count.length)) {
                data.limit = data.limit - parseInt(allfavsongs.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newAllFavSongs = await songRepository.favouriteSongs(where, data);
                newAllFavSongs.rows.forEach((item, index) => {
                    item.playListId = item.id
                    if (item.genre_details == '') {
                        item.genre_details = {};
                    }
                    if (item.album_details == '') {
                        item.album_details = {};
                    }
                });

                allfavsongs.count.length = allfavsongs.count.length + newAllFavSongs.count.length
                allfavsongs.rows = allfavsongs.rows.concat(newAllFavSongs.rows);
            }

            let totalPages = Math.ceil(allfavsongs.count.length / data.limit);
            let dataResp = {
                allfavsongs: allfavsongs.rows,
                total_count: allfavsongs.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.allfavsongs,
                data: dataResp,
                purpose: purpose
            })
        } catch (e) {
            console.log("All Favourite Songs Error : ", e);
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
| API name          :  allDownloadSongs
| Response          :  Respective response message in JSON format
| Logic             :  See All Downloaded songs
| Request URL       :  BASE_URL/api/downloaded-songs
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.allDownloadSongs = (req, res) => {
        (async() => {
            let purpose = "All Download Songs";
            try {
                let queryParam = req.query;
                let where = {};
                let data = {};
                let page = queryParam.page > 0 ? parseInt(queryParam.page) : 1;
                data.limit = 20;
                let userID = req.headers.userID;
                let numberOfItems = queryParam.number_of_items;
                if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
                let playlistId = queryParam.playlist_id;
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $lte: playlistId };
                where.is_active = 1;
                data.user_id = userID;

                let alldownloadedsongs = await songRepository.downloadSongs(where, data);
                alldownloadedsongs.rows.forEach(element => {
                    element.playListId = element.id // add a new key `playListId` in the response
                    if (element.genre_details == '') {
                        element.genre_details = {};
                    }
                    if (element.album_details == '') {
                        element.album_details = {};
                    }
                });

                // Implementing Circular Queue
                if (alldownloadedsongs.count.length < data.limit && playlistId > 0 && (numberOfItems > alldownloadedsongs.count.length)) {
                    data.limit = data.limit - parseInt(alldownloadedsongs.count.length);
                    data.offset = data.limit ? data.limit * (page - 1) : null;
                    if (playlistId > 0) where.id = { $gt: playlistId };

                    let newAllDownloadedSongs = await songRepository.downloadSongs(where, data);
                    newAllDownloadedSongs.rows.forEach((item, index) => {
                        item.playListId = item.id
                        if (item.genre_details == '') {
                            item.genre_details = {};
                        }
                        if (item.album_details == '') {
                            item.album_details = {};
                        }
                    });

                    alldownloadedsongs.count.length = alldownloadedsongs.count.length + newAllDownloadedSongs.count.length
                    alldownloadedsongs.rows = alldownloadedsongs.rows.concat(newAllDownloadedSongs.rows);
                }

                let totalPages = Math.ceil(alldownloadedsongs.count.length / data.limit);
                let dataResp = {
                    alldownloadedsongs: alldownloadedsongs.rows,
                    total_count: alldownloadedsongs.count.length,
                    total_page: totalPages
                }

                return res.send({
                    status: 200,
                    msg: responseMessages.alldownloadedsongs,
                    data: dataResp,
                    purpose: purpose
                })
            } catch (e) {
                console.log("All Download Songs Error : ", e);
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
    | API name          :  search landing page
    | Response          :  Respective response message in JSON format
    | Logic             :  Search landing page
    | Request URL       :  BASE_URL/api/search-landing-page
    | Request method    :  GET
    | Author            :  Abhisek Paul
    |------------------------------------------------
    */
module.exports.searchLandingPage = (req, res) => {
    (async() => {
        let purpose = "Search Landing Page";
        try {

            let genres = await genresRepositories.findAll({});

            genres.forEach(element => {
                element.type = 'genre';
                delete element.createdAt;
                delete element.updatedAt;
            });

            let staticData1 = {
                id: -1,
                name: "Podcast",
                type: "static_data",
                cover_picture: ''
            }
            let staticData2 = {
                id: -2,
                name: "Weekly top 10",
                type: "static_data",
                cover_picture: ''
            }
            let staticData3 = {
                id: -3,
                name: "Recently Played",
                type: "static_data",
                cover_picture: ''
            }
            genres.unshift(staticData3);
            genres.unshift(staticData2);
            genres.unshift(staticData1);

            return res.send({
                status: 200,
                msg: responseMessages.searchData,
                data: genres,
                purpose: purpose
            })
        } catch (err) {
            console.log("Search Landing Page Error : ", err);
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
| API name          :  search
| Response          :  Respective response message in JSON format
| Logic             :  Search Songs
| Request URL       :  BASE_URL/api/search-songs
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.search = (req, res) => {
    (async() => {
        let purpose = "Search Songs";
        try {
            let searchString = req.query.search_text;
            let userID = req.headers.userID;

            let data = {
                limit: 5,
                user_id: userID
            };

            let where = { name: { $like: `%${searchString}%` } };
            let whereArtist = { full_name: { $like: `%${searchString}%` } };

            let searchSongsList = await songRepository.searchSongs(where, data);

            searchSongsList.forEach(element => {
                element.search_type = 'song';
                if(element.artist_details == '') element.artist_details = {};
                if(element.genre_details == '') element.genre_details = {};
                if(element.album_details == '') element.album_details = {};
            });
            let searchPodcastsList = await podcastRepositories.userPodcastSearchList(where, data);

            searchPodcastsList.forEach(element => {
                element.search_type = 'podcast';
                if(element.artist_details == '') element.artist_details = {};
                if(element.podcast_category_details == '') element.podcast_category_details = {};
            });
            let searchArtistsList = await artistRepositories.artistListSearch(whereArtist, data);

            searchArtistsList.forEach(element => {
                element.search_type = 'artist';
            });
            let searchAlbumsList = await albumRepository.findAll(where, data);

            searchAlbumsList.forEach(element => {
                element.search_type = 'album';
            });

            let genres = await genresRepositories.findAll({});

            genres.forEach(element => {
                element.type = 'genre';
                delete element.createdAt;
                delete element.updatedAt;
            });

            let staticData1 = {
                id: -1,
                name: "Podcast",
                type: "static_data"
            }
            let staticData2 = {
                id: -2,
                name: "Weekly top 10",
                type: "static_data"
            }
            let staticData3 = {
                id: -3,
                name: "Recently Played",
                type: "static_data"
            }
            genres.unshift(staticData3);
            genres.unshift(staticData2);
            genres.unshift(staticData1);

            let allSearchData = [...searchSongsList, ...searchPodcastsList, ...searchArtistsList, ...searchAlbumsList];



            // let dataResp = {
            //     songs: searchSongsList,
            //     podcasts: searchPodcastsList,
            //     artist: searchArtistsList,
            //     albums: searchAlbumsList
            // }

            return res.send({
                status: 200,
                msg: responseMessages.searchData,
                data: allSearchData,
                meta: genres,
                purpose: purpose
            })
        } catch (err) {
            console.log("Search Songs Error : ", err);
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
| API name          :  genreWiseSongs
| Response          :  Respective response message in JSON format
| Logic             :  Genre Wise Songs
| Request URL       :  BASE_URL/api/genre-songs
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.genreWiseSongs = (req, res) => {
    (async() => {
        let purpose = "Genre Wise Track List"
        try {
            let queryParam = req.query;
            let userID = req.headers.userID;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            let genreID = queryParam.genre_id;
            let numberOfItems = queryParam.number_of_items;
            if (numberOfItems > 0) data.limit = parseInt(numberOfItems);
            let playlistId = queryParam.playlist_id;
            if (playlistId > 0) where.id = { $lte: playlistId };
            where.is_active = 1;
            where.genre_id = genreID;
            data.user_id = userID;

            let genreSongs = await songRepository.findAndCountAll(where, data);

            // Implementing Circular Queue
            if (genreSongs.count.length < data.limit && playlistId > 0 && (numberOfItems > genreSongs.count.length)) {
                data.limit = data.limit - parseInt(genreSongs.count.length);
                data.offset = data.limit ? data.limit * (page - 1) : null;
                if (playlistId > 0) where.id = { $gt: playlistId };

                let newAlbumSongs = await songRepository.findAndCountAll(where, data);

                genreSongs.count.length = genreSongs.count.length + newAlbumSongs.count.length
                genreSongs.rows = genreSongs.rows.concat(newAlbumSongs.rows);
            }

            genreSongs.rows.forEach((item, index) => {
                item.playListId = item.id
                if (item.genre_details == '') {
                    item.genre_details = {};
                }
                if (item.album_details == '') {
                    item.album_details = {};
                }
            });

            let totalPages = Math.ceil(genreSongs.count.length / 20);
            let dataResp = {
                genre_songs: genreSongs.rows,
                total_count: genreSongs.count.length,
                total_page: totalPages
            }

            return res.send({
                status: 200,
                msg: responseMessages.genreSongs,
                data: dataResp,
                purpose: purpose
            })
        } catch (err) {
            console.log("Genre Wise Track List Err : ", err);
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
| API name          :  playlistSongSearch
| Response          :  Respective response message in JSON format
| Logic             :  Playlist Files Search
| Request URL       :  BASE_URL/api/search-playlist-files
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.playlistSongSearch = (req, res) => {
    (async() => {
        let purpose = "Playlist Files Search";
        try {
            let playlistID = req.query.playlist_id;
            let searchString = req.query.search_text;
            let userID = req.headers.userID;
            let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
            let limit = 5;

            let playlistCount = await playlistRepository.count({ id: playlistID, user_id: userID });

            if(playlistCount > 0) {
                let data = {
                    limit: limit,
                    offset: limit ? limit * (page - 1) : null,
                    user_id: userID
                };
    
                let where = { name: { $like: `%${searchString}%` } };
                let searchSongsList = await songRepository.searchPlaylistSongs(where, data);
    
                searchSongsList.forEach(element => {
                    element.search_type = 'song';
                    if(element.artist_details == '') element.artist_details = {};
                    if(element.genre_details == '') element.genre_details = {};
                    if(element.album_details == '') element.album_details = {};
                });
    
                let searchPodcastsList = await podcastRepositories.userPodcastSearchListPlaylist(where, data);
    
                searchPodcastsList.forEach(element => {
                    element.search_type = 'podcast';
                    if(element.artist_details == '') element.artist_details = {};
                    if(element.podcast_category_details == '') element.podcast_category_details = {};
                });
    
                let allSearchData = [...searchSongsList, ...searchPodcastsList];
    
                allSearchData.forEach(x => {
                    let ind = x.playlist_data.findIndex(e => e.playlist_id == playlistID);
                    if(ind >= 0) x.addedInPlaylist = 1;
                    else x.addedInPlaylist = 0;
                    // delete x.playlist_data;
                });
    
                allSearchData.sort(function (a, b) {
                    return b.addedInPlaylist - a.addedInPlaylist;
                });
                
                return res.send({
                    status: 200,
                    msg: responseMessages.searchData,
                    data: allSearchData,
                    purpose: purpose
                })
            }
            else {
                return res.send({
                    status: 404,
                    msg: responseMessages.playlistNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Playlist Files Search Err : ", err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
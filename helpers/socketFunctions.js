const jwt = require('jsonwebtoken');
const userRepositories = require('../repositories/UsersRepositories');
const userPlayedHistoryRepositories = require('../repositories/UserPlayedHistoriesRepositories');
const songRepositories = require('../repositories/SongsRepository');
const responseMessages = require('../ResponseMessages');
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;

module.exports.socketResponse = (socket) => {

    // Connection Tester
    socket.on('test-socket', (data) => {
        console.log("Socket Configured Successfully...");
    });

    // Save Song Details
    socket.on('user-played', async(data, callback) => {
        let songID = data.songID;
        let accessToken = data.accessToken.split(' ')[1];
        console.log("TOKEN : ", accessToken);
        try {
            jwt.verify(accessToken, jwtOptionsAccess.secret, async(err, decodedToken) => {
                console.log("ERROR : ", err);
                if (err) {
                    callback({
                        status: 0,
                        msg: responseMessages.authFailure,
                    })
                } else {
                    let userCount = await userRepositories.count({ where: { id: decodedToken.user_id } });

                    if (userCount > 0) {
                        let userID = decodedToken.user_id;
                        let songCount = await songRepositories.count({ id: songID, is_active: 1 });

                        if (songCount > 0) {

                            let recentlyPlayedCount = await userPlayedHistoryRepositories.count({ user_id: userID, file_id: songID });

                            if (recentlyPlayedCount > 0) {

                                console.log('recentlyPlayedCount *************************', recentlyPlayedCount)

                                await userPlayedHistoryRepositories.update({ user_id: userID, file_id: songID }, { updatedAt: Date.now() });

                                callback({
                                    status: 1,
                                    msg: `User Played History Updated`,
                                })

                            } else {

                                await userPlayedHistoryRepositories.create({ user_id: userID, file_id: songID, type: 'song' });

                                callback({
                                    status: 1,
                                    msg: `User Played History Added`,
                                })
                            }

                        } else {
                            callback({
                                status: 0,
                                msg: `Invalid Song ID Provided`,
                            })
                        }
                    } else {
                        callback({
                            status: 0,
                            msg: responseMessages.authFailure,
                        })
                    }
                }
            })
        } catch (err) {
            callback({
                status: 0,
                msg: responseMessages.serverError,
            })
        }
    });

    // Update Song Played Count
    socket.on('song-played', async(data, callback) => {
        let songID = data.songID;
        let accessToken = data.accessToken.split(' ')[1];
        try {
            jwt.verify(accessToken, jwtOptionsAccess.secret, async(err, decodedToken) => {
                if (err) {
                    callback({
                        status: 0,
                        msg: responseMessages.authFailure,
                    })
                } else {
                    let userCount = await userRepositories.count({ where: { id: decodedToken.user_id } });

                    if (userCount > 0) {
                        let songDet = await songRepositories.findOne({ id: songID, is_active: 1 });

                        if (songDet) {
                            let updateData = {};
                            if (songDet.playedCount) updateData.playedCount = songDet.playedCount + 1;
                            else updateData.playedCount = 1;

                            await songRepositories.update({ id: songID }, updateData)

                            callback({
                                status: 1,
                                msg: `Song Played Count Updated`,
                            })
                        } else {
                            callback({
                                status: 0,
                                msg: `Invalid Song ID Provided`,
                            })
                        }
                    } else {
                        callback({
                            status: 0,
                            msg: responseMessages.authFailure,
                        })
                    }
                }
            })
        } catch (err) {
            console.log("ERR : ", err);
            callback({
                status: 0,
                msg: responseMessages.serverError,
            })
        }
    });
}
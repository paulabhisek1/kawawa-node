const jwt = require('jsonwebtoken');
const userRepositories = require('../repositories/UsersRepositories');
const userPlayedHistoryRepositories = require('../repositories/UserPlayedHistoriesRepositories');
const songRepositories = require('../repositories/SongsRepository');
const artistRepositories = require('../repositories/ArtistsRepositories');
const artistPaymentRepositories = require('../repositories/ArtistPaymentRepositories');
const countryRepositories = require('../repositories/CountriesRepository');
const responseMessages = require('../ResponseMessages');
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const sequelize = require('../config/dbConfig').sequelize;

module.exports.socketResponse = (socket) => {

    // Connection Tester
    socket.on('test-socket', (data) => {
        console.log("Socket Configured Successfully...");
    });

    // Save Song Details
    socket.on('user-played', async(data, callback) => {
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
                        let userID = decodedToken.user_id;
                        let songCount = await songRepositories.count({ id: songID, is_active: 1 });

                        if (songCount > 0) {
                            checkArtistPayment(songID);
                            let songDet = await songRepositories.findOne({ id: songID, is_active: 1 });
                            let updateData = {};
                            if (songDet.playedCount) updateData.playedCount = songDet.playedCount + 1;
                            else updateData.playedCount = 1;

                            await songRepositories.update({ id: songID }, updateData)

                            let recentlyPlayedCount = await userPlayedHistoryRepositories.count({ user_id: userID, file_id: songID });

                            if (recentlyPlayedCount > 0) {

                                await userPlayedHistoryRepositories.updateNew({ user_id: userID, file_id: songID }, { type: 'song', updatedAt: Date.now() });

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
}

async function checkArtistPayment(songID) {
    let songDetails = await songRepositories.findOne({ id: songID });
    if(songDetails.is_paid == 1) {
        let artistDetails = await artistRepositories.findOne({ id: songDetails.artist_id });
        let countryID = artistDetails.country_id;

        await sequelize.transaction(async (t)=>{
            let paymentDetails = await artistPaymentRepositories.findOne({ artist_id: artistDetails.id });
            if(paymentDetails) {
                let updateData = {
                    current_balance: Number(paymentDetails.current_balance + songDetails.price)
                }
                await artistPaymentRepositories.update({ id: paymentDetails.id }, updateData, t)
            }
            else {
                let createData = {
                    artist_id: artistDetails.id,
                    country_id: countryID,
                    current_balance: songDetails.price,
                    already_paid: 0,
                    last_payment_date: null
                }
                await artistPaymentRepositories.create(createData)
            }
        })
    }
}
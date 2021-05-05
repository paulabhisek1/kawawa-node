/*!
 * ArtistController.js
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
const artistRepositories = require('../../repositories/ArtistsRepositories');
const genresRepositories = require('../../repositories/GenresRepositories');
const albumRepositories = require('../../repositories/AlbumRepositories');
const songsRepositories = require('../../repositories/SongsRepository');
const podcastRepositories = require('../../repositories/PodcastRepositories');

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
const fs = require('fs');
const path = require('path');
const { getAudioDurationInSeconds } = require('get-audio-duration');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  registerArtist
| Response          :  Respective response message in JSON format
| Logic             :  Register User
| Request URL       :  BASE_URL/artist/register
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.registerArtist = (req, res) => {
    (async() => {
        let purpose = "Register Artist"
        try {
            let body = req.body;
            let userCount = await artistRepositories.count({ where: { email: body.email } });

            let currentDate = moment();
            let userDate = moment(body.dob);

            let dateDiff = userDate.diff(currentDate, 'days');

            if (dateDiff >= 0) {
                return res.status(422).json({
                    status: 422,
                    msg: "Date of Birth can't be in futute or current date ",
                    data: {},
                    purpose: "Validation Error"
                })
            }

            if (userCount == 0) {
                let userData;
                await sequelize.transaction(async(t) => {
                    let createUserData = {
                        full_name: body.full_name,
                        email: body.email,
                        mobile_no: body.mobile_no,
                        password: md5(body.password),
                        dob: body.dob,
                        profile_image: `/uploads/profile_images/default_image.png`,
                        country_id: body.country_id,
                        login_type: 'system',
                    }

                    userData = await artistRepositories.create(createUserData, t);
                })

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;

                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                userData['access_token'] = accessToken;
                userData['refresh_token'] = refreshToken;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.registrationSuccess,
                    data: userData,
                    purpose: purpose
                })
            } else {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("REGISTER USER ERROR : ", e);
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
| API name          :  artistLogin
| Response          :  Respective response message in JSON format
| Logic             :  User Login
| Request URL       :  BASE_URL/artist/login
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.artistLogin = (req, res) => {
    (async() => {
        let purpose = "Artist Login";
        try {
            let body = req.body;
            let whereData = {
                email: body.email,
                password: md5(body.password),
            }
            let userData = await artistRepositories.findOne(whereData);

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
            console.log("Artist Login ERROR : ", e);
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
| API name          :  socialLogin
| Response          :  Respective response message in JSON format
| Logic             :  Social Login
| Request URL       :  BASE_URL/artist/social-login
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.socialLogin = (req, res) => {
    (async() => {
        let purpose = "Social Login";
        try {
            let body = req.body;
            let userDetails = await artistRepositories.findOne({ email: body.email });
            if (userDetails) {
                if (userDetails.login_type == body.login_type) {
                    delete userDetails.password;
                    delete userDetails.login_type;
                    delete userDetails.otp;
                    delete userDetails.otp_expire_time;
                    delete userDetails.otp_status;
                    delete userDetails.is_active;

                    let accessToken = jwt.sign({ user_id: userDetails.id, email: userDetails.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                    let refreshToken = jwt.sign({ user_id: userDetails.id, email: userDetails.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                    userDetails['access_token'] = accessToken;
                    userDetails['refresh_token'] = refreshToken;

                    return res.status(200).send({
                        status: 200,
                        msg: responseMessages.loginSuccess,
                        data: userDetails,
                        purpose: purpose
                    })
                } else {
                    return res.send({
                        status: 409,
                        msg: responseMessages.duplicateEmail,
                        data: {},
                        purpose: purpose
                    })
                }
            } else {
                let createUserData = {
                    full_name: body.full_name,
                    email: body.email,
                    mobile_no: body.mobile_no ? body.mobile_no : null,
                    password: md5(body.password),
                    dob: body.dob ? body.dob : null,
                    profile_image: body.profile_image ? body.profile_image : `/uploads/profile_images/default_image.png`,
                    login_type: body.login_type,
                }

                let userData = await artistRepositories.create(createUserData);

                delete userData.password;
                delete userData.login_type;
                delete userData.otp;
                delete userData.otp_expire_time;
                delete userData.otp_status;
                delete userData.is_active;

                let accessToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userData.id, email: userData.email }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                userData['access_token'] = accessToken;
                userData['refresh_token'] = refreshToken;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: userData,
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Social Login ERROR : ", e);
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
| API name          :  forgotPassword
| Response          :  Respective response message in JSON format
| Logic             :  Forgot Password
| Request URL       :  BASE_URL/artist/forgot-password
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.forgotPassword = (req, res) => {
    (async() => {
        let purpose = "Forgot Password"
        try {
            let body = req.body;
            let userDetails = await artistRepositories.findOne({ email: body.email });

            if (!userDetails) {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.invalidUser,
                    data: {},
                    purpose: purpose
                })
            }

            const otpValue = Math.floor(1000 + Math.random() * 9000);
            let updateData = await artistRepositories.update({ id: userDetails.id }, { otp: otpValue });

            if (updateData[0] == 1) {
                let mailData = {
                    toEmail: userDetails.email,
                    subject: 'We sent you an OTP to reset your password',
                    html: `<body style="background: #f2f2f2;">
                    <div style="width:100%; max-width:600px; margin:0 auto; padding:40px 15px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:8px 0;text-align: center; background:#7f7e7e;">
                      <tr>
                        <th scope="col"><img src="logo.png" alt="" width="150" /></th>
                      </tr>
                    </table>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:60px 40px;text-align: left; background:#fff;">
                      <tr>
                        <th scope="col">
                        <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">Hi ${userDetails.full_name},</p>
                        <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Please use the following code to authorize your device: <strong style="font-size:20px; color:#ff301e;"> ${otpValue}</strong></p>
                        <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">If you don't recognize this activity, please reset your password immediately. You can also reach us by responding to this email.</p>
                        <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Thanks for your time,</p>
                        <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">The Kawawa Sound Team </p>    
                        
                        </th>
                      </tr>
                    </table>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:20px 0;text-align: center; background:#f2f2f2;">
                      <tr>
                        <th scope="col">
                        <p style="font-size:15px; font-weight:500; color:rgb(82, 82, 82)"><a href="#" style="color:rgb(82, 82, 82); margin:0 2px;">Terms & Condition</a> I <a href="#" style="color:rgb(82, 82, 82); margin:0 2px;">Privacy Policy</a> I <a href="#" style="color:rgb(82, 82, 82); margin:0 2px;">Rate App</a></p>
                        <p style="font-size:15px; font-weight:500; color:rgb(82, 82, 82); margin-top: 8px;">655 Montgomery Street, Suite 490, Dpt 17022, San Francisco, CA 94111</p>
                        <p style="font-size:15px; font-weight:500; color:rgb(82, 82, 82); margin-top: 8px;">© 2021 Kawawa Sound Inc.</p>
                        </th>
                      </tr>
                    </table>
                    </div>
                    </body>`
                }
                await commonFunction.sendMail(mailData);

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.otpSendMessgae,
                    data: {},
                    purpose: purpose
                })
            }
            console.log("UPDATE : ", updateData);
        } catch (e) {
            console.log("Forgot Password ERROR : ", e);
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
| API name          :  verifyOTP
| Response          :  Respective response message in JSON format
| Logic             :  Verify OTP
| Request URL       :  BASE_URL/artist/verify-otp
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.verifyOTP = (req, res) => {
    (async() => {
        let purpose = "Verify OTP";
        try {
            let body = req.body;
            let whereData = {
                otp: body.otp,
                email: body.email
            }
            let checkOTP = await artistRepositories.findOne(whereData)

            if (checkOTP) {
                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.validOTP,
                    data: {},
                    purpose: purpose
                })
            } else {
                return res.status(403).send({
                    status: 403,
                    msg: responseMessages.invalidOTP,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Verify OTP ERROR : ", e);
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
| API name          :  resetPassword
| Response          :  Respective response message in JSON format
| Logic             :  Reset Password
| Request URL       :  BASE_URL/artist/reset-password
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.resetPassword = (req, res) => {
    (async() => {
        let purpose = "Reset Password";
        try {
            let body = req.body;
            let userDetails = await artistRepositories.findOne({ otp: body.otp });

            if (userDetails) {
                let updateData = await artistRepositories.update({ id: userDetails.id }, { password: md5(body.password), otp: null });

                if (updateData[0] == 1) {
                    return res.status(200).send({
                        status: 200,
                        msg: responseMessages.resetPass,
                        data: {},
                        purpose: purpose
                    })
                } else {
                    return res.status(500).send({
                        status: 500,
                        msg: responseMessages.serverError,
                        data: {},
                        purpose: purpose
                    })
                }
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.invalidOTP,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Reset Password ERROR : ", e);
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
| API name          :  uploadArtistProfilePicture
| Response          :  Respective response message in JSON format
| Logic             :  Upload Artist Profile Picture
| Request URL       :  BASE_URL/artist/artist-details/upload-profile-picture
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadArtistProfilePicture = (req, res) => {
    (async() => {
        let purpose = "Upload Artist Profile Picture";
        try {
            let filePath = `${global.constants.profile_photo_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.artistProfilePictureUpdate,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Artist Profile Picture ERROR : ", err);
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
| API name          :  uploadArtistGovtIDFront
| Response          :  Respective response message in JSON format
| Logic             :  Upload Artist Govt ID Front
| Request URL       :  BASE_URL/artist/artist-details/upload-govt-id-front
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadArtistGovtIDFront = (req, res) => {
    (async() => {
        let purpose = "Upload Artist Govt ID FRONT";
        try {
            let filePath = `${global.constants.govt_id_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.artistGovtIDUpdate,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Artist Govt ID FRONT ERROR : ", err);
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
| API name          :  uploadArtistGovtIDBack
| Response          :  Respective response message in JSON format
| Logic             :  Upload Artist Govt ID Back
| Request URL       :  BASE_URL/artist/artist-details/upload-govt-id-back
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadArtistGovtIDBack = (req, res) => {
    (async() => {
        let purpose = "Upload Artist Govt ID BACK";
        try {
            let filePath = `${global.constants.govt_id_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.artistGovtIDUpdate,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Artist Govt ID BACK ERROR : ", err);
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
| API name          :  uploadSampleSong
| Response          :  Respective response message in JSON format
| Logic             :  Upload Sample Song
| Request URL       :  BASE_URL/artist/artist-details/upload-sample-song
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadSampleSong = (req, res) => {
    (async() => {
        let purpose = "Upload Sample Song";
        try {
            let filePath = `${global.constants.sample_songs_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.sampleSong,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Sample Song : ", err);
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
| API name          :  saveArtistDetailsStepOne
| Response          :  Respective response message in JSON format
| Logic             :  Save Artist Details Step One
| Request URL       :  BASE_URL/artist/artist-details/step-one
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.saveArtistDetailsStepOne = (req, res) => {
    (async() => {
        let purpose = "Save Artist Details Step One";
        try {
            let artistID = req.headers.userID;
            let artistCount = await artistRepositories.count({ id: artistID, is_active: 1 });

            if (artistCount > 0) {
                let body = req.body;
                await sequelize.transaction(async(t) => {
                    // await artistRepositories.deleteArtistDetails({ artist_id: artistID }, t);
                    let artistDetailsCount = await artistRepositories.countArtistDetails({ artist_id: artistID }, t);

                    let createData = {
                        artist_id: artistID,
                        street: body.street,
                        building_no: body.building_no,
                        city: body.city,
                        state: body.state,
                        zip: body.zip
                    }

                    if (artistDetailsCount > 0) {
                        await artistRepositories.updateArtistDetails({ artist_id: artistID }, createData, t);
                    } else {
                        await artistRepositories.createArtistDetails(createData, t);
                    }
                });

                let artistDetails = await artistRepositories.artistDetails({ id: artistID }, { user_id: artistID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.artistDetailsStepOne,
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
        } catch (err) {
            console.log("Save Artist Details Step One ERROR : ", err);
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
| API name          :  saveArtistDeatislStepTwo
| Response          :  Respective response message in JSON format
| Logic             :  Save Artist Details Step Two
| Request URL       :  BASE_URL/artist/artist-details/step-two
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.saveArtistDeatislStepTwo = (req, res) => {
    (async() => {
        let purpose = "Save Artist Details Step Two"
        try {
            let artistID = req.headers.userID;
            let artistCount = await artistRepositories.count({ id: artistID, is_active: 1 });

            if (artistCount > 0) {
                let body = req.body;
                let updateData = {
                    account_holder_name: body.account_holder_name,
                    account_number: body.account_number,
                    routing_no: body.routing_no,
                    branch_address: body.branch_address,
                    branch_name: body.branch_name,
                    bank_country: body.bank_country,
                    bank_state: body.bank_state,
                    bank_city: body.bank_city,
                    bank_zip: body.bank_zip,
                    currency: body.currency,
                    swift_code: body.swift_code
                }

                await artistRepositories.updateArtistDetails({ artist_id: artistID }, updateData);

                let artistDetails = await artistRepositories.artistDetails({ id: artistID }, { user_id: artistID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.artistDetailsStepOne,
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
        } catch (err) {
            console.log("Save Artist Details Step Two ERROR : ", err);
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
| API name          :  saveArtistDeatislStepThree
| Response          :  Respective response message in JSON format
| Logic             :  Save Artist Details Step Three
| Request URL       :  BASE_URL/artist/artist-details/step-three
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.saveArtistDeatislStepThree = (req, res) => {
    (async() => {
        let purpose = 'Save Artist Details Step Three';
        try {
            let artistID = req.headers.userID;
            let artistCount = await artistRepositories.count({ id: artistID, is_active: 1 });

            if (artistCount > 0) {
                let body = req.body;
                let updateData = {
                    govt_id_front: body.govt_id_front,
                    govt_id_back: body.govt_id_back,
                }

                // let mainUpdateData = {
                //     profile_image: body.profile_image
                // }

                await sequelize.transaction(async(t) => {
                    await artistRepositories.updateArtistDetails({ artist_id: artistID }, updateData, t);
                    // await artistRepositories.update({ id: artistID }, mainUpdateData, t);
                })

                let artistDetails = await artistRepositories.artistDetails({ id: artistID }, { user_id: artistID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.artistDetailsStepOne,
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
        } catch (err) {
            console.log("Save Artist Details Step Three ERROR : ", err);
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
| API name          :  saveArtistDeatislStepFour
| Response          :  Respective response message in JSON format
| Logic             :  Save Artist Details Step Four
| Request URL       :  BASE_URL/artist/artist-details/step-four
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.saveArtistDeatislStepFour = (req, res) => {
    (async() => {
        let purpose = 'Save Artist Details Step Four';
        try {
            let artistID = req.headers.userID;
            let artistCount = await artistRepositories.count({ id: artistID, is_active: 1 });

            if (artistCount > 0) {
                let body = req.body;
                let updateData = {
                    sample_song_name: body.sample_song_name,
                    sample_song_path: body.sample_song_path,
                    sample_song_type: body.sample_song_type,
                    sample_song_album: body.sample_song_album ? body.sample_song_album : null,
                    sample_song_description: body.sample_song_description,
                }

                await sequelize.transaction(async(t) => {
                    await artistRepositories.updateArtistDetails({ artist_id: artistID }, updateData, t);
                    await artistRepositories.update({ id: artistID }, { is_active: 3 });
                })

                let artistDetails = await artistRepositories.artistDetails({ id: artistID }, { user_id: artistID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.artistDetailsStepOne,
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
        } catch (err) {
            console.log("Save Artist Details Step Three ERROR : ", err);
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
| API name          :  fetchArtistDetails
| Response          :  Respective response message in JSON format
| Logic             :  Save Artist Details Step Three
| Request URL       :  BASE_URL/artist/artist-details
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.fetchArtistDetails = (req, res) => {
    (async() => {
        let purpose = "Fetch Artist Details";
        try {
            let artistID = req.headers.userID;
            let artistCount = await artistRepositories.count({ id: artistID, is_active: 1 });
            if (artistCount > 0) {
                let artistDetails = await artistRepositories.artistDetails({ id: artistID }, { user_id: artistID });

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
        } catch (err) {
            console.log("Fetch Artist Details ERROR : ", err);
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
| API name          :  fetchCommonDetails
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Common Details
| Request URL       :  BASE_URL/artist/common-details
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.fetchCommonDetails = (req, res) => {
    (async() => {
        let purpose = "Fetch Common Details";
        try {
            let artistID = req.headers.userID;
            let genres = await genresRepositories.findAll({});
            let albums = await albumRepositories.findAll({ artist_id: artistID }, { limit: null })
            let podcastCategories = await podcastRepositories.findAllPodcastCategory({});

            return res.status(200).send({
                status: 200,
                msg: responseMessages.commonDetails,
                data: {
                    genres: genres,
                    albums: albums,
                    podcastCategories: podcastCategories
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Fetch Common Details ERROR : ", err);
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
| API name          :  createAlbum
| Response          :  Respective response message in JSON format
| Logic             :  Create Album
| Request URL       :  BASE_URL/artist/create-album
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.createAlbum = (req, res) => {
    (async()=>{
        let purpose = "Create Album"
        try {
            let artistID = req.headers.userID;
            let body = req.body;
            let filePath = `${global.constants.album_cover_url}/${req.file.filename}`;

            let createData = {
                name: body.name,
                cover_picture: filePath,
                artist_id: artistID,
                total_songs: 0,
                is_active: 1,
                type: 'song'
            }

            let albumDetails = await albumRepositories.createAlbum(createData);

            return res.status(200).json({
                status: 200,
                msg: responseMessages.albumCreate,
                data: albumDetails,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Create Album ERROR : ", err);
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
| API name          :  updateAlbum
| Response          :  Respective response message in JSON format
| Logic             :  Update Album
| Request URL       :  BASE_URL/artist/update-album/<< Album ID >>
| Request method    :  PUT
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.updateAlbum = (req, res) => {
    (async()=>{
        let purpose = "Update Album";
        try {
            let artistID = req.headers.userID;
            let albumID = req.params.id;
            let body = req.body;

            let albumCount = await albumRepositories.count({ id: albumID, artist_id: artistID });

            if(albumCount > 0) {
                let updateData = {};
                updateData.name = body.name;

                if(req.file) {
                    updateData.cover_picture = `${global.constants.album_cover_url}/${req.file.filename}`;
                }

                await albumRepositories.update({ id: albumID }, updateData);

                return res.status(200).json({
                    status: 200,
                    msg: responseMessages.albumUpdate,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).json({
                    status: 404,
                    msg: responseMessages.albumNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Update Album ERROR : ", err);
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
| API name          :  albumDetails
| Response          :  Respective response message in JSON format
| Logic             :  Album Details
| Request URL       :  BASE_URL/artist/album-details/<< Album ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.albumDetails = (req, res) => {
    (async() => {
        let purpose = "Album Details"
        try {
            let artistID = req.headers.userID;
            let albumID = req.params.id;

            let albumCount = await albumRepositories.count({ id: albumID, artist_id: artistID })

            if(albumCount > 0) {
                let albumDetails = await albumRepositories.artistDetails({ id: albumID });

                return res.status(200).json({
                    status: 200,
                    msg: responseMessages.albumDetails,
                    data: {
                        albumDetails: albumDetails
                    },
                    purpose: purpose
                })
            }
            else {
                return res.status(404).json({
                    status: 404,
                    msg: responseMessages.albumNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Create Album ERROR : ", err);
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
| API name          :  albumDetails
| Response          :  Respective response message in JSON format
| Logic             :  List Of Albums
| Request URL       :  BASE_URL/artist/album-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.alubumsList = (req, res) => {
    (async()=>{
        let purpose = "Albums List";
        try {
            let artistID = req.headers.userID;

            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            data.order = [
                ['id', 'DESC']
            ];
            where.artist_id = artistID;

            if (queryParam.search) {
                where.name = { $like: `%${queryParam.search}%` };
            }

            let albumsList = await albumRepositories.listAlbums(where, data);

            let dataResp = {
                albumsList: albumsList.rows,
                totalCount: albumsList.count.length
            }

            return res.status(200).json({
                status: 200,
                msg: responseMessages.albumList,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Create Album ERROR : ", err);
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
| API name          :  albumDelete
| Response          :  Respective response message in JSON format
| Logic             :  Delete Album
| Request URL       :  BASE_URL/artist/album-delete/<< Album ID >>
| Request method    :  DELETE
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.albumDelete = (req, res) => {
    (async() => {
        let purpose = "Album Delete";
        try {
            let artistID = req.headers.userID;
            let albumID = req.params.id;

            let albumCount = await albumRepositories.count({ id: albumID, artist_id: artistID });

            if(albumCount > 0) {
                await sequelize.transaction(async(t)=>{
                    await albumRepositories.delete({ id: albumID }, t);
                    await songsRepositories.delete({ album_id: albumID }, t);
                })

                return res.status(200).json({
                    status: 200,
                    msg: responseMessages.albumDelete,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).json({
                    status: 404,
                    msg: responseMessages.albumNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Album Delete ERROR : ", err);
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
| API name          :  uploadSong
| Response          :  Respective response message in JSON format
| Logic             :  Upload Song
| Request URL       :  BASE_URL/artist/upload-song
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadSong = (req, res) => {
    (async() => {
        let purpose = "Upload Song";
        try {
            console.log("FILE : ", req.file);
            let filePath = `${global.constants.songs_url}/${req.file.filename}`;
            let streamPath = path.join(global.appPath, filePath);
            let fileDuration = 0;

            getAudioDurationInSeconds(streamPath).then((duration) => {
                fileDuration = duration;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.songUpload,
                    data: {
                        filePath: filePath,
                        fileDuration: parseInt(fileDuration)
                    },
                    purpose: purpose
                })
            });
        } catch (err) {
            console.log("Upload Song : ", err);
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
| API name          :  uploadSongCover
| Response          :  Respective response message in JSON format
| Logic             :  Upload Song Cover Image
| Request URL       :  BASE_URL/artist/upload-song-cover-image
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadSongCover = (req, res) => {
    (async() => {
        let purpose = "Upload Song Cover Image";
        try {
            let filePath = `${global.constants.songs_cover_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.songCoverUpload,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Song Cover Image : ", err);
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
| API name          :  createNewSong
| Response          :  Respective response message in JSON format
| Logic             :  Create New Song
| Request URL       :  BASE_URL/artist/create-song
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.createNewSong = (req, res) => {
    (async()=>{
        let purpose = "Create New Song";
        try {
            let artistID = req.headers.userID;
            let body = req.body;
            let songDetails = null;

            await sequelize.transaction(async(t) => {
                let artistDetails = await artistRepositories.findOne({ id: artistID });

                let insertData = {
                    name: body.name,
                    cover_picture: body.cover_picture,
                    length: body.length,
                    file_name: body.file_name,
                    details: body.details,
                    artist_id: artistID,
                    country_id: artistDetails.country_id,
                    album_id: body.album_id ? body.album_id : 0,
                    is_paid: body.is_paid ? body.is_paid : 0,
                    genre_id: body.genre_id ? body.genre_id : null,
                    price: body.price ? body.price : null,
                    playedCount: 0,
                    is_active: 1,
                    type: 'song'
                }

                songDetails = await songsRepositories.create(insertData, t);

                if(body.album_id) {
                    await albumRepositories.update({ id: body.album_id }, { total_songs: sequelize.literal(`total_songs + 1`) }, t)
                }
            })

            return res.status(200).send({
                status: 200,
                msg: responseMessages.songCreate,
                data: songDetails,
                purpose: purpose
            })
        }   
        catch(err) {
            console.log("Create New Song Error : ", err);
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
| API name          :  updateSong
| Response          :  Respective response message in JSON format
| Logic             :  Update Song
| Request URL       :  BASE_URL/artist/update-song/<< Song ID >>
| Request method    :  PUT
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.updateSong = (req, res) => {
    (async()=>{
        let purpose = "Update Song"
        try {
            let artistID = req.headers.userID;
            let songID = req.params.id;
            let body = req.body;

            let songDetails = await songsRepositories.findOne({ id: songID, artist_id: artistID });

            if(songDetails) {
                await sequelize.transaction(async(t)=>{
                    let updateData = {
                        name: body.name,
                        cover_picture: body.cover_picture,
                        length: body.length,
                        file_name: body.file_name,
                        details: body.details,
                        artist_id: artistID,
                        album_id: body.album_id ? body.album_id : 0,
                        is_paid: body.is_paid ? body.is_paid : 0,
                        genre_id: body.genre_id ? body.genre_id : null,
                        price: body.price ? body.price : null,
                        is_active: 1,
                        type: 'song'
                    }

                    await songsRepositories.update({ id: songID }, updateData, t);

                    if(body.album_id !== songDetails.album_id) {
                        let albumDetails = await albumRepositories.findOne({ id: songDetails.album_id });

                        if(albumDetails) {
                            let updatePrevAlbum = {};
                            if(albumDetails.total_songs > 0) updatePrevAlbum.total_songs = (albumDetails.total_songs - 1);
                            else updatePrevAlbum.total_songs = 0;
    
                            await albumRepositories.update({ id: songDetails.album_id }, updatePrevAlbum, t);
                        }
                        
                        if(body.album_id !== 0) await albumRepositories.update({ id: body.album_id }, { total_songs: sequelize.literal(`total_songs + 1`) }, t)
                    }
                })

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.songUpdate,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.songNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Update Error : ", err);
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
| API name          :  songDetails
| Response          :  Respective response message in JSON format
| Logic             :  Create New Song
| Request URL       :  BASE_URL/artist/song-details/<< Song ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.songDetails = (req, res) => {
    (async() => {
        let purpose = "Song Details"
        try {
            let artistID = req.headers.userID;
            let songID = req.params.id;
            
            let songCount = await songsRepositories.count({ id: songID, artist_id: artistID });

            if(songCount > 0) {
                let songDetails = await songsRepositories.songDetails({ id: songID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.songDetails,
                    data: songDetails,
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.songNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Song Details Error : ", err);
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
| API name          :  songList
| Response          :  Respective response message in JSON format
| Logic             :  Song List
| Request URL       :  BASE_URL/artist/song-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.songList = (req, res) => {
    (async()=> {
        let purpose = "Song Listing";
        try {
            let artistID = req.headers.userID;

            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            data.order = [
                ['id', 'DESC']
            ];
            where.artist_id = artistID;

            if (queryParam.search) {
                where.name = { $like: `%${queryParam.search}%` };
            }

            let songsList = await songsRepositories.songsList(where, data);

            let dataResp = {
                songsList: songsList.rows,
                totalCount: songsList.count.length
            }

            return res.status(200).json({
                status: 200,
                msg: responseMessages.songList,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Song Listing Error : ", err);
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
| API name          :  songDelete
| Response          :  Respective response message in JSON format
| Logic             :  Song Delete
| Request URL       :  BASE_URL/artist/song-delete/<< Song ID >>
| Request method    :  DELETE
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.songDelete = (req, res) => {
    (async()=> {
        let purpose = "Song Delete";
        try {
            let artistID = req.headers.userID;
            let songID = req.params.id;
            
            let songDetails = await songsRepositories.findOne({ id: songID, artist_id: artistID });

            if(songDetails) {
                await sequelize.transaction(async(t)=>{
                    let songFilePath = path.join(global.appPath, songDetails.file_name);
                    let coverFilePath = path.join(global.appPath,songDetails.cover_picture);
                    
                    fs.unlink(songFilePath, (err)=>{
                        if(err) console.log("Song Delete Error...", err);
                        else console.log("Song Deleted");
                    })
    
                    fs.unlink(coverFilePath, (err)=>{
                        if(err) console.log("Song Cover Image Delete Error...", err);
                        else console.log("Song Cover Image Deleted");
                    })
    
                    if(songDetails.album_id > 0) {
                        let albumDetails = await albumRepositories.findOne({ id: songDetails.album_id });
    
                        if(albumDetails) {
                            let updatePrevAlbum = {};
                            if(albumDetails.total_songs > 0) updatePrevAlbum.total_songs = (albumDetails.total_songs - 1);
                            else updatePrevAlbum.total_songs = 0;
    
                            await albumRepositories.update({ id: songDetails.album_id }, updatePrevAlbum, t);
                        }
                    }
    
                    await songsRepositories.songDelete({ id: songID }, t);
                })

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.songDelete,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.songNotFound,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Song Listing Error : ", err);
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
| API name          :  uploadPodcast
| Response          :  Respective response message in JSON format
| Logic             :  Upload Podcast
| Request URL       :  BASE_URL/artist/upload-podcast
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadPodcast = (req, res) => {
    (async() => {
        let purpose = "Upload Podcast";
        try {
            let filePath = `${global.constants.podcasts_url}/${req.file.filename}`;
            let streamPath = path.join(global.appPath, filePath);
            let fileDuration = 0;

            getAudioDurationInSeconds(streamPath).then((duration) => {
                fileDuration = duration;

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.podcastUpload,
                    data: {
                        filePath: filePath,
                        fileDuration: parseInt(fileDuration)
                    },
                    purpose: purpose
                })
            });
        } catch (err) {
            console.log("Upload Podcast : ", err);
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
| API name          :  uploadPodcastCover
| Response          :  Respective response message in JSON format
| Logic             :  Upload Podcast Cover Image
| Request URL       :  BASE_URL/artist/upload-podcast-cover-image
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.uploadPodcastCover = (req, res) => {
    (async() => {
        let purpose = "Upload Podcast Cover Image";
        try {
            let filePath = `${global.constants.podcasts_cover_url}/${req.file.filename}`;
            return res.status(200).send({
                status: 200,
                msg: responseMessages.podcastCoverUpload,
                data: {
                    filePath: filePath
                },
                purpose: purpose
            })
        } catch (err) {
            console.log("Upload Podcast Cover Image : ", err);
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
| API name          :  createNewPodcast
| Response          :  Respective response message in JSON format
| Logic             :  Create New Podcast
| Request URL       :  BASE_URL/artist/create-podcast
| Request method    :  POST
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.createNewPodcast = (req, res) => {
    (async()=>{
        let purpose = "Create New Podcast";
        try {
            let artistID = req.headers.userID;
            let body = req.body;
            let podcastDetails = null;

            await sequelize.transaction(async(t) => {
                let artistDetails = await artistRepositories.findOne({ id: artistID });

                let insertData = {
                    name: body.name,
                    cover_picture: body.cover_picture,
                    length: body.length,
                    file_name: body.file_name,
                    details: body.details,
                    artist_id: artistID,
                    country_id: artistDetails.country_id,
                    category_id: body.category_id ? body.category_id : 0,
                    is_paid: body.is_paid ? body.is_paid : 0,
                    price: body.price ? body.price : null,
                    is_active: 1,
                    type: 'podcast'
                }

                podcastDetails = await podcastRepositories.create(insertData, t);
            })

            return res.status(200).send({
                status: 200,
                msg: responseMessages.podcastCreate,
                data: podcastDetails,
                purpose: purpose
            })
        }   
        catch(err) {
            console.log("Create New Podcast Error : ", err);
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
| API name          :  podcastDetails
| Response          :  Respective response message in JSON format
| Logic             :  Create New Podcast
| Request URL       :  BASE_URL/artist/podcast-details/<< Podcast ID >>
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.podcastDetails = (req, res) => {
    (async() => {
        let purpose = "Podcast Details"
        try {
            let artistID = req.headers.userID;
            let podcastID = req.params.id;
            
            let podcastCount = await podcastRepositories.count({ id: podcastID, artist_id: artistID });

            if(podcastCount > 0) {
                let podcastDetails = await podcastRepositories.podcastDetails({ id: podcastID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.podcastDetails,
                    data: podcastDetails,
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.podcastNotFoundNew,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Podcast Details Error : ", err);
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
| API name          :  podcastList
| Response          :  Respective response message in JSON format
| Logic             :  Podcast List
| Request URL       :  BASE_URL/artist/podcast-list
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.podcastList = (req, res) => {
    (async()=>{
        let purpose = "Podcast List";
        try {
            let artistID = req.headers.userID;

            let queryParam = req.query;
            let where = {};
            let data = {};
            let page = queryParam.page ? parseInt(queryParam.page) : 1;
            data.limit = 20;
            data.offset = data.limit ? data.limit * (page - 1) : null;
            data.order = [
                ['id', 'DESC']
            ];
            where.artist_id = artistID;

            if (queryParam.search) {
                where.name = { $like: `%${queryParam.search}%` };
            }

            let podcastsList = await podcastRepositories.podcastsList(where, data);

            let dataResp = {
                podcastsList: podcastsList.rows,
                totalCount: podcastsList.count.length
            }

            return res.status(200).json({
                status: 200,
                msg: responseMessages.podcastsList,
                data: dataResp,
                purpose: purpose
            })
        }
        catch(err) {
            console.log("Podcast List Error : ", err);
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
| API name          :  updatePodcast
| Response          :  Respective response message in JSON format
| Logic             :  Podcast Update
| Request URL       :  BASE_URL/artist/podcast-update/<< Podcast ID >>
| Request method    :  PUT
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.updatePodcast = (req, res) => {
    (async()=>{
        let purpose = "Podcast Update"
        try {
            let artistID = req.headers.userID;
            let podcastID = req.params.id;
            let body = req.body;

            let podcastDetails = await podcastRepositories.findOne({ id: podcastID, artist_id: artistID });

            if(podcastDetails) {
                await sequelize.transaction(async(t)=>{
                    let updateData = {
                        name: body.name,
                        cover_picture: body.cover_picture,
                        length: body.length,
                        file_name: body.file_name,
                        details: body.details,
                        artist_id: artistID,
                        category_id: body.category_id ? body.category_id : 0,
                        is_paid: body.is_paid ? body.is_paid : 0,
                        price: body.price ? body.price : null,
                        is_active: 1,
                        type: 'podcast'
                    }

                    await podcastRepositories.update({ id: podcastID }, updateData, t);
                })

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.podcastUpdate,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.podcastNotFoundNew,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Podcast Update Error : ", err);
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
| API name          :  deletePodcast
| Response          :  Respective response message in JSON format
| Logic             :  Podcast Delete
| Request URL       :  BASE_URL/artist/delete-podcast/<< Podcast ID >>
| Request method    :  DELETE
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.deletePodcast = (req, res) => {
    (async()=>{
        let purpose = "Delete Podcast";
        try {
            let artistID = req.headers.userID;
            let podcastID = req.params.id;

            let podcastDetails = await podcastRepositories.findOne({ id: podcastID, artist_id: artistID });
            
            if(podcastDetails) {
                let podcastFilePath = path.join(global.appPath, podcastDetails.file_name);
                let coverFilePath = path.join(global.appPath,podcastDetails.cover_picture);
                
                fs.unlink(podcastFilePath, (err)=>{
                    if(err) console.log("Podcast Delete Error...", err);
                    else console.log("Podcast Deleted");
                })

                fs.unlink(coverFilePath, (err)=>{
                    if(err) console.log("Podcast Cover Image Delete Error...", err);
                    else console.log("Podcast Cover Image Deleted");
                })

                await podcastRepositories.delete({ id: podcastID });

                return res.status(200).send({
                    status: 200,
                    msg: responseMessages.podcastDelete,
                    data: {},
                    purpose: purpose
                })
            }
            else {
                return res.status(404).send({
                    status: 404,
                    msg: responseMessages.podcastNotFoundNew,
                    data: {},
                    purpose: purpose
                })
            }
        }
        catch(err) {
            console.log("Delete Podcast Error : ", err);
            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
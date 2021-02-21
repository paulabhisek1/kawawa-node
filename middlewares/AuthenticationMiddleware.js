const jwt = require('jsonwebtoken');
const responseMessages = require('../responseMessages');

// ################################ Repositories ################################ //
const userRepositories = require('../repositories/UsersRepositories');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;

//User Authentication
module.exports.authenticateRequestAPI = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let accessToken = req.headers.authorization.split(' ')[1];
            jwt.verify(accessToken, jwtOptionsAccess.secret, async (err, decodedToken) => {
                if (err) {
                    return res.json({
                        status: 401,
                        message: responseMessages.authFailure,
                    })
                }
                else {
                    let userCount = await userRepositories.count({ where: { id: decodedToken.user_id } });
                    
                    if(userCount > 0) {
                        req.headers.userID = decodedToken.user_id;
                        next();
                    }
                    else{
                        return res.json({
                            status: 401,
                            message: responseMessages.authFailure,
                        })
                    }
                }
            });
        }
        else {
            return res.json({
                status: 401,
                message: responseMessages.authRequired
            })
        }

    }
    catch (e) {
        console.log("Middleware Error : ", e);
        res.json({
            status: 500,
            message: responseMessages.serverError,
        })
    }
}
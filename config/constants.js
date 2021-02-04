module.exports = {
    allowMimeType: ['image/jpeg', 'image/png', 'application/pdf','video/mp4', 'image/svg'],
    jwtAccessTokenOptions: {
        secret: 'KawawaMusicApp#@2021',
        options: {
            algorithm: 'HS256',
            expiresIn: '7d',
            audience: 'aud:Kawawa',
            issuer: 'Kawawa-' + process.env.GIT_BRANCH + '-' + (process.env.NODE_ENV == 'development' ? 'DEV' : 'PROD') + '@' + require('os').hostname()
        }
    },
    jwtRefreshTokenOptions: {
        secret: 'KawawaMusicApp#@2021',
        options: {
            algorithm: 'HS256',
            expiresIn: '3d',
            audience: 'aud:Kawawa',
            issuer: 'Kawawa-' + process.env.GIT_BRANCH + '-' + (process.env.NODE_ENV == 'development' ? 'DEV' : 'PROD') + '@' + require('os').hostname()
        }
    },
}
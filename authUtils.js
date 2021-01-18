const jwt = require('jsonwebtoken')

const accessTokenSecret = 'asdkflj89we##+ß093izhjjsdfdmfj'

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            }
            req.user = user
            next()
        })
    } else {
        res.status(401).json({
            message: 'Invalid token.'
        })
    }
}

const signJWT = (data) => {
    return jwt.sign(data, accessTokenSecret)
}

module.exports = {
    authenticateJWT,
    signJWT
}
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const getTokenFrom = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const tokenChecker = async (request, compare = null) => {
    const token = await getTokenFrom(request)
    const decodedToken = await jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
        return false
    }
    const user = await User.findById(decodedToken.id)
    if(user._id.toString() === compare || compare === null) {
        return decodedToken
    } else {
        return false
    }
}

module.exports = tokenChecker
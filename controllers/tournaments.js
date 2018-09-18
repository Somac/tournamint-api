const tournamentRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Tournament = require('../models/tournament')
const User = require('../models/user')
const slug = require('slug')

const getTokenFrom = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const slugify = (title) => {
    return slug(title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

tournamentRouter.get('/', async (request, response) => {
    const tournaments = await Tournament
        .find({})
        .populate('user', { username: 1, name: 1 })
    response.json(tournaments.map(Tournament.format))
})

tournamentRouter.get('/:id', async (request, response) => {
    try {
        const tournament = await Tournament.findById(request.params.id)
        if (tournament) {
            response.json(Tournament.format(tournament))
        } else {
            response.status(404).end()
        }
    } catch (e) {
        response.status(400).send({ error: 'Malformatted id' })
    }
})

tournamentRouter.post('/', async (request, response) => {
    const body = request.body

    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'Token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)

        if (user === undefined) {
            return response.status(400)
        }

        if (body.name === undefined) {
            return response.status(400).json({ error: 'No name for tournament' })
        }

        const slugUrl = slugify(body.name)

        const tournament = new Tournament({ ...body, user: user.id, slug: slugUrl })
        const savedTournament = await tournament.save()

        user.tournaments = user.tournaments.concat(savedTournament._id)
        await user.save()

        response.json(Tournament.format(savedTournament))
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
            response.status(401).json({ error: e.message })
        } else {
            console.log(e)
            response.status(500).json({ error: e.message })
        }
    }
})

module.exports = tournamentRouter
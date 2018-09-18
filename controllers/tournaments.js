const tournamentRouter = require('express').Router()
const Tournament = require('../models/tournament')
const tokenChecker = require('../utils/check_token')
const slugify = require('../utils/slugify')
const User = require('../models/user')

tournamentRouter.get('/', async (request, response) => {
    try {
        const tournaments = await Tournament
            .find({})
            .populate('user', { username: 1, name: 1, _id: 1 })
        return response.json(tournaments.map(Tournament.format))
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:id', async (request, response) => {
    try {
        const tournament = await Tournament.findById(request.params.id)
        if (tournament) {
            return response.json(Tournament.format(tournament))
        } else {
            return response.status(404).end()
        }
    } catch (e) {
        return response.status(400).send({ error: 'Malformatted id' })
    }
})

tournamentRouter.post('/', async (request, response) => {
    const body = request.body

    try {
        decodedToken = tokenChecker(request)

        if (!decodedToken) {
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

        return response.json(Tournament.format(savedTournament))
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
            return response.status(401).json({ error: e.message })
        } else {
            console.log(e)
            return response.status(500).json({ error: e.message })
        }
    }
})

module.exports = tournamentRouter
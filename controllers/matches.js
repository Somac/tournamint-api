const matchRouter = require('express').Router()
const Match = require('../models/match')
const Goal = require('../models/goal')
const Tournament = require('../models/tournament')
const tokenChecker = require('../utils/check_token')
const Team = require('../models/team')
const slugify = require('../utils/slugify')

matchRouter.get('/', async (request, response) => {
    try {
        const matches = await Match
            .find({})

        return response.json(matches)
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

matchRouter.post('/', async (request, response) => {
    const body = request.body
    try {
        const tournamentId = body.tournamentId
        const tournament = await Tournament.findById(tournamentId)

        decodedToken = await tokenChecker(request, tournament.user.toString())
        if (!decodedToken) {
            return response.status(403).end()
        }
        const awayTeam = await Team.findById(body.awayTeam)
        const homeTeam = await Team.findById(body.homeTeam)
        const slugUrl = slugify(`${awayTeam.name}-${homeTeam.name}`)
        const match = new Match({
            slug: slugUrl,
            tournament: tournamentId,
            homeTeam: homeTeam._id,
            awayTeam: awayTeam._id
        })
        const savedMatch = await match.save()
        homeTeam.matches = homeTeam.matches.concat(savedMatch._id)
        awayTeam.matches = awayTeam.matches.concat(savedMatch._id)
        tournament.matches = tournament.matches.concat(savedMatch._id)
        await homeTeam.save()
        await awayTeam.save()
        await tournament.save()

        return response.json(savedMatch)
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
            return response.status(401).json({ error: e.message })
        } else {
            return response.status(500).json({ error: e.message })
        }
    }
})

matchRouter.get('/:id', async (request, response) => {
    try {
        const matchId = request.params.id
        const match = await Match.find({ _id: matchId })
        if (match) {
            return response.json(match)
        } else {
            return response.status(404).end()
        }
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

matchRouter.get('/:id/goals', async (request, response) => {
    try {
        const matchId = request.params.id
        const match = await Match.find({ _id: matchId })
        if (match) {
            const goals = await Goal.find({ match: matchId })
            return response.json(goals)
        } else {
            return response.status(404).end()
        }
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

matchRouter.put('/:id/complete', async (request, response) => {
    try {
        const matchId = request.params.id
        const match = await Match.findById(matchId)
        const complete = { completed: true }
        if (match) {
            const mergedMatch = { ...match._doc, ...complete }
            const updatedMatch = await Match
                .findByIdAndUpdate(matchId, mergedMatch)
            return response.json(updatedMatch)
        } else {
            return response.status(404).end()
        }
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

module.exports = matchRouter

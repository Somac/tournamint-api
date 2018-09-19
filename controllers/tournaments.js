const tournamentRouter = require('express').Router()
const Tournament = require('../models/tournament')
const tokenChecker = require('../utils/check_token')
const slugify = require('../utils/slugify')
const User = require('../models/user')
const Team = require('../models/team')
const Match = require('../models/match')

tournamentRouter.get('/', async (request, response) => {
    try {
        const tournaments = await Tournament
            .find({})
            .populate('user', { username: 1, name: 1, _id: 1 })
            .populate('teams', { name: 1, description: 1, logo: 1, slug: 1 })
            .populate('matches')

        return response.json(tournaments.map(Tournament.format))
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:id', async (request, response) => {
    try {
        const tournament = await Tournament
            .findById(request.params.id)
            .populate('user', { username: 1, name: 1, _id: 1 })
            .populate('teams', { name: 1, description: 1, logo: 1, slug: 1 })
            .populate('matches')
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
            return response.status(500).json({ error: e.message })
        }
    }
})

tournamentRouter.delete('/:id', async (request, response) => {
    try {
        const tournamentToDelete = await Tournament.findById(request.params.id)
        decodedToken = tokenChecker(request, tournamentToDelete.user.toString())
        if (!decodedToken) {
            return response.status(403).end()
        }
        await Tournament.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch (e) {
        response.status(400).send({ error: 'malformatted id' })
    }
})

tournamentRouter.put('/:id', async (request, response) => {
    try {
        const oldTournament = await Tournament.findById(request.params.id)
        decodedToken = await tokenChecker(request, oldTournament.user.toString())
        if (!decodedToken) {
            return response.status(403).end()
        }
        const tournament = request.body
        const updatedTournament = await Tournament.findByIdAndUpdate(request.params.id, tournament)
        response.json(Tournament.format(updatedTournament))
    } catch (e) {
        response.status(400).send({ error: 'malformatted id' })
    }
})

tournamentRouter.put('/:id/team/:tid', async (request, response) => {
    try {
        const tournament = await Tournament.findById(request.params.id)
        const team = await Team.findById(request.params.tid)
        decodedToken = await tokenChecker(request, tournament.user.toString())
        if (!decodedToken) {
            return response.status(403).end()
        }
        tournament.teams = tournament.teams.concat(request.params.tid)
        team.tournaments = team.tournaments.concat(request.params.id)
        await tournament.save()
        await team.save()
        response.json(Tournament.format(tournament))
    } catch (e) {
        response.status(400).send({ error: 'malformatted id' })
    }
})

tournamentRouter.post('/:id/matches', async (request, response) => {
    const body = request.body
    console.log(body)
    try {
        const tournamentId = request.params.id
        const tournament = await Tournament.findById(tournamentId)
        decodedToken = await tokenChecker(request, tournament.user.toString())
        if (!decodedToken) {
            //return response.status(403).end()
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
    } catch(e) {
        if (e.name === 'JsonWebTokenError') {
            return response.status(401).json({ error: e.message })
        } else {
            return response.status(500).json({ error: e.message })
        }
    }
})

module.exports = tournamentRouter

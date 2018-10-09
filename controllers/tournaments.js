const tournamentRouter = require('express').Router()
const Tournament = require('../models/tournament')
const tokenChecker = require('../utils/check_token')
const slugify = require('../utils/slugify')
const User = require('../models/user')
const Team = require('../models/team')
const Match = require('../models/match')
const robin = require('roundrobin')

shuffle = (array) => {
    let currentIndex = array.length
    let temporaryValue
    let randomIndex
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

tournamentRouter.get('/', async (request, response) => {
    try {
        let tournaments = await Tournament
            .find({})
            .populate('user', { username: 1, name: 1, _id: 1 })
            .populate('teams', { name: 1, description: 1, logo: 1, slug: 1, gamerName: 1 })
            .populate('matches')
            .populate('league')

        return response.json(tournaments.map(Tournament.format))
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:slug', async (request, response) => {
    try {
        const tournament = await Tournament
            .findOne({ slug: request.params.slug })
            .populate('user', { username: 1, name: 1, _id: 1 })
            .populate('teams', { name: 1, description: 1, logo: 1, slug: 1, gamerName: 1 })
            .populate({
                path: 'matches',
                select: '-tournament',
                populate: [
                    { path: 'homeTeam', select: 'name gamerName shortHand logo slug' },
                    { path: 'awayTeam', select: 'name gamerName shortHand logo slug' },
                    {
                        path: 'goals', populate:
                            [
                                { path: 'scorer' },
                                { path: 'firstAssist' },
                                { path: 'secondAssist' }]
                    }
                ]
            })

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
        decodedToken = await tokenChecker(request)
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
        const tournament = new Tournament({ ...body, user: user._id, slug: slugUrl })
        if (body.generateMatches) {
            const roundRobin = robin(tournament.teams.length, tournament.teams)
            let i
            for (i = 1; i <= body.rounds; i++) {
                const matchesArray = roundRobin
                    .reduce((matches, match) => {
                        match.map(m => {
                            let awayTeam, homeTeam
                            if (i % 2 === 0) {
                                awayTeam = m[0]
                                homeTeam = m[1]
                            } else {
                                awayTeam = m[1]
                                homeTeam = m[0]
                            }
                            const slugUrl = slugify(`${awayTeam}-${homeTeam}`)
                            const newMatch = new Match({
                                slug: slugUrl,
                                tournament: tournament._id,
                                homeTeam: homeTeam._id,
                                awayTeam: awayTeam._id,
                                round: i
                            })
                            matches.push(newMatch)
                        })
                        return matches
                    }, [])
                const randomArray = shuffle(matchesArray)
                randomArray.map(match => {
                    match.save()
                    tournament.matches = tournament.matches.concat(match._id)
                })
            }
        }
        const savedTournament = await tournament.save()
        const tournamentId = savedTournament._id
        user.tournaments = user.tournaments.concat(tournamentId)
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
        const tournament = request.body
        const oldTournament = await Tournament.findById(request.params.id)
        decodedToken = await tokenChecker(request, oldTournament.user.toString())
        if (!decodedToken) {
            return response.status(403).end()
        }
        const mergedUpdate = { ...oldTournament._doc, ...tournament }
        const updatedTournament = await Tournament
            .findByIdAndUpdate(request.params.id, mergedUpdate)

        response.json(Tournament.format(updatedTournament))
    } catch (e) {
        response.status(400).send({ error: e.message })
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
        response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:id/teams', async (request, response) => {
    try {
        const teams = await Team.find({ tournaments: request.params.id })
        response.json(teams)
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:slug/matches', async (request, response) => {
    try {
        const tournament = await Tournament.findOne({ slug: request.params.slug })
        const tournamentId = tournament._id
        const matches = await Match
            .find({ tournament: tournamentId })
            .populate('homeTeam', { name: 1, description: 1, logo: 1, slug: 1 })
            .populate('awayTeam', { name: 1, description: 1, logo: 1, slug: 1 })
            .populate('goals')
            .select('-tournament')
        if (matches) {
            return response.json(matches)
        } else {
            return response.status(404).end()
        }
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

tournamentRouter.get('/:slug/standings', async (request, response) => {
    try {
        const tournament = await Tournament
            .findOne({ slug: request.params.slug })
            .populate('teams', { name: 1, description: 1, logo: 1, slug: 1, gamerName: 1 })
            .populate({
                path: 'matches',
                select: '-tournament',
                populate: [{ path: 'goals' }]
            })
        const returned = tournament.teams.map(team => {
            const homeMatches = tournament.matches.filter(match => match.homeTeam.toString() === team._id.toString())
            const awayMatches = tournament.matches.filter(match => match.awayTeam.toString() === team._id.toString())
            const matches = [...homeMatches, ...awayMatches]
            const scores = matches.reduce((r, match) => {
                if (match.completed) {
                    const homeGoals = match.goals.filter(m => m.homeTeam).length
                    const awayGoals = match.goals.filter(m => m.awayTeam).length
                    r.gp++
                    if (team._id.toString() === match.homeTeam.toString()) {
                        r.gf += homeGoals
                        r.ga += awayGoals
                        if (homeGoals > awayGoals) {
                            r.homeWins += 1
                            r.pts += 2
                        } else if (match.ot) {
                            r.homeOt += 1
                            r.pts += 1
                        } else {
                            r.homeLosses += 1
                        }
                    } else {
                        r.ga += homeGoals
                        r.gf += awayGoals
                        if (homeGoals < awayGoals) {
                            r.awayWins += 1
                            r.pts += 2
                        } else if (match.ot) {
                            r.awayOt += 1
                            r.pts += 1
                        } else {
                            r.awayLosses += 1
                        }
                    }
                }
                return r
            }, {
                    gp: 0,
                    pts: 0,
                    gf: 0,
                    ga: 0,
                    homeWins: 0,
                    homeLosses: 0,
                    homeOt: 0,
                    awayWins: 0,
                    awayLosses: 0,
                    awayOt: 0
                }
            )
            return { 
                team: team.name, 
                ...scores,
                w: scores.awayWins + scores.homeWins,
                l: scores.awayLosses + scores.homeLosses,
                ot: scores.awayOt + scores.homeOt,
                home: `${scores.homeWins}-${scores.homeLosses}-${scores.homeOt}`,
                away: `${scores.awayWins}-${scores.awayLosses}-${scores.awayOt}`
            }
        })
        return response.json(returned)
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

module.exports = tournamentRouter

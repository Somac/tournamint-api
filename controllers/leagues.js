const leagueRouter = require('express').Router()
const League = require('../models/league')

leagueRouter.get('/', async (request, response) => {
    const leagues = await League
        .find({})
        .populate('game')
    response.json(leagues)
})

leagueRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const existingLeague = await League.find({ name: body.name })

        if (existingLeague.length > 0) {
            return response.status(400).json({ error: 'league already added, no duplicates' })
        }
        if (!body.name || !body.game) {
            return response.status(400).json({ error: 'missing name or game' })
        }

        const league = new League({ ...body })
        const savedLeague = await league.save()

        response.json(savedLeague)
    } catch (e) {
        response.status(500).json({ error: e.message })
    }
})

leagueRouter.get('/:id', async (req, response) => {
    try {
        const league = await League.findById(req.params.id).populate('game')
        if (league) {
            response.json(league)
        } else {
            response.status(404).end()
        }
    } catch (e) {
        response.status(400).json({ error: e.message })
    }

})

module.exports = leagueRouter

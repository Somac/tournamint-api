const playerRouter = require('express').Router()
const Player = require('../models/player')
const Team = require('../models/team')

playerRouter.get('/', async (req, res) => {
    try {
        const players = await Player
            .find({})
            .populate({ path: 'team', select: '-players' })
        res.json(players)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

playerRouter.get('/:id', async (req, res) => {
    try {
        const player = await Player
            .findById(req.params.id)
            .populate({ path: 'team', select: '-player' })

        res.json(player)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

playerRouter.post('/', async (req, res) => {
    try {
        const body = req.body
        const player = new Player({ ...body })
        const savedPlayer = player.save()

        if (savedPlayer.team) {
            team = Team.findById(savedPlayer.team)
            if (team) {
                team.players = team.players.concat(savedPlayer._id)
                team.save()
            }
        }

        res.json(savedPlayer)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

playerRouter.put('/:id', async (req, res) => {
    try {
        const player = req.body
        const oldPlayer = await Player.findById(req.params.id)
        const mergedPlayer = { ...oldPlayer, ...player }
        const updatedPlayer = await Player
            .findByIdAndUpdate(req.params.id, mergedPlayer)

        res.json(updatedPlayer)
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

module.exports = playerRouter

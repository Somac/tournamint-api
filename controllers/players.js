const playerRouter = require('express').Router()
const Player = require('../models/player')

playerRouter.get('/', async (req, res) => {
    try {
        const players = await Player.find({})
        res.json(players)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

module.exports = playerRouter
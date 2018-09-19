const matchRouter = require('express').Router()
const Match = require('../models/match')

matchRouter.get('/', async (request, response) => {
    try {
        const matches = await Match
            .find({})

        return response.json(matches)
    } catch (e) {
        return response.status(400).send({ error: e.message })
    }
})

module.exports = matchRouter

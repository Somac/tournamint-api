const gameRouter = require('express').Router()
const Game = require('../models/game')

gameRouter.get('/', async (request, response) => {
  const games = await Game.find({})
  response.json(games)
})

gameRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const existingGame = await Game.find({ name: body.name })
    if (existingGame.length > 0) {
      response.status(400).json({ error: 'game already added, no duplicates' })
    }

    const game = new Game({ ...body })

    const savedGame = await game.save()

    response.json(savedGame)
  } catch (e) {
    response.status(500).json({ error: e })
  }
})

module.exports = gameRouter

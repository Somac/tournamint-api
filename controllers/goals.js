const goalRouter = require('express').Router()
const Goal = require('../models/goal')
const Match = require('../models/match')
const Player = require('../models/player')

goalRouter.get('/', async (request, response) => {
  const goals = await Goal
    .find({})
    .populate('match')
    .populate('scorer')
    .populate('firstAssist')
    .populate('secondAssist')

  response.json(goals)
})

goalRouter.get('/:id', async (request, response) => {
  try {
    const goal = await Goal
      .findById(request.params.id)
      .populate('match')
      .populate('scorer')
      .populate('firstAssist')
      .populate('secondAssist')

    if (goal) {
      response.json(goal)
    } else {
      response.status(404).end()
    }
  } catch (e) {
    response.status(400).json({ error: e.message })
  }
})

goalRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const match = await Match.findById(body.match)
    if (!match) {
      return response.status(400).json({ error: 'No match found' })
    }
    if (match.completed) {
      return response.status(400).json({ error: 'Match is finished' })
    }
    const goal = new Goal({ ...body })
    if (body.scorer) {
      const player = await Player.findById(body.scorer)
      if (player) {
        player.goals = player.goals.concat(goal._id)
        await player.save()
      }
    }
    if (body.firstAssist) {
      const assister = await Player.findById(body.firstAssist)
      if (assister) {
        assister.assists = assister.assists.concat(goal._id)
        await assister.save()
      }
    }
    if (body.secondAssist) {
      const assisterTwo = await Player.findById(body.secondAssist)
      if (assisterTwo) {
        assisterTwo.assists = assisterTwo.assists.concat(goal._id)
        await assisterTwo.save()
      }
    }
    const savedGoal = await goal.save()
    match.goals = match.goals.concat(savedGoal._id)
    await match.save()

    const findSavedPopulate = await Goal
      .findById(savedGoal._id)
      .populate('scorer')
      .populate('firstAssist')
      .populate('secondAssist')

    response.json(findSavedPopulate)
  } catch (e) {
    response.status(500).json({ error: e.message })
  }
})

goalRouter.put('/:id', async (request, response) => {
  try {
    const goal = request.body
    const oldGoal = await Goal.findById(request.params.id)
    const mergedGoal = { ...oldGoal, ...goal }
    const updatedGoal = await Goal
      .findByIdAndUpdate(request.params.id, mergedGoal)

    response.json(updatedGoal)
  } catch (e) {
    response.status(400).send({ error: e.message })
  }
})

goalRouter.delete('/:id', async (request, response) => {
  try {
    const goal = await Goal.findById(request.params.id)
    const match = await Match.findById(goal.match)
    if (match.completed) {
      response.status(400).json({ error: 'Match is finished' })
    }
    await Goal.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (e) {
    response.status(400).send({ error: e.message })
  }
})

module.exports = goalRouter

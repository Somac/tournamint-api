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
        const match = Match.findById(body.match)
        if (!match) {
            return response.status(400).json({ error: 'No match found' })
        }
        if (match.completed) {
            return response.status(400).json({ error: 'Match is finished' })
        }
        const goal = new Goal({ ...body })
        const savedGoal = await goal.save()

        response.json(savedGoal)
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

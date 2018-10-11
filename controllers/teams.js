const teamRouter = require('express').Router()
const Team = require('../models/team')
const League = require('../models/league')
const Tournament = require('../models/tournament')
const Player = require('../models/player')
const Match = require('../models/match')
const multer = require('multer')
const slugify = require('../utils/slugify')
const path = require('path')
const requestHttp = require('request')

const doPromiseRequest = (url) => {
    return new Promise((resolve, reject) => {
        requestHttp(url, (error, resp, body) => {
            if (!error && resp.statusCode == 200) {
                resolve(JSON.parse(body).roster);
            } else {
                reject(error);
            }
        })
    })
}

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        const uploadFolder = process.env.UPLOADFOLDER ? process.env.UPLOADFOLDER : './uploads/'
        cb(null, uploadFolder)
    },
    filename: (request, file, cb) => {
        const fileName = `${new Date().toISOString()}_${file.originalname}`
        cb(null, fileName)
    }
})

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
        return cb(null, true)
    }
    cb(`Error: File upload only supports the following filetypes - ${filetypes}`)
}

const upload = multer({ storage, fileFilter })

teamRouter.get('/', async (request, response) => {
    try {
        const teams = await Team
            .find({})
            
        response.json(teams.map(Team.format))
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.post('/', upload.single('logo'), async (request, response) => {
    const body = request.body
    try {
        const slugUrl = slugify(body.name)
        const logo = request.file ? request.file.path : null
        if(!Number(body.apiId)) {
            delete body.apiId
        }
        const team = new Team({ ...body, logo, slug: slugUrl })

        if (body.apiId != null && body.league && body.apiForPlayers === 'true') {
            const league = await League.findById(team.league)
            let apiUrl = `${league.apiUrlTeams}/${body.apiId}/roster`
            const roster = await doPromiseRequest(apiUrl)
            const players = roster.map(roster => {
                const newPlayer = new Player({
                    'name': roster.person.fullName,
                    'jerseyNumber': roster.jerseyNumber,
                    'position': roster.position.abbreviation,
                    'apiId': roster.person.id,
                    'team': team._id
                })
                return newPlayer
            })
            players.map(player => {
                player.save()
                team.players = team.players.concat(player._id)
            })
            const savedTeam = await team.save()
            response.json(Team.format(savedTeam))
        } else {
            const savedTeam = await team.save()
            response.json(Team.format(savedTeam))
        }
    } catch (e) {
        console.log(e.message)
        response.status(400).send({ error: 'What?' })
    }
})

teamRouter.put('/:slug', upload.single('logo'), async (request, response) => {
    try {
        const team = request.body
        const oldTeam = await Team.findById(request.params.id)
        const mergedTeam = { ...oldTeam, ...team }
        const updatedTeam = await Team
            .findByIdAndUpdate(request.params.id, mergedTeam)

        response.json(updatedTeam)
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.get('/:slug', async (request, response) => {
    try {
        const team = await Team
            .findOne({ slug: request.params.slug })
            .populate('players')
            .populate('league')
            .select('-matches -tournaments')

        const tournaments = await Tournament
            .find({ teams: team._id })
            .select('name description slug createdAt')

        const homeMatches = await Match
            .find({ homeTeam: team._id })
            .populate('goals')
        const awayMatches = await Match
            .find({ awayTeam: team._id })
            .populate('goals')

        const matches = [...homeMatches, ...awayMatches]

        const teamWithMatches = { ...team._doc, matches, tournaments}
        
        response.json(teamWithMatches)
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.delete('/:slug', async (request, response) => {
    try {
        const team = await Team.findOne({ slug: request.params.slug })
        if (team.tournaments) {
            return response.status(403).json({ error: 'Team cant be deleted if it is involved in a tournament' })
        }
        await Team.findByIdAndRemove(team._id)
        response.status(204).end()
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.get('/:slug/players', async (request, response) => {
    try {
        const team = await Team.findOne({ slug: request.params.slug })
        const players = await Player.find({ team: team._id })

        response.json(players)
    } catch (e) {
        response.status(500).send({ error: e.message })
    }
})

teamRouter.put('/:slug/players/:pid', async (request, response) => {
    try {
        const team = await Team.findOne({ slug: request.params.slug })
        const player = await Player.findById(request.params.pid)
        team.players = team.players.concat(player._id)
        player.team = team._id
        await team.save()
        await player.save()
        response.json(team)
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.get('/:slug/matches', async (req, res) => {
    try {
        const team = await Team.findOne({ slug: req.params.slug })
        const homeMatches = await Match
            .find({ homeTeam: team._id })
            .populate('goals')
        const awayMatches = await Match
            .find({ awayTeam: team._id })
            .populate('goals')
        const matches = { homeMatches, awayMatches }
        res.json(matches)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

module.exports = teamRouter

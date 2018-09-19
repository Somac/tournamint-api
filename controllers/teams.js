const teamRouter = require('express').Router()
const Tournament = require('../models/tournament')
const Team = require('../models/team')
const multer = require('multer')
const slugify = require('../utils/slugify')

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (request, file, cb) => {
        cb(null, file.filename)
    }
})

const fileFilter = (request, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage, fileFilter })

teamRouter.get('/', async (request, response) => {
    try {
        const teams = await Team.find({})
        response.json(teams.map(Team.format))
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.post('/', upload.single('teamLogo'), async (request, response) => {
    const body = request.body
    console.log(request.file)
    try {
        const slugUrl = slugify(body.teamName)
        const team = new Team({ ...body, teamLogo: request.file.path, slug: slugUrl })
        const savedTeam = await team.save()

        response.json(Team.format(savedTeam))
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

module.exports = teamRouter
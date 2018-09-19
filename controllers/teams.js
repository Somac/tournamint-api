const teamRouter = require('express').Router()
const Tournament = require('../models/tournament')
const Team = require('../models/team')
const multer = require('multer')
const slugify = require('../utils/slugify')
const path = require('path')

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (request, file, cb) => {
        const fileName = `${new Date().toISOString()}_${file.originalname}`
        cb(null, fileName)
    }
})

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/
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
        const teams = await Team.find({})
        response.json(teams.map(Team.format))
    } catch (e) {
        response.status(400).send({ error: e.message })
    }
})

teamRouter.post('/', upload.single('logo'), async (request, response) => {
    const body = request.body
    try {
        const slugUrl = slugify(body.name)
        const team = new Team({ ...body, logo: request.file.path, slug: slugUrl })
        const savedTeam = await team.save()

        response.json(savedTeam)
    } catch (e) {
        response.status(400).send({ error: 'error :D' })
    }
})

teamRouter.get('/:slug', async (request, response) => {
    try {
        const team = await Team.findOne({ slug: request.params.slug })

    } catch (e) {

    }
})

module.exports = teamRouter
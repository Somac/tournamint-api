const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const helmet = require('helmet')
const tournamentRouter = require('./controllers/tournaments')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const teamRouter = require('./controllers/teams')
const matchRouter = require('./controllers/matches')
const gameRouter = require('./controllers/games')
const leagueRouter = require('./controllers/leagues')
const playerRouter = require('./controllers/players')
const goalRouter = require('./controllers/goals')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)
mongoose.connect(config.mongoUrl)

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})

app.use(bodyParser.json())
app.use(cors())
app.use(helmet())
app.use(morgan(':method :url :body :status  :res[content-length] - :response-time ms'))
app.use('/uploads',express.static('uploads'))

app.use('/api/tournaments', tournamentRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/teams', teamRouter)
app.use('/api/matches', matchRouter)
app.use('/api/games', gameRouter)
app.use('/api/leagues', leagueRouter)
app.use('/api/players', playerRouter)
app.use('/api/goals', goalRouter)

const server = http.createServer(app)

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
    mongoose.connection.close()
})

module.exports = {
    app, server
}

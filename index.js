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

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI)

morgan.token('body', function (req) {
    return JSON.stringify(req.body)
})

app.use(bodyParser.json())
app.use(cors())
app.use(helmet())
app.use(morgan(':method :url :body :status  :res[content-length] - :response-time ms'))

app.use('/api/tournaments', tournamentRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.get('/hello', (req, res) => {
    res.send('hello world')
})

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
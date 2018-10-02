const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    name: String,
    jerseyNumber: Number,
    position: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
    assists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
    apiId: Number
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player

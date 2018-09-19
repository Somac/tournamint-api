const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    name: { fist: String, last: String },
    jerseyNumber: Number,
    position: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    apiId: Number
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
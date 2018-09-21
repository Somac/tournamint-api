const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    scorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    firstAssist: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    secondAssist: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    homeTeam: { type: Boolean, default: false },
    awayTeam: { type: Boolean, default: false }
}, { timestamps: true })

const Goal = mongoose.model('Goal', goalSchema)

module.exports = Goal

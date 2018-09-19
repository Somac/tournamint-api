const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
    completed: { type: Boolean, default: false },
    slug: { type: String, lowercase: true, unique: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }]
}, { timestamps: true })

const Match = mongoose.model('Match', matchSchema)

module.exports = Match
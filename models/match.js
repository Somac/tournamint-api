const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const matchSchema = new mongoose.Schema({
    completed: { type: Boolean, default: false },
    slug: { type: String, lowercase: true, unique: true },
    round: Number,
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }]
}, { timestamps: true })

matchSchema.plugin(uniqueValidator, { message: 'is already taken' })

const Match = mongoose.model('Match', matchSchema)

module.exports = Match

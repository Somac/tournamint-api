const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const tournamentSchema = new mongoose.Schema({
    slug: { type: String, lowercase: true, unique: true },
    name: String,
    description: String,
    rounds: Number,
    toAdvance: Number,
    started: { type: Boolean, default: false },
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]
}, { timestamps: true })

tournamentSchema.plugin(uniqueValidator, { message: 'is already taken' })

tournamentSchema.statics.format = (tournament) => {
    const formattedTournament = { ...tournament._doc, id: tournament._id }
    delete formattedTournament._id
    delete formattedTournament.__v
    return formattedTournament
}

const Tournament = mongoose.model('Tournament', tournamentSchema)

module.exports = Tournament

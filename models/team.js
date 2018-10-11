const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const teamSchema = new mongoose.Schema({
    name: String,
    shortHand: String,
    logo: String,
    description: String,
    gamerName: String,
    apiId: Number,
    slug: { type: String, lowercase: true, unique: true },
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]
})

teamSchema.plugin(uniqueValidator, { message: 'is already taken' })

teamSchema.statics.format = (team) => {
    const formattedTeam = { ...team._doc, id: team._id }
    delete formattedTeam._id
    delete formattedTeam.__v
    return formattedTeam
}

const Team = mongoose.model('Team', teamSchema)

module.exports = Team

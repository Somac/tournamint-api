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

teamSchema.statics.format = (user) => {
    const formattedUser = { ...user._doc, id: user._id }
    delete formattedUser._id
    delete formattedUser.__v
    delete formattedUser.passwordHash
    return formattedUser
}

const Team = mongoose.model('Team', teamSchema)

module.exports = Team

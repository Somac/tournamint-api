const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug = require('slug')

const tournamentSchema = new mongoose.Schema({
    slug: { type: String, lowercase: true, unique: true },
    name: String,
    description: String,
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

tournamentSchema.plugin(uniqueValidator, { message: 'is already taken' })

tournamentSchema.pre('validate', (next) => {
    next()
})

tournamentSchema.methods.slugify = () => {
    this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

tournamentSchema.statics.format = (tournament) => {
    const formattedTournament = { ...tournament._doc, id: tournament._id }
    delete formattedTournament._id
    delete formattedTournament.__v
    return formattedTournament
}

const Tournament = mongoose.model('Tournament', tournamentSchema)

module.exports = Tournament
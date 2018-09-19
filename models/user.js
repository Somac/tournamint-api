const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }]
}, { timestamps: true })

userSchema.statics.format = (user) => {
    const formattedUser = { ...user._doc, id: user._id }
    delete formattedUser._id
    delete formattedUser.__v
    delete formattedUser.passwordHash
    return formattedUser
}

const User = mongoose.model('User', userSchema)

module.exports = User
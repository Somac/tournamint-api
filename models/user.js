const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }]
})

userSchema.statics.format = (user) => {
    const formattedUser = { ...user._doc, id: user._id }
    delete formattedUser._id
    delete formattedUser.__v
    return formattedUser
}

const User = mongoose.model('user', userSchema)

module.exports = User
const mongoose = require('mongoose')

const leagueSchema = new mongoose.Schema({
  name: String,
  apiUrlTeams: String,
  apiUrlPlayers: String,
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' }
})

const League = mongoose.model('League', leagueSchema)

module.exports = League

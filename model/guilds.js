const mongoose = require('mongoose')

const guildSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    founder: {
        type: String,
        required: true
    },
    members: {},
    wins: 0,
    losses: 0
})

module.exports = mongoose.model('Guild', guildSchema)
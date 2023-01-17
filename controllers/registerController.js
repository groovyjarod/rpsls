const player = require('../model/players')
const bcrypt = require('bcrypt')

const handleNewUser = async (req, res) => {
    const { user, email, pswd } = req.body
    if (!user || !email || !pswd) return res.status(400).json({ 'message': 'Username, Email, and Password are required.'})

    const duplicate = await player.findOne({ username: user }).exec()
    if (duplicate) return res.status(409)

    try {
        const hashPswd = await bcrypt.hash(pswd, 10)

        const result = await player.create({
            "username": user,
            "email": email,
            "password": hashPswd,
            wins: 0,
            losses: 0,
            guild: '',
            playerStatus: 'player'
        })
        console.log(result)

        res.status(201).json({ 'success': `New user created!`})
    } catch (err) { res.status(500).json({ 'message': err.message }) }
}
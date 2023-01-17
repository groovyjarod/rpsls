require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const socket = require('socket.io')
const nm = require('nodemailer')
const jwt = require('jsonwebtoken')
const _ = require('underscore')

const mongoose = require('mongoose')
const Player = require('./model/players')
const EMAIL_SECRET = 'asdfjkl;'

const app = express()
const server = http.createServer(app)
const io = socket(server)
let users = []

let roomPlayers = [[[], []], [[], []], [[], []], [[], []], [[], []], [[], []], [[], []], [[], []]]
let roomDecisions = [[], [], [], [], [], [], [], []]
const phrases = {
    ScissorsbeatsPaper: 'Scissors cut paper!',
    ScissorsbeatsLizard: 'Scissors decapitates Lizard!',
    PaperbeatsRock: 'Paper covers Rock!',
    PaperbeatsSpock: 'Paper disproves Spock!',
    RockbeatsScissors: 'Rock crushes the scissors!',
    RockbeatsLizard: 'Rock crushes Lizard!',
    LizardbeatsPaper: 'Lizard eats Paper!',
    LizardbeatsSpock: 'Lizard poisons Spock!',
    SpockbeatsRock: 'Spock vaporizes Rock!',
    SpockbeatsScissors: 'Spock smashes Scissors!'
}
const commands = {
    0: 'Spock',
    1: 'Rock',
    2: 'Paper',
    4: 'Lizard',
    8: 'Spock'
}

// give username to stream
function loadText(data, username) {
    for (let i = 0; i < username.length; i++) data.push(username.charCodeAt(i))
    data.push(1)
}


function createNewStream(data) {
    // creation of dataStream
    let newStream = new ArrayBuffer(data.length)
    let dv = new DataView(newStream)
    for (let i = 0; i < data.length; i++) {
        dv.setUint8(i, data[i])
    }
    return newStream
}

// mongoose.connect('mongodb://localhost:27017/test')
mongoose.connect('mongodb+srv://jarodday:something11@rpsls.qbleu6i.mongodb.net/?retryWrites=true&w=majority', () => console.log('Connected to MongoDB.'))


// set static folder
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
    res.send('hello world!')
})

// handle the URL given through email to verify user
app.get('/confirm/:token', async (req, res) => {
    try {
        const { player: { id } } = jwt.verify(req.params.token, EMAIL_SECRET)
        await models.User.update({ status: 'Active' }, { where: { id } })
    } catch (e) {
        res.send('error')
    }
})

io.on('connection', socket => {

    socket.on('close', () => console.log('player disconnected.'))


    // emissions for CRUD functionality relating to user database

    socket.on('getAllUsers', async () => {
        try {
            const players = await Player.find({ guild: "" })
            socket.emit('getAllUsers', players)
        } catch (e) { console.log(`getAllUsers message: ${e.message}`) }
    })

    socket.on('createAccount', async content => {
        try {

            let info = [[], [], []] // ASCII values for username, email, and password will go here
            let check = 0
            let data = new Uint8Array(content)
            data.forEach(dataByte => {
                if (dataByte == 1) check++
                else info[check].push(dataByte)
            })

            let dc = new TextDecoder()
            let username = dc.decode(new Uint8Array([...info[0]]))
            let email = dc.decode(new Uint8Array([...info[1]]))
            let password = dc.decode(new Uint8Array([...info[2]]))
            
            // handle creation of account through email
            const player = await Player.create({
                username: username,
                email: email,
                password: password,
                status: 'Pending',
                wins: 0,
                losses: 0,
                guild: ''
            })
            
            let mailOptions = (token) => {
                return {
                    from: "jarodd99@gmail.com",
                    to: email,
                    subject: `Verification for ${username}`,
                    html: `<h1>Email Confirmation</h1>
                    <h2>Hello ${username},</h2>
                    <p>Thank you for signing up for RPSLS. Please confirm your email by clicking on the following link:</p>
                    <a href='${token}'>Click here</a>
                    </div>`
                }
            }

            const transport = nm.createTransport({
                service: "Gmail",
                auth: {
                    user: 'jarodd99@gmail.com',
                    pass: 'bloilcmthsjecuui'
                }
            })
            
            jwt.sign(
                {player: _.pick(player, 'id')},
                EMAIL_SECRET,
                {expiresIn: '1d'},
                (error, emailToken) => {
                    const url = `http://localhost:8000/confirm/${emailToken}`
                    console.log('email readying:')
                    transport.sendMail(mailOptions(url), function (err) {
                        if (err) console.log(err)
                        else console.log('Email sent successfully.')
                    })
                    console.log('email sent.')
                }
            )
        } catch (e) { console.log(`createAccount Message: ${e.message}`) }
    })

    socket.on('findAccount', async (playerName, isSecondPlayer) => {
        try {
            const player = await Player.find({ username: playerName })
            if (!player) return
            isSecondPlayer == true ? socket.emit('foundAccount', player, true) : socket.emit('foundAccount', player, false)
        } catch (e) { console.log(`Message: ${e.message}`) }
    })

    // socket emissions relating to menus

    socket.on('login', async content => {
        try {
            let info = [[], []]
            let check = 0
            let data = new Uint8Array(content)
            data.forEach(dataByte => {
                if (dataByte == 1) check++
                else info[check].push(dataByte)
            })
            let dc = new TextDecoder()
            let username = dc.decode(new Uint8Array([...info[0]]))
            let password = dc.decode(new Uint8Array([...info[1]]))

            const _player = await Player.find({ username: username })
            if (!_player) socket.emit('loginFail', false)
            let player = _player[0]
            if (password == player.password) socket.emit('loginSuccess', player)
            else {
                socket.emit('loginFail', true)
            }
        } catch (e) { console.log(`Login Message: ${e.message}`) }
    })

    // socket emissions relating to game

    socket.on('joinRoom', roomNumber => {
        try {
            socket.join(`room${roomNumber}`)
            console.log(`User joined room ${roomNumber}`)
        } catch (e) { console.log(`joinRoom message: ${e.message}`) }
    })

    socket.on('leaveRoom', roomNumber => {
        try {
            socket.leave(`room${roomNumber}`)
            console.log(`User left room ${roomNumber}`)
        } catch (e) { console.log(`leaveRoom Message: ${e.message}`) }
    })

    socket.on('sendMessage', async content => {
        try {
            // check for whether this is a player's or a spectator's by how many zeros there are
            let info = [[], [], [], [], []]    // possible content
            let zeroesCount = 0
            let data = new Uint8Array(content)

            data.forEach(dataByte => {
                if (dataByte == 1) zeroesCount++
                else info[zeroesCount].push(dataByte)
                // else console.log(dataByte)
            })
            let dc = new TextDecoder()

            let room = dc.decode(new Uint8Array([...info[0]]))
            let id = dc.decode(new Uint8Array([...info[1]]))
            let username = dc.decode(new Uint8Array([...info[2]]))
            let message = dc.decode(new Uint8Array([...info[3]]))
            let move = dc.decode(new Uint8Array([...info[4]]))

            // populate board with a move made
            if (move) {
                roomDecisions[room - 1].push({ username: username, move: move })
                if (roomDecisions[room - 1].length == 2) {
                    let winningPhrase = []
                    let player1 = roomDecisions[room - 1][0]
                    let player2 = roomDecisions[room - 1][1]
                    let player1Update = await Player.findOne({ username: player1.username })
                    let player2Update = await Player.findOne({ username: player2.username })
                    if (phrases.hasOwnProperty(`${commands[player1.move]}beats${commands[player2.move]}`)) {        // player 1 wins
                        await Player.updateOne({ username: `${player1.username}` }, { wins: player1Update.wins + 1 })
                        await Player.updateOne({ username: `${player2.username}` }, { losses: player2Update.losses + 1 }) // update player 2's losses

                        loadText(winningPhrase, phrases[`${commands[player1.move]}beats${commands[player2.move]}`])
                        loadText(winningPhrase, `<br>${player1.username} wins!`)

                        console.log('Player 1 wins!')
                    }
                    else if (phrases.hasOwnProperty(`${commands[player2.move]}beats${commands[player1.move]}`)) {       // player 2 wins
                        await Player.updateOne({ username: `${player2.username}` }, { wins: player2Update.wins + 1 })     // update player 2's wins
                        await Player.updateOne({ username: `${player1.username}` }, { losses: player1Update.losses + 1 }) // update player 1's losses
                        loadText(winningPhrase, phrases[`${commands[player2.move]}beats${commands[player1.move]}`])
                        loadText(winningPhrase, `<br>${player2.username} wins!`)
                        console.log('Player 2 wins!')
                    }
                    else {
                        loadText(winningPhrase, `It's a tie! ${commands[player1.move]} cannot beat ${commands[player2.move]}!`)
                        loadText(winningPhrase, '<br>Please play again.')
                    }

                    let verdictStream = createNewStream(winningPhrase)
                    io.to(`room${room}`).emit('verdict', verdictStream)
                }
            }

            console.log(roomDecisions[room - 1])
            // console.log(content)
            io.to(`room${room}`).emit('newMessage', content)

        } catch (e) { console.log(`sendMessage message: ${e.message}`) }
    })

    socket.on('checkPlayers', roomNumber => {
        let room = parseInt(roomNumber)
        try {
            if (roomPlayers[room - 1][0].length == 0 && roomPlayers[room - 1][1].length == 0) {
                socket.emit('checkPlayersReturn', room, 0, 0)
                console.log(`No players detected in Room ${room}. Giving default UI options to user`)
            } else {
                io.emit('checkRoom', roomNumber)
            }
        } catch (e) {
            console.log(`Check Players Message: ${e.message}`)
        }
    })

    socket.on('getUsers', roomNumber => {
        // console.log('users fetched.')
        let room = parseInt(roomNumber)
        try { io.to(`room${roomNumber}`).emit('getUsers', roomPlayers[room - 1][0], roomPlayers[room - 1][1]) }
        catch (e) { console.log(`getUsers message: ${e.message}`) }
    })

    socket.on('getExistingGameData', roomNumber => {
        let data = []
        let roomData = roomDecisions[roomNumber - 1]
        console.log(roomData)
        if (roomData.length == 1) loadText(data, roomData[0].username)
        if (roomData.length == 2) loadText(data, roomData[1].username)
        let stream = createNewStream(data)
        try { socket.emit('getExistingGameData', stream) }
        catch (e) { console.log(`getExistingGameData message: ${e.message}`) }
    })

    socket.on('eraseData', content => {     // COMPLETE, WORK ON VERDICT NEXT (after 2 decisions are populated)
        try {
            // unload data and assign to variables
            let data = [[], [], []]
            let isUsername = 0
            content.forEach(dataByte => {
                if (dataByte == 1) isUsername++
                else data[isUsername].push(dataByte)
            })
            let dc = new TextDecoder()

            let room = dc.decode(new Uint8Array([...data[0]]))
            let username = dc.decode(new Uint8Array([...data[1]]))
            console.log(roomDecisions[room - 1])

            // only look through if moves already exist within box
            if (roomDecisions[room - 1]) {
                // iterate through all moves
                for (let i = 0; i < roomDecisions[room - 1].length; i++) {
                    if (roomDecisions[room - 1][i].username == username) {
                        roomDecisions[room - 1].splice(i, 1)
                    }
                }
            }
            console.log(roomDecisions[room - 1])

        } catch (e) { console.log(`eraseData message: ${e.message}`) }
    })

    socket.on('declareWinner', (roomNumber) => {
        try {
            io.to(`room${roomNumber}`).emit('declareWinner', roomDecisions[roomNumber - 1])
        } catch (e) { console.log(`declareWinner message: ${e.message}`) }
    })

    socket.on('getPlayerNumbers', roomNumber => {
        let room = parseInt(roomNumber)
        try {
            io.emit('checkPlayersReturn', room, roomPlayers[room - 1][0].length, roomPlayers[room - 1][1].length)
            console.log(`checkPlayersReturn sent to ${roomNumber}`)
        } catch (e) {
            console.log(`getPlayerNumbers message: ${e.message}`)
        }
    })

    // sockets pertaining to game rooms, which use data lookup tables and receive/send data arrays

    socket.on('updatePlayerNumber', content => {
        let info = [[], [], []] // room number, username, status (int)
        // let room = parseInt(roomNumber)
        let removeName
        let count = 0
        let data = new Uint8Array(content)
        data.forEach(dataByte => {
            if (dataByte == 1) count++
            else info[count].push(dataByte)
        })

        let dc = new TextDecoder()
        let room = dc.decode(new Uint8Array([...info[0]]))
        let username = dc.decode(new Uint8Array([...info[1]]))
        let status = dc.decode(new Uint8Array([...info[2]]))

        console.log(room)
        console.log(username)
        console.log(`Status: ${status}`)
        try {
            switch (status) {
                case 'playJ':   // new player
                    console.log('new player!')
                    roomPlayers[room - 1][0].push(username)
                    break
                case 'playL': // player leave
                    removeName = roomPlayers[room - 1][0].indexOf(username)
                    if (removeName > -1) roomPlayers[room - 1][0].splice(removeName, 1)
                    io.emit('getUsers', roomPlayers[room - 1][0], roomPlayers[room - 1][1])
                    break
                case 'specJ': // new spectator
                    roomPlayers[room - 1][1].push(username)
                    break
                case 'specL': // spectator leave
                    removeName = roomPlayers[room - 1][1].indexOf(username)
                    if (removeName > -1) roomPlayers[room - 1][1].splice(removeName, 1)
                    io.emit('getUsers', roomPlayers[room - 1][0], roomPlayers[room - 1][1])
                    break
            }
            console.log(`Room ${room}: Players: ${roomPlayers[room - 1][0]}, spectators: ${roomPlayers[room - 1][1]}`)
        } catch (e) {
            console.log(`updatePlayerNumber message: ${e.message}`)
        }
    })
})
const PORT = 8000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
let socket = io()

// getters

let allButtons = document.getElementsByName('rpslsDecision')
let goBackBtn = document.getElementById('goBack')
let messages = document.getElementById('messages')
let commandContent = document.getElementById('commandContent')
let makeMoveBtn = document.getElementById('makeMove')
let commandBanner = document.getElementById('commandBanner')
let playerNumber = document.getElementById('playerNumber')
let playerNumbers = document.getElementById('playerNumbers')
let spectators = document.getElementById('spectators')
let commandController = document.getElementById('commandController')
let chatbox = document.getElementById('chatbox')
let player1Name = document.getElementById('player1Name')
let player2Name = document.getElementById('player2Name')
let player1Decision = document.getElementById('player1Decision')
let player2Decision = document.getElementById('player2Decision')
let player1Wins = document.getElementById('player1Wins')
let player2Wins = document.getElementById('player2Wins')
let player1Losses = document.getElementById('player1Losses')
let player2Losses = document.getElementById('player2Losses')
let emojis = document.getElementById('emojis')

// constants used throughout code
const roomNumber = parseInt(document.getElementById('roomNumber').innerHTML)
const isPlayer = sessionStorage.getItem('playerStatus') // Boolean indicating whether user is player
const user = JSON.parse(sessionStorage.getItem('user')) // user data that will be sent



// DOM functions

function loadRoomNumber(data) {
    data.push(`${roomNumber}`.charCodeAt(0))
    data.push(1)
}

// give username to stream
function loadUsername(data) {
    for (let i = 0; i < user.username.length; i++) data.push(user.username.charCodeAt(i))
    data.push(1)
}

// give username to stream
function loadId(data) {
    for (let i = 0; i < user.username.length; i++) data.push(user.username.charCodeAt(i))
    data.push(1)
}

function loadMessage(data, message) {
    if (!message) {
        data.push(1)
        return
    }
    // give text to stream, reset text box
    for (let i = 0; i < message.length; i++) {
        data.push(message.charCodeAt(i))
        console.log(message.charCodeAt(i))
    }
    message = ''
    data.push(1)
}

function loadPlayerStatus(data) {
    data.push(isPlayer == 'player' ? `${1}`.charCodeAt(0) : `${0}`.charCodeAt(0))
}

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

function wait(time) { return new Promise(res => setTimeout(res, time)) }    // stop time

function getCommandType(_number) {
    // get nearest multiple of 16
    let number = _number
    while (number % 16 > 0) {
        number--
    }
    return number
}

function outputCommand(message) {
    let item = document.createElement('li')
    if (emojis.value) {
        item.textContent = String.fromCodePoint(emojis.value)
        messages.appendChild(item)
        emojis.value = ""
    } else if (message.startsWith('command:')) {
        let decision = message.split(':').pop()
        // otherPlayerStatus.innerHTML = "Ready"
        item.textContent = decision
        messages.appendChild(item)
        console.log(decision)
    } else {
        let decision = 'text'
        item.textContent = `Player ${playerNumber.innerHTML}: ${message}`
        messages.appendChild(item)
        window.scrollTo(0, document.body.scrollHeight)
    }
    input.value = ''
}



// tables

const binaryValues = {
    'Rock': 1,
    'Paper': 2,
    'Scissors': 4,
    'Lizard': 8,
    'Spock': 0
}

const movesTable = {
    0: 'Spock',
    1: 'Rock',
    2: 'Paper',
    4: 'Scissors',
    8: 'Lizard'
}

const commandsTable = {
    0: (num) => movesTable[num],
    16: (num) => { },
    32: (num) => { },
    48: (num) => { },
    64: (num) => { },
    80: (num) => { },
    96: (num) => { },
}

const moreTable = number => number - 128 >= 0 ? true : false

// button commands

goBackBtn.addEventListener('click', () => {
    // go back to lobby, properly disconnect from room
    let data = []
    loadRoomNumber(data)
    loadUsername(data)
    isPlayer == 'Player' ? loadText(data, 'playL') : loadText(data, 'specL')
    let dataStream = createNewStream(data)
    
    if (isPlayer == 'Player') socket.emit('eraseData', dataStream)
    socket.emit('updatePlayerNumber', dataStream)
    socket.emit('leaveRoom', roomNumber)
    wait(200).then(() => document.location = '../lobby.html')
})

makeMoveBtn.addEventListener('click', () => {
    // get move data if move was made by identifying selected button
    let binaryData
    let data = []
    let decisionValue

    // get button value
    for (let button of allButtons) {
        if (button.checked) decisionValue = button.value
    }

    // prevent empty messages and moves from being sent
    if (decisionValue == undefined && commandContent.value == '') {
        if (isPlayer == 'Player') alert('Please type a message or select a command before pressing send.')
        else {
            alert('Please type a message before pressing send.')
            return
        }
    }

    // push data into stream
    loadRoomNumber(data)
    loadId(data)
    loadUsername(data)
    commandContent.value != '' ? loadMessage(data, commandContent.value) : loadMessage(data, false)

    // give move to stream if player
    if (decisionValue) {
        data.push(`${binaryValues[decisionValue]}`.charCodeAt(0))
        for (let button of allButtons) button.disabled = true
    }

    // deselect all selected moves
    let radio = document.querySelector('input[type=radio]:checked')
    if (radio) radio.checked = false

    let dataStream = createNewStream(data)
    commandContent.value = ''
    console.log(dataStream)
    socket.emit('sendMessage', dataStream)
})



// socket functions

socket.on('checkRoom', (roomNumber) => {
    socket.emit('getPlayerNumbers', roomNumber)
})

socket.on('newMessage', (content) => {
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
        let username = dc.decode(new Uint8Array([...info[2]]))
        let message = dc.decode(new Uint8Array([...info[3]]))
        let move = dc.decode(new Uint8Array([...info[4]]))

        // update UI
        // indicate player has made their decision
        if (move) player1Name.innerHTML == username ? player1Decision.innerHTML = 'Player 1 has made their decision.' : player2Decision.innerHTML = 'Player 2 has made their decision.'

        // display text in chat box
        if (message) chatbox.innerHTML += `${username}: ${message}<br>`
    } catch (e) { console.log(`sendMessage message: ${e.message}`) }
})

socket.on('getUsers', (totalPlayers, totalSpecs) => {

    // clear all spectator and user UI data in preparation for rerendering
    let clearDivs = [spectators, player1Name, player2Name, player1Wins, player2Wins, player1Losses, player2Losses]
    for (div of clearDivs) div.innerHTML = ''

    // recreate spectators banner
    let p = document.createElement('p')
    p.setAttribute('class', 'text-xl h-16')
    p.innerText = 'Spectators'
    spectators.appendChild(p)

    // update spectators banner to include all spectators
    for (let spec of totalSpecs) {
        let newSpec = document.createElement('span')
        newSpec.setAttribute('class', 'flex flex-col p-2')
        newSpec.innerText = spec
        spectators.appendChild(newSpec)
    }

    // render player section based on how many players are in room
    if (totalPlayers.length == 1) {
        socket.emit('findAccount', totalPlayers[0], false)
        player2Name.innerHTML = 'Waiting for Player 2...'
        player2Decision.innerHTML = ''
    } else if (totalPlayers.length == 2) {
        socket.emit('findAccount', totalPlayers[0], false)
        socket.emit('findAccount', totalPlayers[1], true)
    } else if (totalPlayers.length == 0) {
        player1Name.innerHTML = 'Waiting for Player 1...'
        player2Name.innerHTML = 'Waiting for Player 2...'
        player1Decision.innerHTML = ''
        player2Decision.innerHTML = ''
    }
})

socket.on('getExistingGameData', data => {
    console.log('Existing data:')
    console.log(data)   // TODO: finish this
    // if (data.length == 2) {
    //     player1Decision.innerHTML = 'Player 1 has already made their decision...'
    //     player2Decision.innerHTML = 'Player 2 has already made their decision...'
    // }
    // else if (data.length == 1) {
    //     if (data[0].username == player2Name.innerHTML) player2Decision.innerHTML = 'Player 2 has already made their decision...'
    //     else player1Decision.innerHTML = 'Player 1 has already made their decision...'
    // }
    // else chatbox.innerHTML += 'Welcome! Players are still making their decisions.<br>'
})

socket.on('foundAccount', (player, isSecondplayer) => {
    let playerData = player[0]

    // render data if two players
    if (isSecondplayer) {
        player2Name.innerHTML = playerData.username
        player2Wins.innerHTML = `${playerData.wins} wins`
        player2Losses.innerHTML = `${playerData.losses} losses`

        // render data if only one player
    } else {
        player1Name.innerHTML = playerData.username
        player1Wins.innerHTML = `${playerData.wins} wins`
        player1Losses.innerHTML = `${playerData.losses} losses`
    }
})

socket.on('verdict', content => {
    try {
        console.log(content)
        // trigger after both players have made their decisions
        player1Decision.innerHTML = 'Calculating who won:'
        player2Decision.innerHTML = 'Calculating who won:'
    
        wait(1200).then(() => {
            player1Decision.innerHTML = 'Rock,'
            player2Decision.innerHTML = 'Rock,'
        })
    
        wait(1600).then(() => {
            player1Decision.innerHTML = 'Paper...'
            player2Decision.innerHTML = 'Paper...'
        })
    
        wait(2400).then(() => {
            let phrases = [[], []]
            let data = new Uint8Array(content)
            let count = 0;
            let dc = new TextDecoder()
            data.forEach(dataByte => {
                if (dataByte == 1) count++
                else phrases[count].push(dataByte)
            })
            let phrase1 = dc.decode(new Uint8Array([...phrases[0]]))
            let phrase2 = dc.decode(new Uint8Array([...phrases[1]]))
        
            player1Decision.innerHTML = `${phrase1}.<br>${phrase2}`
            player2Decision.innerHTML = `${phrase1}.<br>${phrase2}`
        })

    } catch (e) { alert(e.message) }
    console.log(content)
})

socket.on('declareWinner', (content) => {
    console.log(content)
})



// if player returns to lobby, update their status and have them leave the room
window.onbeforeunload = () => {
    // go back to lobby, properly disconnect from room
    if (isPlayer == 'Player') {
        if (player1Name == user.username) player1Decision.innerHTML = ''
        else player2Decision.innerHTML = ''
    }
    let data = []
    loadRoomNumber(data)
    loadUsername(data)
    isPlayer == 'Player' ? loadText(data, 'playL') : loadText(data, 'specL')
    let dataStream = createNewStream(data)
    
    if (isPlayer == 'Player') socket.emit('eraseData', dataStream)
    socket.emit('updatePlayerNumber', dataStream)
    socket.emit('leaveRoom', roomNumber)
    wait(200).then(() => document.location = '../lobby.html')
}



// render page on load, different for players vs spectators
window.onload = () => {

    // update database to include user in their respective role, join the room,
    // then get all users in room while also getting current game data
    let data = []
    loadRoomNumber(data)
    loadUsername(data)
    isPlayer == 'Player' ? loadText(data, 'playJ') : loadText(data, 'specJ')
    let dataStream = createNewStream(data)
    console.log(dataStream)
    socket.emit('joinRoom', roomNumber)
    socket.emit('updatePlayerNumber', dataStream)
    socket.emit('getUsers', roomNumber)
    socket.emit('getExistingGameData', roomNumber)

    // render player controller if user is a player, otherwise only load the text box
    if (isPlayer == 'Player') {
        let commands = ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']
        for (let command of commands) {
            let newBtn = document.createElement('input')
            newBtn.setAttribute('value', `${command}`)
            newBtn.setAttribute('id', `${command}`)
            newBtn.setAttribute('type', 'radio')
            newBtn.setAttribute('name', 'rpslsDecision')

            let newLabel = document.createElement('label')
            newLabel.setAttribute('for', `${command}`)
            newLabel.innerHTML = command
            commandController.appendChild(newBtn)
            commandController.appendChild(newLabel)
        }
        commandContent.placeholder = 'Write a command...'
        let commandBannerMsg = document.createTextNode('Player Commands')
        commandBanner.appendChild(commandBannerMsg)
        player1Name.innerText == '' ? socket.emit('loadPlayer1', user.username, roomNumber) : socket.emit('loadPlayer2', user.username, roomNumber)
    } else {
        commandContent.placeholder = 'Write a message...'
        let commandBannerMsg = document.createTextNode('Spectator')
        commandBanner.appendChild(commandBannerMsg)
    }
}

document.getElementById('voice').addEventListener('click', () => {
    let speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript);

        commandContent.value = transcript;
    });

    if (speech) {
        recognition.start();
    }
})


let wins = document.getElementById('wins')
let losses = document.getElementById('losses')
let lobbyName = document.getElementById('lobbyName')
let createBtn = document.getElementById('createGame')
let joinBtn = document.getElementById('joinGame')
let viewBtn = document.getElementById('viewLeaderboards')
let logoutBtn = document.getElementById('logout')
let content = document.getElementById('content')
let opponentNameInvite = document.getElementById('opponentNameInvite')
let rooms = document.getElementById('rooms')
let close = document.getElementsByClassName('close')[0]

let createGameModal = document.getElementById('createGameModal')
let span = document.getElementsByClassName('close')[0]

let socket = io()
let user
if (sessionStorage.getItem('user')) user = JSON.parse(sessionStorage.getItem('user'))

function loadText(data, text) {
    for (let i = 0; i < text.length; i++) data.push(text.charCodeAt(i))
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

// socket events

socket.emit('getAllUsers')

socket.on('getAllUsers', players => {
    for (let player of players) {
        // populate lobby with account's stats
        if (player.username == user.username) {
            lobbyName.innerHTML = `${player.username}'s `
            wins.innerHTML = `${player.wins} wins`
            losses.innerHTML = `${player.losses} losses`
        }

        let newUser = document.createElement('tr')
        let newName = document.createElement('td')
        let newWins = document.createElement('td')
        let newLosses = document.createElement('td')

        newName.innerHTML = player.username
        newWins.innerHTML = player.wins
        newLosses.innerHTML = player.losses

        newUser.appendChild(newName)
        newUser.appendChild(newWins)
        newUser.appendChild(newLosses)

        leaderboards.appendChild(newUser)
    }
})

socket.on('checkPlayersReturn', (roomNumber, players, spectators) => {
    let room = document.getElementById(`room${roomNumber}`)
    room.innerHTML = ''
    let div1 = document.createElement('div')
    let div2 = document.createElement('div')
    div1.setAttribute('class', 'flex flex-row')
    div2.setAttribute('class', 'mt-3 flex flex-row')

    let totalPlayers = document.createElement('p')
    let totalSpectators = document.createElement('p')
    totalPlayers.innerText = `${players} Players`
    totalSpectators.innerText = `${spectators} Spectators`
    totalPlayers.setAttribute('class', 'text-xl mx-2')
    totalSpectators.setAttribute('class', 'text-xl mx-2')
    
    let playerBtn = document.createElement('button')
    let SpectatorBtn = document.createElement('button')
    playerBtn.setAttribute('class', 'border-2 border-black rounded bg-gray-500 mx-2 p-1')
    SpectatorBtn.setAttribute('class', 'border-2 border-black rounded bg-gray-500 mx-2 p-1')
    playerBtn.innerText = 'Player'
    SpectatorBtn.innerText = 'Spectator'

    playerBtn.addEventListener('click', () => {
        if (sessionStorage.getItem('playerStatus')) sessionStorage.removeItem('playerStatus')
        sessionStorage.setItem('playerStatus', 'Player')
        document.location = `rooms/room${roomNumber}.html`
    })

    SpectatorBtn.addEventListener('click', () => {
        if (sessionStorage.getItem('playerStatus')) sessionStorage.removeItem('playerStatus')
        sessionStorage.setItem('playerStatus', 'Spectator')
        document.location = `rooms/room${roomNumber}.html`
    })
    
    div1.appendChild(totalPlayers)
    div1.appendChild(totalSpectators)
    if (players < 2) div2.appendChild(playerBtn)
    div2.appendChild(SpectatorBtn)

    room.appendChild(div1)
    room.appendChild(div2)
})

// socket.on('loginSuccess')

// load UI

if (!user) {
    content.innerHTML = ''
    let h1 = document.createElement('h1')
    let p = document.createElement('p')

    let h1text = document.createTextNode('Unauthorized login')
    let ptext = document.createTextNode('Go to login page and log in before accessing this page.')

    h1.appendChild(h1text)
    p.appendChild(ptext)
    content.appendChild(h1)
    content.appendChild(p)
}


createBtn.addEventListener('click', () => {
    createGameModal.style.display = 'block'
})

logoutBtn.addEventListener('click', () => {
    sessionStorage.clear()
    document.location = './index.html'
})

close.addEventListener('click', () => {
    createGameModal.style.display = 'none'
})

window.onclick = (e) => {
    if (e.target == createGameModal) createGameModal.style.display = 'none'
}

window.onload = () => {
    // TODO: send a request to the server to load wins/losses on account
    // user = JSON.parse(sessionStorage.getItem('user'))
    let data = []
    loadText(data, user.username)
    loadText(data, user.password)    
    let content = createNewStream(data)
    if (user) socket.emit('login', content)
    for (let i = 1; i < 9; i++) {
        let a = document.createElement('div')
        a.setAttribute('class', 'border-2 border-black rounded h-32 w-56 flex flex-col justify-center items-center bg-green-400')
        a.setAttribute('id', `room${i}`)
        a.addEventListener('click', () => {
            socket.emit('checkPlayers', i)
        })
        let b = document.createTextNode(`Room ${i}`)
        a.appendChild(b)
        rooms.appendChild(a)
    }
}
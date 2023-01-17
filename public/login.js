let login = document.getElementById('login')
let socket = io()

socket.on('loginFail', hasUsername => {
    if (!document.getElementById('loginFail')) {
        let loginMessage
        if (hasUsername) loginMessage = document.createTextNode("Invalid username or Password. Please try again.")
        else loginMessage = document.createTextNode("Please enter a valid username.")

        let loginFail = document.createElement('span')
        loginFail.setAttribute('id', 'loginFail')
        loginFail.appendChild(loginMessage)
        loginFail.setAttribute('class', 'border-red-500 border-2 rounded m-8 w-12')

        document.getElementById('notification').appendChild(loginFail)
    }
})

socket.on('loginSuccess', player => {
    // alert(JSON.stringify(player))
    sessionStorage.setItem('user', JSON.stringify(player))
    document.location = './lobby.html'
})


window.addEventListener('unload', () => {
    socket.emit('close')
    console.log('closed')
})
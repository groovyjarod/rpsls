let username = document.getElementById('username')
let email = document.getElementById('email')
let password = document.getElementById('password')
let submitBtn = document.getElementById('submitBtn')
let confirmation = document.getElementById('confirmation')
let signUpContent = document.getElementById('signUpContent')
let verificationCode = Math.floor(1000 + Math.random() * 9000)
signupForm.addEventListener('submit', function () {
    if (username.value == '' || email.value == '' || password.value == '') {
        alert('One or more of the fields is empty. Please try again.')
        return
    }
    
    try {
        signUpContent.style.display = 'hidden'
        let newLabel = document.createElement('label')
        let newInput = document.createElement('input')
        let newButton = document.createElement('button')

        newLabel.setAttribute('class', 'block')
        newLabel.setAttribute('for', 'confirmation')
        newLabel.innerHTML = "Confirmation Number:"
        newInput.setAttribute('name', 'confirmation')
        newInput.setAttribute('class', 'block border-gray-400 border-2 rounded')
        newButton.setAttribute('class', 'bg-white border-black border-2 rounded-xl w-32')
        newButton.setAttribute('id', 'confirmationSubmit')
        newButton.innerHTML = 'Submit'

        confirmation.appendChild(newLabel)
        confirmation.appendChild(newInput)
        confirmation.appendChild(newButton)

    } catch (e) { console.log(`Message: ${e.message}`) }
})
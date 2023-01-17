const nm = require('nodemailer')
const appPassword = 'bloilcmthsjecuui'
async function main() {
    let test = await nm.createTestAccount()
    let transport = nm.createTransport({
        service: "gmail",
        auth: {
            user: "jarodd99@gmail.com",
            pass: "bloilcmthsjecuui"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    let mailOptions = {
        from: "jarodd99@gmail.com",
        to: "10940701@my.uvu.edu",
        subject: "Testing",
        text: ``
    }

    transport.sendMail(mailOptions, function(err, success) {
        if (err) console.log(err)
        else console.log('email sent successfully!')
    })

    // transport.verify((err, succ) => {
    //     if (err) console.log(err)
    //     else console.log('Server is ready to take our message!')
    // })

    // let info = await transport.sendMail({
    //     from: '"Jarod Day" <10940701@my.uvu.edu>',
    //     to: "jarodd99@gmail.com",
    //     subjet: "BIG CHEESE",
    //     text: "AYO DAWG I HEARD YOU LIKE CHEESE THAT AIN'T SMALL",
    //     html: "BIGGER CHEESE"
    // })

    // console.log(`Message sent: ${info.messageId}`)
    // console.log(`Preview URL: ${nm.getTestMessageUrl(info)}`)
}

main().catch(console.error)
class Player {
    constructor(username, email, password, wins=0, losses=0, guild='', playerStatus='Player') {
        this.username = username
        this.email = email
        this.password = password
        this.wins = wins
        this.losses = losses
        this.playerStatus = playerStatus    // player, spectator
        this.guild = guild
    }

    win = () => { 
        this.wins++
        if (this.wins == 1) {
            /*
            introduce to guilds
            give option to either create new guild,
            join an existing guild that's accepting members,
            or continue playing solo
             */
            alert('your first win! Congrats')
        }

        // if (this.guild) {
        //     let playerGuild = this.guild    // grab the existing guild
        //     playerGuild.totalWins++
        //     playerGuild.ratio = `${this.totalWins}/${this.totalLosses}`
        // }
    }

    lose = () => {
        this.losses++
        // if (this.guild) {
        //     let playerGuild = this.guild
        //     playerGuild.totalLosses++
        //     playerGuild.ratio = `${this.totalWins}/${this.totalLosses}`
        // }
    }

    makeDecision = (moreCommands, commandType, decision) => {
        // if (!playerStatus) {
        //     alert('Only for players.')
        //     return 0
        // }
        return `${moreCommands}${commandType}${decision}`
    }

    createText = (textLength) => {

    }

    createVoice = () => {

    }

    createEmoticon = () => {

    }
}
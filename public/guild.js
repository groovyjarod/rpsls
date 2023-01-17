export default class Guild {
    constructor(name, creator) {
        this.name = name
        this.creator = creator
        this.pushItem(this.creator)
    }
    totalWins = 0
    totalLosses = 0
    ratio = ''

    members = {}

    pushItem = (item) => this.members[item.username] = item
    
    addMembers = () => {
        for (let player of allPlayers) if (player.guild == this.name) this.pushItem(player)
    }

    addPlayer = (player) => {
        if (player.name in members) {
            alert('player already in base. Try again.')

        }
    }

    removePlayer = (player) => {
        // remove player upon their request
    }

    updateWinLossRatio = (player=false) => {
        if (!player) {
            for (let member of members) {
                this.totalWins += member.wins
                this.totalLosses += member.losses
                ratio = `${this.totalWins}/${this.totalLosses}`
            }
            return 0
        }
        this.player = members[player.username]
        if (player.wins > this.player.wins) this.totalWins++
        else if (player.losses > this.player.losses) this.totalLosses++
        ratio = `${this.totalWins}/${this.totalLosses}`
    }

}

module.exports = new Guild()
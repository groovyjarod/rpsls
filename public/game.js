export default class Game {

    constructor(player1, player2) {
        this.player1 = player1
        this.player2 = player2
        this.player1Score = 0
        this.player2Score = 0
    }

    makeMove = () => {
        switch (this.player1.choice) {
            case '0001':    // rock, 0000 0001, 01, 1
                if (this.player2.choice == '0100' || this.player2.choice == '1000') this.player1.win()
                else if (player2.choice == player1.choice) tieGame()
                else this.player2.win()
                break;
            case '0010':    // paper, 0000 0010, 02, 2
                if (this.player2.choice == '0001' || this.player2.choice == '0000') this.player1.win()
                else if (player2.choice == player1.choice) tieGame()
                else this.player2.win()
                break;
            case '0100':    // scissors, 0000 0100, 04, 4
                if (this.player2.choice == '0010' || this.player2.choice == '1000') this.player1.win()
                else if (player2.choice == player1.choice) tieGame()
                else this.player2.win()
                break;
            case '1000':    // lizard, 0000 1000, 08, 8
                if (this.player2.choice == '0010' || this.player2.choice == '0000') this.player1.win()
                else if (player2.choice == player1.choice) tieGame()
                else this.player2.win()
                break;
            case '0000':    // spock, 0000 0000, 00, 0
                if (this.player2.choice == '0001' || this.player2.choice == '0100') this.player1.win()
                else if (this.player2.choice == this.player1.choice) tieGame()
                else this.player2.win()
                break;
        }
    }

    updateWinner = (winner) => {
        if (winner == player1) {
            this.player1Score++
            if (player1Score == 4) this.declareWinner(player1)
        }
        else {
            this.player2Score++
            if (this.player2Score == 4) this.declareWinner(player2)
        }
        
    }

    declareWinner = (winner) => {}
}

module.exports = new Game()
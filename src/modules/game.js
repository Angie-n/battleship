import { Player, Bot } from "./player"

const Game = (player, bot) => {
    let lastBotMove;

    const playerMove = (x, y) => {
        player.attack(x, y);
        if(!player.getIsTurn()) bot.setIsTurn(true);
        return player.checkSuccessOfLastMove();
    }

    const botMove = () => {
        let position = bot.decideAttackLocation();
        bot.attack(position[0], position[1]);
        if(!bot.getIsTurn()) player.setIsTurn(true);
        game.lastBotMove = [position[0], position[1]];
        return bot.checkSuccessOfLastMove();
    }

    const checkIfPlayerCanAttackLocation = (x, y) => {
        return player.checkIfAbleToAttackLocation(x, y);
    }

    const checkIfPlayerTurn = () => {
        return player.getIsTurn();
    }

    const getGameStatus = () => {
        if(player.checkIfWon()) {
            player.setIsTurn(false);
            return ["Won"];
        }
        else if(bot.checkIfWon()) {
            bot.setIsTurn(false);
            return ["Lost"];
        }

        let status = []
        if(player.checkShipsSunk().length - bot.checkShipsSunk().length > 2) status.push("Ahead");
        else if(player.checkShipsSunk().length - bot.checkShipsSunk().length < -2) status.push("Behind");
        if(player.checkSuccessOfLastMove() === "Hit") status.push("Hit");
        else if(player.checkSuccessOfLastMove() === "Missed") status.push("Missed");
        else status.push("Sunk");

        return status;
    }

    let game = {lastBotMove, playerMove, botMove, checkIfPlayerCanAttackLocation, checkIfPlayerTurn, getGameStatus};
    return game;
}

export {Game};
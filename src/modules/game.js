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
        console.log("Game, bot turn: " + bot.getIsTurn());
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

    const checkIfOver = () => {
        return player.checkIfWon() && bot.checkIfWon();
    }

    let game = {lastBotMove, playerMove, botMove, checkIfPlayerCanAttackLocation, checkIfPlayerTurn, checkIfOver};
    return game;
}

export {Game};
import { Gameboard } from "./gameboard";

const Player = (name, enemyGameboard) => {
    let isTurn;

    const attack = (x, y) => {
        enemyGameboard.receiveAttack(x, y);
        if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) player.isTurn = false;
    }

    let player = {name, isTurn, attack};
    return player
}

const Bot = enemyGameboard => {
    let player = Object.create(Player("Enemy", enemyGameboard));
    player.possibleMoves = enemyGameboard.legalMoves;
    player.decideAttackLocation = () => {
        let numPossibleMoves = player.possibleMoves.length;
        let index = Math.floor(Math.random() * numPossibleMoves);
        return player.possibleMoves[index];
    }
    return player;
}

export {Player, Bot};
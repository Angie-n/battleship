import { Gameboard } from "./gameboard";

const Player = (name, enemyGameboard, isTurn) => {

    const getIsTurn = () => isTurn;

    const attack = (x, y) => {
        if(isTurn && !(enemyGameboard.checkIfLocationHitAndMissed(x, y) || enemyGameboard.checkIfLocationHitWithShip(x, y))) {
            enemyGameboard.receiveAttack(x, y);
            if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) isTurn = false;
            else isTurn = true;
        }
        else console.log("Unable to carry out the last attack order");
    }

    let player = {name, getIsTurn, attack};
    return player
}

const Bot = (enemyGameboard, isTurn) => {
    let player = Object.create(Player("Enemy", enemyGameboard, isTurn));
    player.possibleMoves = enemyGameboard.legalMoves;
    player.decideAttackLocation = () => {
        let numPossibleMoves = player.possibleMoves.length;
        let index = Math.floor(Math.random() * numPossibleMoves);
        return player.possibleMoves[index];
    }
    return player;
}

export {Player, Bot};
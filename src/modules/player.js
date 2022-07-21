import { Gameboard } from "./gameboard";

const Player = (name, enemyGameboard, isTurn) => {

    const getIsTurn = () => player.isTurn;

    const setIsTurn = (turn) => {
        player.isTurn = turn;
    }

    const attack = (x, y) => {
        if(checkIfAbleToAttackLocation(x, y)) {
            enemyGameboard.receiveAttack(x, y);
            if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) player.isTurn = false;
            else player.isTurn = true;
            player.lastAttackLocation = [x, y];
        }
        else console.log("Unable to carry out the last attack order");
    }

    const checkIfAbleToAttackLocation = (x, y) => {
        return player.isTurn && !(enemyGameboard.checkIfLocationHitAndMissed(x, y) || enemyGameboard.checkIfLocationHitWithShip(x, y));
    }

    const checkSuccessOfLastMove = () => {
        let x = player.lastAttackLocation[0];
        let y = player.lastAttackLocation[1];
        if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) return "Missed";
        else if (enemyGameboard.getShipSunkByLastAttack() != null) return enemyGameboard.getShipSunkByLastAttack(); 
        return "Hit";
    }

    const checkIfWon = () => enemyGameboard.checkIfAllSunk();

    let player = {name, isTurn, getIsTurn, setIsTurn, attack, checkIfAbleToAttackLocation, checkSuccessOfLastMove, checkIfWon};
    return player
}

const Bot = (enemyGameboard, isTurn) => {
    let player = Object.create(Player("Enemy", enemyGameboard, isTurn));
    player.possibleMoves = enemyGameboard.legalMoves;
    player.decideAttackLocation = () => {
        let numPossibleMoves = player.possibleMoves.length;
        let index = Math.floor(Math.random() * numPossibleMoves);
        let strArray = player.possibleMoves[index].substring(1, player.possibleMoves[index].length - 1).split(",");
        return strArray.map(s => parseInt(s));
    }
    return player;
}

export {Player, Bot};
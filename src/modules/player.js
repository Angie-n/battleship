import { Gameboard } from "./gameboard";
import { sort2DCoordinates, indexOf2DArray, findAdjacentPositions } from "./helper";

const Player = (name, enemyGameboard, isTurn) => {
    const getIsTurn = () => player.isTurn;

    const setIsTurn = (turn) => {
        player.isTurn = turn;
    }

    const getLastAttackLocation = () => player.lastAttackLocation;

    const setLastAttackLocation = (location) => {
        player.lastAttackLocation = location;
    }

    const attack = (x, y) => {
        if(checkIfAbleToAttackLocation(x, y)) {
            enemyGameboard.receiveAttack(x, y);
            if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) player.isTurn = false;
            else player.isTurn = true;
            player.setLastAttackLocation([x, y]);
        }
        else console.log("Unable to carry out the last attack order");
    }

    const checkIfAbleToAttackLocation = (x, y) => {
        return player.isTurn && !(enemyGameboard.checkIfLocationHitAndMissed(x, y) || enemyGameboard.checkIfLocationHitWithShip(x, y));
    }

    const checkSuccessOfLastMove = () => {
        let x = player.getLastAttackLocation()[0];
        let y = player.getLastAttackLocation()[1];
        if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) return "Missed";
        else if (enemyGameboard.getShipSunkByLastAttack() != null) return sort2DCoordinates(enemyGameboard.getShipSunkByLastAttack()); 
        return "Hit";
    }

    const checkIfWon = () => enemyGameboard.checkIfAllSunk();

    let player = {name, isTurn, getIsTurn, setIsTurn, getLastAttackLocation, setLastAttackLocation, attack, checkIfAbleToAttackLocation, checkSuccessOfLastMove, checkIfWon};
    return player
}

const Bot = (enemyGameboard, isTurn) => {
    let player = Object.create(Player("Enemy", enemyGameboard, isTurn));
    player.possibleMoves = [...enemyGameboard.legalMoves];
    player.locationsOfInterest = [];

    const eliminatePossibleMoves = () => {
        player.possibleMoves.splice(indexOf2DArray(player.possibleMoves, player.getLastAttackLocation()), 1);

        let locations = [];
        if(player.locationsOfInterest.length > 1) {
            player.locationsOfInterest.forEach(l => {
                let index1D = l[0] + l[1] * 10;
                let finder = findAdjacentPositions(index1D);
                let surroundings;
                if(Math.abs(player.locationsOfInterest[1][0] - player.locationsOfInterest[0][0]) === 1) surroundings = [finder.findBLDiagonal(), finder.findBRDiagonal(), finder.findTLDiagonal(), finder.findTRDiagonal(), finder.findTop(), finder.findBottom()];
                else surroundings = [finder.findBLDiagonal(), finder.findBRDiagonal(), finder.findTLDiagonal(), finder.findTRDiagonal(), finder.findLeft(), finder.findRight()];
                surroundings.forEach(s => {
                    if(s != null && locations.indexOf(s) == -1) locations.push(s);
                });
            });
        }
        if(Array.isArray(player.checkSuccessOfLastMove())) {;
            let shipLocation = player.checkSuccessOfLastMove();
            shipLocation.forEach(s => {
                let index1D = s[0] + s[1] * 10;
                let finder = findAdjacentPositions(index1D);
                let surroundings = [finder.findBLDiagonal(), finder.findBRDiagonal(), finder.findTLDiagonal(), finder.findTRDiagonal(), finder.findLeft(), finder.findRight(), finder.findTop(), finder.findBottom()];
                surroundings.forEach(s => {
                    if(s != null && locations.indexOf(s) == -1) locations.push(s);
                });
            });
        }

        locations.forEach(l => {
            let x = l % 10;
            let y = Math.floor(l / 10);
            let index = indexOf2DArray(player.possibleMoves, [x, y]);
            if(index != -1) player.possibleMoves.splice(indexOf2DArray(player.possibleMoves, [x, y]), 1);
        });
        console.log(player.possibleMoves);
    }

    player.attack = (x, y) => {
        if(player.checkIfAbleToAttackLocation(x, y)) {
            enemyGameboard.receiveAttack(x, y);
            if(enemyGameboard.checkIfLocationHitAndMissed(x, y)) player.setIsTurn(false);
            else player.setIsTurn(true);
            player.setLastAttackLocation([x, y]);
            if(player.checkSuccessOfLastMove() === "Hit") player.locationsOfInterest.push([x, y]);
            else if(Array.isArray(player.checkSuccessOfLastMove())) player.locationsOfInterest = [];
            eliminatePossibleMoves();
            console.log(player.locationsOfInterest);
        }
        else console.log("Unable to carry out the last attack order");
    }
    player.decideAttackLocation = () => {
        let location;
        if(player.locationsOfInterest.length > 0) {
            let surroundings = [];
            player.locationsOfInterest.forEach(l => {
                let index1D = l[0] + l[1] * 10;
                let finder = findAdjacentPositions(index1D);
                surroundings.push(finder.findLeft(), finder.findRight(), finder.findTop(), finder.findBottom());
            });
            let possibleMovesIndex = -1;
            do {
                let surroundingsIndex = Math.floor(Math.random() * surroundings.length);
                if(surroundings[surroundingsIndex] != null) {
                    let x = surroundings[surroundingsIndex] % 10;
                    let y = Math.floor(surroundings[surroundingsIndex] / 10);
                    possibleMovesIndex = indexOf2DArray(player.possibleMoves, [x,y]);
                }
                surroundings.splice(surroundingsIndex, 1);
            } while(possibleMovesIndex === -1 && surroundings.length > 0);

            location = player.possibleMoves[possibleMovesIndex];
        }
        else {
            let numPossibleMoves = player.possibleMoves.length;
            let index = Math.floor(Math.random() * numPossibleMoves);
            location = player.possibleMoves[index];
        }
        return location;
    }
    return player;
}

export {Player, Bot};
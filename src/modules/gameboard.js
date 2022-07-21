import { Ship } from "./ship";
import { indexOf2DArray } from "./helper";

//shipLocations in format [[[x1,y1],[x2,y2],...], [x1, y1], ...]]]
const Gameboard = shipLocations => {
    let ships = [];
    let grid;
    let legalMoves = [];
    let lastAttackLocation;

    const Location = () => {
        let containedShip = null;
        let isHit = false;
        return {containedShip, isHit};
    }

    const initializeGrid = (() => {
        grid = new Array(10);
        for(let r = 0; r < grid.length; r++) {
            grid[r] = new Array(10);
            for(let c = 0; c < grid[r].length; c++) {
                grid[r][c] = Location();
                legalMoves.push([r, c]);
            }
        }
    })();

    const placeShips = (() => {
        shipLocations.forEach(individualShip => {
            let ship = Ship(individualShip);
            ships.push(ship);
            individualShip.forEach(position => {
                let gridLocation = grid[position[0]][position[1]];
                gridLocation.containedShip = ship;
            });
        });
    })();

    const receiveAttack = (x, y) => {
        if(grid[x][y].containedShip != null) grid[x][y].containedShip.hit(x, y);
        grid[x][y].isHit = true;
        gameboard.legalMoves.splice(indexOf2DArray(gameboard.legalMoves, [x,y]), 1);
        lastAttackLocation = [x, y];
    }

    const checkIfAllSunk = () => {
        let sunkShips = ships.filter(ship => ship.hasSunk);
        if(sunkShips.length === ships.length) return true;
        return false;
    }

    const checkIfLocationHitAndMissed = (x, y) => {
        if(grid[x][y].isHit && grid[x][y].containedShip == null) return true;
        return false;
    }

    const checkIfLocationHitWithShip = (x, y) => {
        if(grid[x][y].isHit && grid[x][y].containedShip != null) return true;
        return false;
    }

    const getShipSunkByLastAttack = () => {
        if(lastAttackLocation == null) return null;
        let x = lastAttackLocation[0];
        let y = lastAttackLocation[1];
        if(grid[x][y].containedShip == null || !grid[x][y].containedShip.hasSunk) return null;
        return grid[x][y].containedShip.locationsHit;
    }

    const gameboard = {legalMoves, receiveAttack, checkIfAllSunk, checkIfLocationHitAndMissed, checkIfLocationHitWithShip, getShipSunkByLastAttack};
    return gameboard;
}

export {Gameboard};
import { Ship } from "./ship";

const Gameboard = () => {
    let ships = [];
    let grid;
    
    const Location = () => {
        let containedShip = null;
        let isHit = false;
        return {containedShip, isHit};
    }

    const initializeGrid = (() => {
        grid = new Array(10);
        for(let r = 0; r < grid.length; r++) {
            grid[r] = new Array(10);
            for(let c = 0; c < grid[r].length; c++) grid[r][c] = Location();
        }
    })();

    const placeShip = locations => {
        let ship = Ship(locations);
        ships.push(ship);
        for(let i = 0; i < locations.length; i++) {
            let gridLocation = grid[locations[i][0]][locations[i][1]];
            gridLocation.containedShip = ship;
        }
    }

    const receiveAttack = (x, y) => {
        if(grid[x][y].containedShip !== null) grid[x][y].containedShip.hit(x, y);
        grid[x][y].isHit = true;
    }

    const checkIfAllSunk = () => {
        let sunkShips = ships.filter(ship => ship.hasSunk);
        if(sunkShips.length === ships.length) return true;
        return false;
    }

    const checkIfLocationHitAndMissed = (x, y) => {
        if(grid[x][y].isHit && grid[x,y].containedShip === null) return true;
        return false;
    }

    const checkIfLocationHitWithShip = (x, y) => {
        if(grid[x][y].isHit && grid[x,y].containedShip !== null) return true;
        return false;
    }

    return {placeShip, receiveAttack, checkIfAllSunk, checkIfLocationHitAndMissed, checkIfLocationHitWithShip};
}

export {Gameboard};
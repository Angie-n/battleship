import { Gameboard } from "./gameboard";
import { Player, Bot } from "./player";

const shipSizesToAdd = [1, 2, 2, 3, 3, 4, 4];

const findAdjacentPositions = index1D => {
    const findLeft = () => {
        if(index1D % 10 === 0) return null;
        return index1D - 1;
    }

    const findRight = () => {
        if(index1D % 10 === 9) return null;
        return index1D + 1;
    }

    const findTop = () => {
        if(index1D - 10 < 0) return null;
        return index1D - 10;
    }

    const findBottom = () => {
        if(index1D + 10 > 99) return null;
        return index1D + 10;
    }

    const findBLDiagonal = () => {
        let bottom = findBottom();
        if(bottom == null || findLeft() == null) return null;
        return bottom - 1;
    }

    const findBRDiagonal = () => {
        let bottom = findBottom();
        if(bottom == null || findRight() == null) return null;
        return bottom + 1;
    }

    const findTLDiagonal = () => {
        let top = findTop();
        if(top == null || findLeft() == null) return null;
        return top - 1;
    }

    const findTRDiagonal = () => {
        let top = findTop();
        if(top == null || findRight() == null) return null;
        return top + 1;
    }
    return {findLeft, findRight, findTop, findBottom, findBLDiagonal, findBRDiagonal, findTLDiagonal, findTRDiagonal};
}

//expect coordinate to be 1D.
const checkIfCoordinateAllowsShip = coordinate => {
    let squares = document.getElementById("setup-board").getElementsByTagName("div");
    if (squares[coordinate].classList.length != 0) return false;
    let surrounding = findAdjacentPositions(coordinate);

    function checkIfOccupied(otherPosition) {
        if(otherPosition != null && squares[otherPosition].classList.length != 0) return true;
        return false;
    }

    if(checkIfOccupied(surrounding.findLeft()) || checkIfOccupied(surrounding.findRight()) || checkIfOccupied(surrounding.findBottom()) || checkIfOccupied(surrounding.findTop()) || checkIfOccupied(surrounding.findBLDiagonal()) || checkIfOccupied(surrounding.findBRDiagonal()) || checkIfOccupied(surrounding.findTLDiagonal()) || checkIfOccupied(surrounding.findTRDiagonal())) return false;
    return true;
}

//expect coordinate to be 1D. Returns position(s) if ship can be added with coordinate as a starting point from left to right or top to bottom.
const getPositionsShipCanFitFromStartingIndex = (shipSize, coordinate) => {
    let allowedIndexes = [];
    if(checkIfCoordinateAllowsShip(coordinate) == false) return allowedIndexes;

    let horizontalExtreme = coordinate + shipSize - 1;
    if(Math.floor(coordinate / 10 ) === Math.floor((horizontalExtreme) / 10) && horizontalExtreme < 100) {
        let i = 1;
        let horizontalIndexes = [coordinate];
        while(i < shipSize && checkIfCoordinateAllowsShip(coordinate + i)) {
            horizontalIndexes.push(coordinate + i);
            i++;
        }
        if(i === shipSize) allowedIndexes.push(horizontalIndexes);
    }

    let verticalExtreme = coordinate + (10 * (shipSize - 1));
    if(coordinate % 10 === verticalExtreme % 10 && verticalExtreme < 100) {
        let i = 1;
        let verticalIndexes = [coordinate];
        while(i < shipSize && checkIfCoordinateAllowsShip(coordinate + i * 10)) {
            verticalIndexes.push(coordinate + i * 10);
            i++;
        }
        if(i === shipSize) allowedIndexes.push(verticalIndexes);
    }
    return allowedIndexes;
}

const randomizeShipPlacement = boardContainer => {
    let coordinates = [];

    const appendShipIcon = div => {
        let icon = document.createElement("i");
        icon.classList.add("fa-solid");
        icon.classList.add("fa-play");
        div.append(icon);
    }

    let allGridSpaces = boardContainer.getElementsByTagName("div");
    let availableGridIndexes = [...allGridSpaces].map((s,i) => i);
    shipSizesToAdd.forEach((s, i) => {
        let possiblePositions;
        do {
            let randomIndex = Math.floor(Math.random() * availableGridIndexes.length);
            possiblePositions = getPositionsShipCanFitFromStartingIndex(s, availableGridIndexes[randomIndex]);
            availableGridIndexes.splice(randomIndex, 1);
        }while(possiblePositions.length === 0);

        let position = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

        if(s === 1) {
            let div = allGridSpaces[position[0]];
            coordinates.push([position[0]]);
            div.classList.add("revealed-single-ship"); 
            appendShipIcon(div);
            appendShipIcon(div);
        }
        else {
            let isHorizontal;
            if(position[0] === position[1] - 1) isHorizontal = true;
            else isHorizontal = false;
            let shipLocation = [];
            position.forEach((p, i) => {
                let div = allGridSpaces[p];
                shipLocation.push(p);
                if(i === 0 || i === position.length - 1) {
                    appendShipIcon(div);
                    if(i === 0 && isHorizontal) div.classList.add("revealed-ship-left");
                    else if (i === 0 && !isHorizontal) div.classList.add("revealed-ship-top");
                    else if (i === position.length - 1 && isHorizontal) div.classList.add("revealed-ship-right");
                    else if (i === position.length - 1 && !isHorizontal) div.classList.add("revealed-ship-bottom");
                }
                else div.classList.add("revealed-ship-middle");
            });
            coordinates.push(shipLocation);
        }
    });
    return {coordinates};
}

const clearBoard = board => {
    let divs = board.getElementsByTagName("div");
    for(let i = 0; i < divs.length; i++) {
        for(let c = 0; c < divs[i].classList.length; c++) divs[i].classList.remove(divs[i].classList.item(0));
        divs[i].innerHTML = "";
    }
}


const initialSetup = (() => {
    const form = document.getElementById("setup-form");
    form.onsubmit = e => {
        e.preventDefault();
        let nameInput = document.getElementById("name");
        if(nameInput.value.trim() === "") return false;
        else {
            let placementDiv = document.getElementById("ship-placement");
            placementDiv.getElementsByTagName("h2")[0].textContent = "Captain " + nameInput.value + "'s board";
            form.style.display = "none";
            placementDiv.style.filter = "none";
        }
    }

    const setupBoard = document.getElementById("setup-board");
    let playerCoordinates;
    let playerBoard;
    let enemyCoordinates;
    let enemyBoard;

    function convert1Dto2DCoordinates(coordinates1D) {
        let coordinates = [];
        for(let oi = 0; oi < coordinates1D.length; oi++) {
            coordinates.push([]);
            for(let ii = 0; ii < coordinates1D[oi].length; ii++) {
                coordinates[oi].push([coordinates1D[oi][ii] % 10, Math.floor(coordinates1D[oi][ii] / 10)]);
            }
        }
        return coordinates;
    }

    //updates player coordinates
    document.getElementById("randomizer-btn").onclick = () => {
        clearBoard(setupBoard);
        playerCoordinates = randomizeShipPlacement(setupBoard).coordinates;
    }

    //creates board for player and its DOM representation
    function useSetupToSetUpPlayerBoard() {
        playerCoordinates = convert1Dto2DCoordinates(playerCoordinates);
        playerBoard = Gameboard(playerCoordinates);
        let playerBoardDOM = document.getElementById("player-board");
        playerBoardDOM.innerHTML = setupBoard.innerHTML;
        clearBoard(setupBoard);
    }

    //creates board for enemy and its DOM representation
    function randomlySetupEnemyBoard() {
        let enemyBoardDOM = document.getElementById("bot-board");
        let coordinates1D = randomizeShipPlacement(setupBoard).coordinates;
        enemyCoordinates = convert1Dto2DCoordinates(coordinates1D);
        enemyBoard = Gameboard(enemyCoordinates);
        enemyBoardDOM.innerHTML = setupBoard.innerHTML;
        clearBoard(setupBoard);
    }

    document.getElementById("start-game-btn").onclick = () => {
        if(document.getElementById("ship-pieces").getElementsByTagName("div").length === 0) {
            document.getElementById("game-setup-container").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            useSetupToSetUpPlayerBoard();
            randomlySetupEnemyBoard();
            console.log(enemyBoard);
            console.log(playerBoard);
        }
    }
})();
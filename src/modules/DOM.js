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
    let squares = document.querySelectorAll("#setup-board > div");
    console.log("Coordinate: " + coordinate);
    console.log(squares[coordinate]);
    if (squares[coordinate].classList.length != 0 && squares[coordinate].classList.item(0) != "hover-effect") return false;
    let surrounding = findAdjacentPositions(coordinate);

    function checkIfOccupied(otherPosition) {
        if(otherPosition != null && squares[otherPosition].classList.length != 0 && squares[otherPosition].classList.item(0) != "hover-effect") return true;
        return false;
    }

    if(checkIfOccupied(surrounding.findLeft()) || checkIfOccupied(surrounding.findRight()) || checkIfOccupied(surrounding.findBottom()) || checkIfOccupied(surrounding.findTop()) || checkIfOccupied(surrounding.findBLDiagonal()) || checkIfOccupied(surrounding.findBRDiagonal()) || checkIfOccupied(surrounding.findTLDiagonal()) || checkIfOccupied(surrounding.findTRDiagonal())) return false;
    return true;
}

//Horizontal and vertical does not check starting point.
function findHorizontalCoordinatesIfFit(shipSize, coordinate) {
    let horizontalExtreme = coordinate + shipSize - 1;
    if(Math.floor(coordinate / 10) === Math.floor((horizontalExtreme) / 10) && horizontalExtreme < 100) {
        let i = 1;
        let horizontalIndexes = [coordinate];
        while(i < shipSize && checkIfCoordinateAllowsShip(coordinate + i)) {
            horizontalIndexes.push(coordinate + i);
            i++;
        }
        if(i === shipSize) return horizontalIndexes;
    }
    return null;
}

function findVerticalCoordinatesIfFit(shipSize, coordinate) {
    let verticalExtreme = coordinate + (10 * (shipSize - 1));
    if(coordinate % 10 === verticalExtreme % 10 && verticalExtreme < 100) {
        let i = 1;
        let verticalIndexes = [coordinate];
        while(i < shipSize && checkIfCoordinateAllowsShip(coordinate + i * 10)) {
            verticalIndexes.push(coordinate + i * 10);
            i++;
        }
        if(i === shipSize) return verticalIndexes;
    }
    return null;
}

//expect coordinate to be 1D. Returns position(s) if ship can be added with coordinate as a starting point from left to right or top to bottom.
const getPositionsShipCanFitFromStartingIndex = (shipSize, coordinate) => {
    let allowedIndexes = [];
    if(checkIfCoordinateAllowsShip(coordinate) == false) return allowedIndexes;

    let horizontalCoordinates = findHorizontalCoordinatesIfFit(shipSize, coordinate);
    if(horizontalCoordinates != null) allowedIndexes.push(horizontalCoordinates);

    let verticalCoordinates = findVerticalCoordinatesIfFit(shipSize, coordinate);
    if(verticalCoordinates != null) allowedIndexes.push(verticalCoordinates);
    
    return allowedIndexes;
}

const randomizeShipPlacement = () => {
    let coordinates = [];
    document.getElementById("ship-pieces").innerHTML = "";

    const appendShipIcon = (div, iconClass) => {
        let icon = document.createElement("i");
        icon.classList.add("fa-solid");
        icon.classList.add(iconClass);
        div.append(icon);
    }

    let allGridSpaces = document.querySelectorAll("#setup-board > div");
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
            appendShipIcon(div, "fa-diamond");
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
                    appendShipIcon(div, "fa-play");
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
    let divs = board.querySelectorAll("#" + board.id +  " > div");
    for(let i = 0; i < divs.length; i++) {
        let cleanDiv = document.createElement("div");
        divs[i].replaceWith(cleanDiv);
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
    let playerCoordinates = [];
    let playerBoard;
    let enemyCoordinates;
    let enemyBoard;

    const drag = (() => {
        let initialDragBox = document.getElementById("ship-pieces"); //allow for drags back in box
        let draggables = document.getElementsByClassName("draggable");
        let dragDropOffs = document.querySelectorAll("#setup-board > div");

        function removeDragStyles(divArr) {
            divArr.forEach(h => {
                [...h.getElementsByClassName("hover-effect")].forEach(he => {
                    he.remove();
                });
            });
        }

        let lastHoveredOverDivs;
        function addDropOffEvent(d, i) {
            let validPosition;
            let hoveredOverDivs = [];

            function createDivForHover(isValid) {
                let hoverDiv = document.createElement("div");
                hoverDiv.classList.add("hover-effect");
                if(isValid) hoverDiv.style.backgroundColor = "white";
                else hoverDiv.style.backgroundColor = "red";
                return hoverDiv;
            }

            d.ondragenter = e => {
                console.log("dragged over: " + d);
                e.preventDefault();
                if(lastHoveredOverDivs != undefined) removeDragStyles(lastHoveredOverDivs);
                hoveredOverDivs = [];

                let grabbedItem = document.getElementsByClassName("grabbed")[0];
                let size = [...grabbedItem.getElementsByTagName("div")].length;
                let isHorizontal = grabbedItem.getElementsByTagName("div")[0].classList.contains("revealed-ship-left");

                if(isHorizontal && (!checkIfCoordinateAllowsShip(i) || findHorizontalCoordinatesIfFit(size, i) == null)) {
                    console.log("No horizontal spots");
                    let offset = 0;
                    while((i + offset) < 100 && offset < size && Math.floor(i / 10) === Math.floor((i + offset) / 10)) {
                        let div = document.querySelectorAll("#setup-board > div")[i + offset];
                        div.append(createDivForHover(false));
                        hoveredOverDivs.push(div);
                        offset++;
                    }
                    validPosition = false;
                }
                else if(!isHorizontal && (!checkIfCoordinateAllowsShip(i) || findVerticalCoordinatesIfFit(size, i) == null)) {
                    console.log("No vertical spots");
                    let offset = 0;
                    while((i + offset) < 100 && offset < size * 10 && i % 10 === (i + offset) % 10){
                        let div = document.querySelectorAll("#setup-board > div")[i + offset];
                        div.append(createDivForHover(false));
                        hoveredOverDivs.push(div);
                        offset += 10;
                    } 
                    validPosition = false;
                }
                else {
                    let max = size * 10;
                    let change = 10;
                    if(isHorizontal) {
                        change = 1;
                        max = size;
                    }

                    for(let offset = 0; offset < max; offset += change) {
                        let div = document.querySelectorAll("#setup-board > div")[i + offset];
                        div.append(createDivForHover(true));
                        hoveredOverDivs.push(div);
                    }
                    validPosition = true;
                }
                lastHoveredOverDivs = hoveredOverDivs;
                console.log(hoveredOverDivs);
            }

            d.ondragover = e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            }

            d.ondrop = e => {
                e.preventDefault();
                let originalSections = [...document.getElementsByClassName("original-section")];
                
                if(validPosition) {
                    let ship = e.dataTransfer.getData("ship");
                    let shipDiv = document.createElement("div");
                    shipDiv.innerHTML = ship;
                    let shipSections = shipDiv.getElementsByTagName("div");
                    hoveredOverDivs.forEach(h => {
                        shipSections[0].setAttribute("draggable", true);
                        h.replaceWith(shipSections[0]);
                    });

                    console.log("original: ");
                    console.log(originalSections);
                    if(originalSections.length === 0) document.getElementsByClassName("grabbed")[0].remove();
                    else {
                        originalSections.forEach(o => {
                            let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), o);
                            let replacement = document.createElement("div");
                            addDropOffEvent(replacement, index);
                            o.replaceWith(replacement);
                        });
                    }
                }
                else if (originalSections.length !== 0) {
                    originalSections.forEach(o => o.classList.remove("original-section"));
                }
                
                let coordinates = [];
                hoveredOverDivs.forEach((h,offset) => coordinates.push(i + offset));
                playerCoordinates.push(coordinates);
                hoveredOverDivs = [];
            }
        }

        [...dragDropOffs].forEach((d,i) => {
            addDropOffEvent(d,i);
        });

        function sectionDragEvents() {
            let dragSections = [...document.getElementsByClassName("draggable-section")];

            dragSections.forEach(s => {
                let specialClass;
                for(let i = 0; i < s.classList.length; i++) {
                    let item = s.classList.item(i);
                    let regex = /draggable-ship-*/;
                    if(regex.test(item)) specialClass = item; 
                }
                let specialClassShips = [...document.getElementsByClassName(specialClass)];
        
                s.onmouseenter = e => {
                    specialClassShips.forEach(sc => {
                        if(sc.classList.contains("revealed-ship-middle")) sc.style.backgroundColor = "rgb(55, 55, 55)";
                        else sc.getElementsByTagName("i")[0].style.color = "rgb(55, 55, 55)";
                    });
                }

                s.onmouseleave = e => {
                    specialClassShips.forEach(sc => {
                        if(sc.classList.contains("revealed-ship-middle")) sc.style.backgroundColor = "var(--ship-color)";
                        else sc.getElementsByTagName("i")[0].style.color = "var(--ship-color)";
                    });
                }

                s.ondragstart = e => {
                    let div = document.createElement("div");
                    div.classList.add("drag-image");
                    div.classList.add("drag-ship");
                    div.classList.add("grabbed");
                    div.style.display = "flex";

                    let isHorizontal = specialClassShips[0].classList.contains("revealed-ship-left");
                    if(!isHorizontal) div.style.flexDirection = "column";

                    document.getElementsByTagName("body")[0].append(div);
                    specialClassShips.forEach(c => {
                        let sectionClone = c.cloneNode(true);
                        div.append(sectionClone);
                        c.classList.add("original-section");
                    });
                    e.dataTransfer.setDragImage(div, 0, 0);

                    e.dataTransfer.setData("ship", div.innerHTML);
                    e.dataTransfer.setData("size", specialClassShips.length);
                    e.dataTransfer.setData("isHorizontal", isHorizontal);
                }

                s.ondragend = e => {
                    removeDragStyles([...document.querySelectorAll("#setup-board > div")]);
                    document.getElementsByClassName("drag-image")[0].remove();
                    sectionDragEvents();
                }
            });
        }

        [...draggables].forEach((d,i) => {
            let shipSection = d.getElementsByTagName("div");
            [...shipSection].forEach(s => {
                s.classList.add("draggable-ship-" + i)
                s.classList.add("draggable-section");
            });
            d.ondragstart = e => {
                d.classList.add("grabbed");
                e.dataTransfer.setData("ship", d.innerHTML);
                e.dataTransfer.setData("size", [...shipSection].length);
                e.dataTransfer.setData("isHorizontal", [...shipSection][0].classList.contains("revealed-ship-left"));

                let clone = d.cloneNode(true);
                clone.style.background = "none";
                clone.classList.add("drag-image");
                document.getElementsByTagName("body")[0].append(clone);
                e.dataTransfer.setDragImage(clone, 0, 0);
            }

            d.ondragend = e => {
                d.classList.remove("grabbed");
                removeDragStyles([...document.querySelectorAll("#setup-board > div")]);
                document.getElementsByClassName("drag-image")[0].remove();
                sectionDragEvents();
            }

            let shipIcons = d.getElementsByTagName("i");
            if(shipIcons.length > 1) {
                d.onclick = () => {
                    if(d.style.flexDirection != "column") {
                        d.style.flexDirection = "column";
                        shipSection[0].classList.add("revealed-ship-top");
                        shipSection[0].classList.remove("revealed-ship-left");
                        shipSection[shipSection.length - 1].classList.add("revealed-ship-bottom");
                        shipSection[shipSection.length - 1].classList.remove("revealed-ship-right");
                    }
                    else {
                        d.style.flexDirection = "row";
                        shipSection[0].classList.add("revealed-ship-left");
                        shipSection[0].classList.remove("revealed-ship-top");
                        shipSection[shipSection.length - 1].classList.add("revealed-ship-right");
                        shipSection[shipSection.length - 1].classList.remove("revealed-ship-bottom");
                    }
                }
            }
        });
    })();

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
        playerCoordinates = randomizeShipPlacement().coordinates;
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
        }
    }
})();

const setUpRound = () => {    
    const setPlayerTurnView = player => {
        let gridSquare = document.getElementById("bot-board").getElementsByTagName("div");
        [...gridSquare].forEach(square, index => {
            let x = Math.floor(index / 10);
            let y = index % 10;
            if(player.checkIfAbleToAttackLocation(x,y)) {
                square.onclick = () => {
                    player.attack(x,y);
                };
                square.onmouseover = () => {square.style.backgroundColor = "rgb(7, 155, 219)"};
            }
        });
    }
    
    const applyStylesForAttackLocation = (ship, div) => {
        let icon = document.createElement("i");
        icon.classList.add("fa-solid");
        if(ship == null) {
            icon.classList.add("fa-circle");
            div.append(icon);
            div.classList.add("missed-shot");
        }
        else if(ship == null) {
            icon.classList.add("fa-explosion");
            div.append(icon);
            div.classList.add("hit-ship");
        }
    
    }
    return {setPlayerTurnView};
}
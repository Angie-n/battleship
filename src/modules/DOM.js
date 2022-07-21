import { findAdjacentPositions, convert1Dto2DCoordinates, convert2Dto1DCoordinates } from "./helper";
import { Gameboard } from "./gameboard";
import { Player, Bot } from "./player";
import { Game } from "./game";

//expect coordinate to be 1D.
const checkIfCoordinateAllowsShip = coordinate => {
    let squares = document.querySelectorAll("#setup-board > div");
    if (squares[coordinate].classList.length != 0 && !squares[coordinate].classList.contains("hover-effect") && !squares[coordinate].classList.contains("original-section")) return false;
    let surrounding = findAdjacentPositions(coordinate);

    function checkIfOccupied(otherPosition) {
        if(otherPosition != null && squares[otherPosition].classList.length != 0 && !squares[otherPosition].classList.contains("hover-effect") && !squares[otherPosition].classList.contains("original-section")) return true;
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

function findSpecialClasses() {
    let specialClasses = [];
    [...document.getElementsByClassName("draggable-section")].forEach(ds => {
        let specialClass;
        for(let i = 0; i < ds.classList.length; i++) {
            let item = ds.classList.item(i);
            let regex = /draggable-ship-*/;
            if(regex.test(item)) specialClass = item; 
        }
        if(!specialClasses.includes(specialClass)) specialClasses.push(specialClass);
    });
    return specialClasses;
}

const randomizeShipPlacement = () => {
    let coordinates = [];
    let specialClasses = findSpecialClasses();

    specialClasses.forEach(s => {
        let allGridSpaces = document.querySelectorAll("#setup-board > div");
        let availableGridIndexes = [...allGridSpaces].map((s,i) => i);
        let shipSections = [...document.getElementsByClassName(s)];
        let size = shipSections.length;
        let possiblePositions;
        do {
            let randomIndex = Math.floor(Math.random() * availableGridIndexes.length);
            possiblePositions = getPositionsShipCanFitFromStartingIndex(size, availableGridIndexes[randomIndex]);
            availableGridIndexes.splice(randomIndex, 1);
        }while(possiblePositions.length === 0);

        let position = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

        let shipLocation = [];
        if(position.length > 1 && position[1] !== position[0] + 1) {
            shipSections[0].classList.add("revealed-ship-top");
            shipSections[0].classList.remove("revealed-ship-left");
            shipSections[shipSections.length - 1].classList.add("revealed-ship-bottom");
            shipSections[shipSections.length - 1].classList.remove("revealed-ship-right");
        }
        else if (position.length > 1) {
            shipSections[0].classList.remove("revealed-ship-top");
            shipSections[0].classList.add("revealed-ship-left");
            shipSections[shipSections.length - 1].classList.remove("revealed-ship-bottom");
            shipSections[shipSections.length - 1].classList.add("revealed-ship-right");
        }
        position.forEach((p, i) => {
            let div = allGridSpaces[p];
            shipLocation.push(p);
            div.innerHTML = shipSections[i].innerHTML;
            while(div.classList.length > 0) div.classList.remove(div.classList.item(0));
            for(let c = 0; c < shipSections[i].classList.length; c++) {
                div.classList.add(shipSections[i].classList.item(c));
            }
            div.setAttribute("draggable", true);

            if(document.getElementById("ship-pieces").getElementsByClassName(s).length === 0) {
                let clearedDiv = document.createElement("div");
                shipSections[i].replaceWith(clearedDiv);
            }
        });
        coordinates.push(shipLocation);
    });
    document.getElementById("ship-pieces").innerHTML = "";
    return {coordinates};
}

function createDivForHover(isValid) {
    let hoverDiv = document.createElement("div");
    hoverDiv.classList.add("hover-effect");
    if(isValid) hoverDiv.style.backgroundColor = "white";
    else hoverDiv.style.backgroundColor = "red";
    return hoverDiv;
}

let game;

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

        d.ondragenter = e => {
            e.preventDefault();
            if(lastHoveredOverDivs != undefined) removeDragStyles(lastHoveredOverDivs);
            hoveredOverDivs = [];

            let grabbedItem = document.getElementsByClassName("grabbed")[0];
            let size = [...grabbedItem.getElementsByTagName("div")].length;
            let isHorizontal = grabbedItem.getElementsByTagName("div")[0].classList.contains("revealed-ship-left");

            if(isHorizontal && (!checkIfCoordinateAllowsShip(i) || findHorizontalCoordinatesIfFit(size, i) == null)) {
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
                    let section = shipSections[0];
                    let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), h);
                    section.setAttribute("draggable", true);
                    h.replaceWith(section);
                    addDropOffEvent(section, index);
                });

                if(originalSections.length === 0) document.getElementsByClassName("grabbed")[0].remove();
                else {
                    originalSections.forEach(o => {
                        let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), o);
                        let replacement = document.createElement("div");
                        addDropOffEvent(replacement, index);
                        o.replaceWith(replacement);
                        o.classList.remove("original-section");
                    });
                }

                if(document.getElementById("ship-pieces").getElementsByTagName("div").length === 0) {
                    document.getElementById("start-game-btn").style.color = "white";
                }
            }
            else if (originalSections.length !== 0) {
                originalSections.forEach(o => o.classList.remove("original-section"));
            }
            
            hoveredOverDivs = [];
            document.getElementById("ship-pieces").style.backgroundColor = "var(--green-screen)";
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
                    if(sc.classList.contains("revealed-ship-middle")) sc.style.backgroundColor = "var(--light-ship-color)";
                    else sc.getElementsByTagName("i")[0].style.color = "var(--light-ship-color)";
                });
            }

            s.onmouseleave = e => {
                specialClassShips.forEach(sc => {
                    if(sc.classList.contains("revealed-ship-middle")) sc.style.backgroundColor = "var(--ship-color)";
                    else sc.getElementsByTagName("i")[0].style.color = "var(--ship-color)";
                });
            }

            s.onclick = e => {
                let isHorizontal = specialClassShips[0].classList.contains("revealed-ship-left");
                let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), specialClassShips[0]);
                let size = specialClassShips.length;

                specialClassShips.forEach(s => s.classList.add("original-section"));

                let originalCoordinates;
                let newCoordinates;
                if(isHorizontal) {
                    originalCoordinates = findHorizontalCoordinatesIfFit(size, index);
                    newCoordinates = findVerticalCoordinatesIfFit(size, index);
                }
                else {
                    originalCoordinates = findVerticalCoordinatesIfFit(size, index);
                    newCoordinates = findHorizontalCoordinatesIfFit(size, index);
                }

                specialClassShips.forEach(s => s.classList.remove("original-section"));

                if(newCoordinates != null)  {
                    if(isHorizontal) {
                        specialClassShips[0].classList.add("revealed-ship-top");
                        specialClassShips[0].classList.remove("revealed-ship-left");
                        specialClassShips[specialClassShips.length - 1].classList.add("revealed-ship-bottom");
                        specialClassShips[specialClassShips.length - 1].classList.remove("revealed-ship-right");
                    }
                    else {
                        specialClassShips[0].classList.remove("revealed-ship-top");
                        specialClassShips[0].classList.add("revealed-ship-left");
                        specialClassShips[specialClassShips.length - 1].classList.remove("revealed-ship-bottom");
                        specialClassShips[specialClassShips.length - 1].classList.add("revealed-ship-right");
                    }
                    newCoordinates.forEach((c,i) => {
                        if(i !== 0) {
                            let newLocation = document.querySelectorAll("#setup-board > div")[c];
                            let oldLocation = specialClassShips[i];
                            for(let cl = 0; cl < oldLocation.classList.length; cl++) {
                                newLocation.classList.add(oldLocation.classList.item(cl));
                            }
                            newLocation.innerHTML = oldLocation.innerHTML;

                            let replacement = document.createElement("div");
                            document.querySelectorAll("#setup-board > div")[originalCoordinates[i]].replaceWith(replacement);
                            addDropOffEvent(replacement, originalCoordinates[i]);
                        }
                    });
                }
            
                sectionDragEvents();
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
                specialClassShips.forEach(c => c.classList.remove("original-section"));
                sectionDragEvents();
            }
        });
    }

    function addBoxDragEvents(d) {
        let shipSection = d.getElementsByTagName("div");
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
    }

    [...draggables].forEach((d,i) => {
        let shipSection = d.getElementsByTagName("div");
        [...shipSection].forEach(s => {
            s.classList.add("draggable-ship-" + i)
            s.classList.add("draggable-section");
        });
        addBoxDragEvents(d);
    });

    let backToInitialBox = (() => {
        let initialDragBox = document.getElementById("ship-pieces"); 
        let count = 0;
        
        initialDragBox.ondragenter = e => {
            e.preventDefault();
            count++;
            initialDragBox.style.backgroundColor = "rgb(60, 189, 145)";
        }

        initialDragBox.ondragleave = e => {
            e.preventDefault();
            count--;
            if(count === 0) document.getElementById("ship-pieces").style.backgroundColor = "var(--green-screen)";
        }

        initialDragBox.ondragover = e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        }

        initialDragBox.ondrop = e => {
            e.preventDefault();
            let originalSections = [...document.getElementsByClassName("original-section")];

            if(originalSections.length !== 0) {
                let shipInfo = e.dataTransfer.getData("ship");
                let div = document.createElement("div");
                div.innerHTML = shipInfo;
                let isHorizontal = [...div.getElementsByTagName("div")][0].classList.contains("revealed-ship-left");
                div.setAttribute("draggable", true);
                div.classList.add("drag-ship");
                div.classList.add("draggable");
                if(!isHorizontal) div.style.flexDirection = "column";
                [...div.getElementsByTagName("div")].forEach(d => d.setAttribute("draggable", false));
                initialDragBox.append(div);
                addBoxDragEvents(div);

                originalSections.forEach(o => {
                    let replacement = document.createElement("div");
                    let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), o);
                    o.replaceWith(replacement);
                    addDropOffEvent(replacement, index);
                });
            }
            
            originalSections.forEach(o => o.classList.remove("original-section"));
            initialDragBox.style.backgroundColor = "var(--green-screen)";
            document.getElementById("start-game-btn").style.color = "gray";
        }

    })();

    //updates player coordinates
    document.getElementById("randomizer-btn").onclick = () => {
        randomizeShipPlacement();
        sectionDragEvents();
        [...document.querySelectorAll("#setup-board > div")].forEach((d,i) => {
            addDropOffEvent(d, i);
        });
        document.getElementById("start-game-btn").style.color = "white";
    }

    function clearBoard(board) {
        let divs = board.querySelectorAll("#" + board.id +  " > div");
        for(let i = 0; i < divs.length; i++) {
            while(divs[i].classList.length < 0) divs[i].classList.remove(divs[i].classList.item(0));
            divs[i].innerHTML = "";
            divs[i].setAttribute("draggable", false);
        }
    }

    function copyBoard (boardToCopy, board) {
        let copiedDivs = document.querySelectorAll("#" + boardToCopy.id +  " > div");
        for(let i = 0; i < copiedDivs.length; i++) {
            let div = document.createElement("div");
            board.append(div);
            div.innerHTML = copiedDivs[i].innerHTML;
            for(let c = 0; c < copiedDivs[i].classList.length; c++) {
                let regex = /revealed-*/;
                if(regex.test(copiedDivs[i].classList.item(c))) div.classList.add(copiedDivs[i].classList.item(c));
                if(div.getElementsByTagName("i").length != 0) div.getElementsByTagName("i")[0].style.opacity = "0.5";
                else div.style.backgroundColor = "rgba(31, 36, 31, 0.5)";
            }
        }
    }

    function findShipCoordinates() {
        let shipCoordinates = [];
        let specialClasses = findSpecialClasses();
        specialClasses.forEach(sc => {
            let currentSpecial = [...document.getElementsByClassName(sc)];
            let sectionCoordinates = [];
            currentSpecial.forEach(cs => {
                let index = Array.prototype.indexOf.call(document.querySelectorAll("#setup-board > div"), cs);
                sectionCoordinates.push(index);
            });
            shipCoordinates.push(sectionCoordinates);
        });
        return shipCoordinates;
    }

    //creates board for player and its DOM representation
    function useSetupToSetUpPlayerBoard() {
        playerCoordinates = findShipCoordinates();
        playerCoordinates = convert1Dto2DCoordinates(playerCoordinates);
        playerBoard = Gameboard(playerCoordinates);
        let playerBoardDOM = document.getElementById("player-board");
        copyBoard(setupBoard, playerBoardDOM);
    }

    //creates board for enemy and its DOM representation
    function randomlySetupEnemyBoard() {
        let coordinates1D = randomizeShipPlacement(setupBoard).coordinates;
        enemyCoordinates = convert1Dto2DCoordinates(coordinates1D);
        enemyBoard = Gameboard(enemyCoordinates);
    }

    document.getElementById("start-game-btn").onclick = () => {
        if(document.getElementById("ship-pieces").getElementsByTagName("div").length === 0) {
            document.getElementById("game-setup-container").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            useSetupToSetUpPlayerBoard();
            randomlySetupEnemyBoard();
            let player = Player(document.getElementById("name").value, enemyBoard, true);
            let enemy = Bot(playerBoard, false);
            game = Game(player, enemy);
        }
    }
})();

const gameSetUp = (() => {    
    for(let i = 0; i < document.querySelectorAll("#setup-board > div").length; i++) document.getElementById("bot-board").append(document.createElement("div"));

    //Assumes coordinates only differ one way for the x-direction or y-direction.
    function sort2DCoordinates(coordinates) {
        if(coordinates.length < 2) return coordinates;
        if(coordinates[0][0] != coordinates[1][0]) return coordinates.sort((a,b) => a[0] - b[0]);
        return coordinates.sort((a,b) => a[1] - b[1]);
    }
    
    const applyStylesForAttackLocation = (locationAttacked, success, boardID) => {
        let attackedIndex1D = locationAttacked[0] + locationAttacked[1] * 10;
        let divs = document.querySelectorAll("#" + boardID + " > div");
        if(success === "Missed") {
            let icon = document.createElement("i");
            icon.classList.add("fa-solid");
            icon.classList.add("fa-circle");
            divs[attackedIndex1D].append(icon);
            divs[attackedIndex1D].classList.add("missed-shot");
        }
        else if(success === "Hit") {
            let icon = document.createElement("i");
            icon.classList.add("fa-solid");
            icon.classList.add("fa-explosion");
            divs[attackedIndex1D].append(icon);
            divs[attackedIndex1D].classList.add("hit-ship");
        }
        else {
            sort2DCoordinates(success);
            let isHorizontal = false;
            if(success.length > 1) isHorizontal = success[0][0] + 1 === success[1][0];
            success.forEach((s,i) => {
                let index1D = s[0] + s[1] * 10;
                divs[index1D].classList.remove("hit-ship");
                let iconToRemove = divs[index1D].getElementsByClassName("fa-explosion");
                if(iconToRemove.length != 0) iconToRemove[0].remove();

                if(boardID === "bot-board") {
                    let icon = document.createElement("i");
                    icon.classList.add("fa-solid");
                    if(i === 0) {
                        if(success.length === 1) divs[index1D].classList.add("revealed-single-ship");
                        else if(isHorizontal) divs[index1D].classList.add("revealed-ship-left");
                        else divs[index1D].classList.add("revealed-ship-top");
                    }
                    else if(i === success.length - 1) {
                        if(isHorizontal) divs[index1D].classList.add("revealed-ship-right");
                        else divs[index1D].classList.add("revealed-ship-bottom");
                    }
                    else {
                        divs[index1D].classList.add("revealed-ship-middle");
                    }
    
                    if(divs[index1D].classList.contains("revealed-single-ship")) {
                        icon.classList.add("fa-diamond");
                        divs[index1D].append(icon);
                    }
                    else if(!divs[index1D].classList.contains("revealed-ship-middle")) {
                        icon.classList.add("fa-play");
                        divs[index1D].append(icon);
                    }
                }
                else {
                    if(divs[index1D].classList.contains("revealed-ship-middle")) divs[index1D].style.backgroundColor = "var(--ship-color)";
                    else divs[index1D].getElementsByTagName("i")[0].style.opacity = "1";
                }
        
            });
        }
    }

    const setPlayerTurnView = (() => {
        let gridSquare = document.querySelectorAll("#bot-board > div");
        [...gridSquare].forEach((square, index) => {
            let x = index % 10;
            let y = Math.floor(index / 10);
            square.onclick = () => {
                if(game.checkIfPlayerCanAttackLocation(x, y)) {
                    let successStatus = game.playerMove(x,y);
                    applyStylesForAttackLocation([x, y], successStatus, "bot-board");
                    while(!game.checkIfPlayerTurn()) {
                        let botSuccessStatus = game.botMove();
                        applyStylesForAttackLocation(game.lastBotMove, botSuccessStatus, "player-board");
                    }
                }
            };
            square.onmouseover = () => {
                if (game.checkIfPlayerCanAttackLocation(x, y)) square.append(createDivForHover(true));
                else square.append(createDivForHover(false));
            };
            square.onmouseleave = () => {document.getElementsByClassName("hover-effect")[0].remove()};
        });
    })();
})();
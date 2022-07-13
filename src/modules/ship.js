//positionsOccupied should be passed in format [[x1,y1], [x2, y2], ...]
const Ship = positionsOccupied => {
    let hasSunk = false;
    let locationsHit = [];

    const hit = (x, y) => {
        locationsHit.push([x, y]);
        if(locationsHit.length === positionsOccupied.length) ship.hasSunk = true;
    };
    const ship = {hasSunk, hit};
    return ship;
}

export {Ship};
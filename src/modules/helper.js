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

function convert2Dto1DCoordinates(coordinates2D) {
    let coordinates = [];
    for(let ship = 0; ship < coordinates2D.length; ship++) {
        coordinates.push([]);
        for(let section = 0; section < coordinates2D[ship].length; section++) {
            let coordinate1D = coordinates2D[ship][section][0] + coordinates2D[ship][section][1] * 10;
            coordinates[ship].push(coordinate1D);
        }
    }
    return coordinates;
}

export {findAdjacentPositions, convert1Dto2DCoordinates, convert2Dto1DCoordinates};
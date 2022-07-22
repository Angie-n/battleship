import * as helperModule from "../modules/helper";

describe("Adjacent positions", () => {
    test("find adjacent positions for the index 55", () => {
        let finder = helperModule.findAdjacentPositions(55);
        expect(finder.findBLDiagonal()).toBe(64);
        expect(finder.findBRDiagonal()).toBe(66);
        expect(finder.findBottom()).toBe(65);
        expect(finder.findLeft()).toBe(54);
        expect(finder.findRight()).toBe(56);
        expect(finder.findTLDiagonal()).toBe(44);
        expect(finder.findTRDiagonal()).toBe(46);
        expect(finder.findTop()).toBe(45);
    });
    
    test("find adjacent positions for the corner index 99", () => {
        let finder = helperModule.findAdjacentPositions(99);
        expect(finder.findBLDiagonal()).toBe(null);
        expect(finder.findBRDiagonal()).toBe(null);
        expect(finder.findBottom()).toBe(null);
        expect(finder.findLeft()).toBe(98);
        expect(finder.findRight()).toBe(null);
        expect(finder.findTLDiagonal()).toBe(88);
        expect(finder.findTRDiagonal()).toBe(null);
        expect(finder.findTop()).toBe(89);
    });
});

describe("Coordinate conversions", () => {
    test("convert [[12, 13, 14, 15], [78, 79]] to 2D coordinates", () => {
        expect(helperModule.convert1Dto2DCoordinates([[12, 13, 14, 15], [78, 88]])).toEqual([[[2, 1], [3, 1], [4, 1], [5, 1]], [[8, 7], [8, 8]]]);
    });

    test("convert [[[2, 1], [3, 1], [4, 1], [5, 1]], [[8, 7], [8, 8]]] to 1D coordinates", () => {
        expect(helperModule.convert2Dto1DCoordinates([[[2, 1], [3, 1], [4, 1], [5, 1]], [[8, 7], [8, 8]]])).toEqual([[12, 13, 14, 15], [78, 88]]);
    });
});

test("sort [[2, 1], [4, 1], [1, 1]]", () => {
    expect(helperModule.sort2DCoordinates([[2, 1], [4, 1], [1, 1]])).toEqual([[1, 1], [2, 1], [4, 1]]);
});

test("sort [[1, 7], [1, 4], [1, 1]]", () => {
    expect(helperModule.sort2DCoordinates([[1, 7], [1, 4], [1, 1]])).toEqual([[1, 1], [1, 4], [1, 7]]);
});

describe("index of for 2D arrays", () => {
    test("Index of [4, 2] within [[2, 3], [4, 2], [6, 2], [9, 1]]", () => {
        expect(helperModule.indexOf2DArray([[2, 3], [4, 2], [6, 2], [9, 1]], [4,2])).toBe(1);
    });
    
    test("Index of [0, 0] within [[2, 3], [4, 2], [6, 2], [9, 1]]", () => {
        expect(helperModule.indexOf2DArray([[2, 3], [4, 2], [6, 2], [9, 1]], [0, 0])).toBe(-1);
    });
    
    test("Index of [9, 1] within [[2, 3], [4, 2], [6, 2], [9, 1]]", () => {
        expect(helperModule.indexOf2DArray([[2, 3], [4, 2], [6, 2], [9, 1]], [9, 1])).toBe(3);
    });
    
    test("Index of [2, 3] within [[2, 3], [4, 2], [6, 2], [9, 1]]", () => {
        expect(helperModule.indexOf2DArray([[2, 3], [4, 2], [6, 2], [9, 1]], [2, 3])).toBe(0);
    });
});

test("Check ['a', 'b', 'c'] equal to ['a', 'b', 'c']", () => {
    expect(helperModule.arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
});

test("Check ['a'] equal to ['a', 'b', 'c']", () => {
    expect(helperModule.arraysEqual(['a'], ['a', 'b', 'c'])).toBe(false);
});

test("Check ['b'] equal to ['z']", () => {
    expect(helperModule.arraysEqual(['b'], ["z"])).toBe(false);
});
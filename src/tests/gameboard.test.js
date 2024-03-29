import { Gameboard } from "../modules/gameboard";
import { indexOf2DArray, sort2DCoordinates } from "../modules/helper";

let board;

test("Place one ship at [0,0], hit [0,0]", () => {
    board = Gameboard([[[0,0]]]);
    board.receiveAttack(0,0);
    expect(board.checkIfLocationHitAndMissed(0,0)).toBe(false);
    expect(board.checkIfLocationHitWithShip(0,0)).toBe(true);
    expect(board.checkIfAllSunk()).toBe(true);
    expect(indexOf2DArray(board.legalMoves, [0,0])).toBe(-1);
});

test("Place one ship at [9,9] and one at [5,5], hit [5,5]", () => {
    board = Gameboard([[[9,9]], [[5,5]]]);
    board.receiveAttack(5,5);
    expect(board.checkIfLocationHitAndMissed(9,9)).toBe(false);
    expect(board.checkIfLocationHitWithShip(9,9)).toBe(false);
    expect(board.checkIfLocationHitAndMissed(5,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(5,5)).toBe(true);
    expect(board.checkIfAllSunk()).toBe(false);
});

test("Place one ship at spanning [5,5], [6,5], [7,5] and hit [5,5]", () => {
    board = Gameboard([[[5,5], [6,5], [7,5]]]);
    board.receiveAttack(5,5);
    expect(board.checkIfLocationHitAndMissed(5,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(5,5)).toBe(true);
    expect(board.checkIfLocationHitAndMissed(7,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(7,5)).toBe(false);
    expect(board.checkIfAllSunk()).toBe(false);
    expect(indexOf2DArray(board.legalMoves, [5,5])).toBe(-1);
    expect(indexOf2DArray(board.legalMoves, [7,5])).not.toBe(-1);
});

test("Place a ship spanning [0, 0], [1, 0], [2,0], [3, 0] and another at [9, 2], [9, 3]. Check getShipSunkByLastAttack() before and after sinking first ship.", () => {
    board = Gameboard([[[0, 0], [1, 0], [2,0], [3, 0]], [[9, 2], [9, 3]]]);
    expect(board.getShipSunkByLastAttack()).toBe(null);
    board.receiveAttack(0,0);
    board.receiveAttack(1,0);
    expect(board.getShipSunkByLastAttack()).toBe(null);
    board.receiveAttack(2,0);
    board.receiveAttack(3,0);
    expect(sort2DCoordinates(board.getShipSunkByLastAttack())).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]]);
});
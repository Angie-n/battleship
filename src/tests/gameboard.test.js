import { Gameboard } from "../modules/gameboard";

let board;

beforeEach(() => {
    board = Gameboard();
});

test("Place one ship at [0,0], hit [0,0]", () => {
    board.placeShip([[0,0]]);
    board.receiveAttack(0,0);
    expect(board.checkIfLocationHitAndMissed(0,0)).toBe(false);
    expect(board.checkIfLocationHitWithShip(0,0)).toBe(true);
    expect(board.checkIfAllSunk()).toBe(true);
});

test("Place one ship at [9,9] and one at [5,5], hit [5,5]", () => {
    board.placeShip([[9,9], [5,5]]);
    board.receiveAttack(5,5);
    expect(board.checkIfLocationHitAndMissed(9,9)).toBe(false);
    expect(board.checkIfLocationHitWithShip(9,9)).toBe(false);
    expect(board.checkIfLocationHitAndMissed(5,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(5,5)).toBe(true);
    expect(board.checkIfAllSunk()).toBe(false);
});

test("Place one ship at spanning [5,5], [6,5], [7,5] and hit [5,5]", () => {
    board.placeShip([[5,5], [6,5], [7,5]]);
    board.receiveAttack(5,5);
    expect(board.checkIfLocationHitAndMissed(5,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(5,5)).toBe(true);
    expect(board.checkIfLocationHitAndMissed(7,5)).toBe(false);
    expect(board.checkIfLocationHitWithShip(7,5)).toBe(false);
    expect(board.checkIfAllSunk()).toBe(false);
});
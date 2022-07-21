import { Gameboard } from "../modules/gameboard";
import { Player, Bot } from "../modules/player";
import { indexOf2DArray } from "../modules/helper";

let gameboard;
let isTurn = true;

describe("Player tests", () => {
    let player;
    let name = "Tester";

    test("Place ship at [2,2], attack it", () => {
        gameboard = Gameboard([[[2,2]]]);
        player = Player(name, gameboard, isTurn);
        player.attack(2,2);
        expect(gameboard.checkIfAllSunk()).toBe(true);
        expect(player.getIsTurn()).toBe(true);
    });

    test("Place ship at [0,0], [0, 1], [0, 2] and attack [0,3]", () => {
        gameboard = Gameboard([[[0,0], [0,1], [0,2]]]);
        player = Player(name, gameboard, isTurn);
        player.attack(0,3);
        expect(gameboard.checkIfAllSunk()).toBe(false);
        expect(player.getIsTurn()).toBe(false);
    });

    test("Attempt to attack twice when missing the first time", () => {
        gameboard = Gameboard([[[0,0]]]);
        player = Player(name, gameboard, isTurn);
        player.attack(4,4);
        player.attack(6,6);
        expect(gameboard.checkIfLocationHitAndMissed(6,6)).toBe(false);
    });

    test("Attempt to attack the same location twice after hitting a ship there the first time", () => {
        gameboard = Gameboard([[[0,0]]]);
        player = Player(name, gameboard, isTurn);
        player.attack(0,0);
        player.attack(0,0);
        expect(player.getIsTurn()).toBe(true);
    });

    test("Sink all ships, check if won", () => {
        gameboard = Gameboard([[[0,0]], [[4,1], [4,2]]]);
        player = Player(name, gameboard, isTurn);
        expect(player.checkIfWon()).toBe(false);
        player.attack(0,0);
        expect(player.checkIfWon()).toBe(false);
        player.attack(4,1);
        player.attack(4,2);
        expect(player.checkIfWon()).toBe(true);
    });
});

describe("Bot tests", () => {
    let bot;

    test("Place ship at [2,2], [2,3], attack random legal position", () => {
        gameboard = Gameboard([[[2,2],[2,3]]]);
        bot = Bot(gameboard, isTurn);
        let next = bot.decideAttackLocation();
        expect(indexOf2DArray(bot.possibleMoves, next)).not.toBe(-1);
        bot.attack(next[0], next[1]);
        expect(indexOf2DArray(bot.possibleMoves, next)).toBe(-1);
        expect(gameboard.checkIfAllSunk()).toBe(false);
    });

    test("Place ship at [2,2], [2,3]. Attack [2,2] and decide to attack a location of interest next", () => {
        gameboard = Gameboard([[[2, 2], [2, 3]]]);
        bot = Bot(gameboard, isTurn);
        bot.attack(2, 2);
        let next = bot.decideAttackLocation();
        expect([[1, 2], [3, 2], [2, 3], [2, 1]]).toContainEqual(next);
    });

    test("Place ship at [2,2], [2,3], [2, 4]. Attack [2,2] and [2, 3] and decide to attack a location of interest next", () => {
        gameboard = Gameboard([[[2, 2], [2, 3], [2, 4]]]);
        bot = Bot(gameboard, isTurn);
        bot.attack(2, 2);
        bot.attack(2, 3);
        let next = bot.decideAttackLocation();
        expect([[2, 1], [2, 4]]).toContainEqual(next);
    });

    test("Sink single ship at [1, 1], remove surrounding locations from possible moves", () => {
        gameboard = Gameboard([[[1,1]]]);
        bot = Bot(gameboard, isTurn);
        bot.attack(1, 1);
        expect(indexOf2DArray(bot.possibleMoves, [1,1])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [0,1])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,1])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,0])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [0,0])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [0,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,0])).toBe(-1);
    });

    test("Sink ship at [2, 2], [2, 3], remove surrounding locations from possible moves", () => {
        gameboard = Gameboard([[[2,2], [2, 3]]]);
        bot = Bot(gameboard, isTurn);
        bot.attack(2, 2);
        bot.attack(2, 3);
        expect(indexOf2DArray(bot.possibleMoves, [2,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,3])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [3,3])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,1])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,4])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [2,1])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [1,4])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [3,4])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [3,2])).toBe(-1);
        expect(indexOf2DArray(bot.possibleMoves, [3,1])).toBe(-1);
    });
});
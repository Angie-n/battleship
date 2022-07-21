import { Gameboard } from "../modules/gameboard";
import { Player, Bot } from "../modules/player";

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
});

describe("Bot tests", () => {
    let bot;

    test("Place ship at [2,2], [2,3], attack random legal position", () => {
        gameboard = Gameboard([[[2,2],[2,3]]])
        bot = Bot(gameboard, isTurn);
        let next = bot.decideAttackLocation();
        expect(gameboard.legalMoves.includes(next)).toBe(true);
        expect(gameboard.checkIfAllSunk()).toBe(false);
    });
});
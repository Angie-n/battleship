import { Gameboard } from "../modules/gameboard";
import { Player, Bot } from "../modules/player";

let gameboard;

describe("Player tests", () => {
    let player;
    let name = "Tester";

    test("Place ship at [2,2], attack it", () => {
        gameboard = Gameboard([[[2,2]]]);
        player = Player(name, gameboard);
        player.isTurn = true;
        player.attack(2,2);
        expect(gameboard.checkIfAllSunk()).toBe(true);
        expect(player.isTurn).toBe(true);
    });

    test("Place ship at [0,0], [0, 1], [0, 2] and attack [0,3]", () => {
        gameboard = Gameboard([[[0,0], [0,1], [0,2]]]);
        player.isTurn = true;
        player.attack(0,3);
        expect(gameboard.checkIfAllSunk()).toBe(false);
        expect(player.isTurn).toBe(false);
    });

});

describe("Bot tests", () => {
    let bot;

    test("Place ship at [2,2], [2,3], attack random legal position", () => {
        gameboard = Gameboard([[[2,2],[2,3]]])
        bot = Bot(gameboard);
        bot.isTurn = true;
        let next = bot.decideAttackLocation();
        expect(gameboard.legalMoves.includes(next)).toBe(true);
        expect(gameboard.checkIfAllSunk()).toBe(false);
    });

    test("Place ships at every square on grid, then attack all squares on grid", () => {
        let throwawayGameboard = Gameboard([]);
        let allLocations = throwawayGameboard.legalMoves;
        allLocations = allLocations.map(l => JSON.parse(l));
        gameboard = Gameboard([allLocations]);
        bot = Bot(gameboard);
        for(let i = 0; i < allLocations.length; i++) {
            let next = bot.decideAttackLocation();
            let match = next.match(/[0-9]+/g);
            let x = match[0];
            let y = match[1];
            bot.attack(x, y);
        }
        expect(gameboard.checkIfAllSunk()).toBe(true);
    });

});
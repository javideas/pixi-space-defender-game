import * as PIXI from 'pixi.js';
import {KeyHandler} from "./helpers/keyboard.ts";

(async () => {
    const Application = PIXI.Application;
    const Graphics = PIXI.Graphics;

    let gameContainer = document.getElementById("app");
    if(!gameContainer) {
        throw new Error("Game container not found");
    }

    const app = new Application();
    await app.init({
        width: 480,
        height: 720,
    });

    gameContainer.appendChild(app.canvas);

    const Player = new Graphics();
    Player
        .poly([
            0, 0,
            50, 0,
            25, -25,
        ])
        .fill(0x66CCFF);

    Player.x = app.screen.width / 2 - Player.width / 2;
    Player.y = app.screen.height - 50;

    let playerSpeedX = 0;

    KeyHandler(
        "ArrowLeft",
        () => {playerSpeedX = -500},
        () => {playerSpeedX = 0}
    );

    KeyHandler(
        "ArrowRight",
        () => {playerSpeedX = 500},
        () => {playerSpeedX = 0}
    );

    app.stage.addChild(Player);

    app.ticker.add((ticker) => {
        const delta = ticker.deltaTime / 100;
        Player.x += playerSpeedX * delta;
    });
})();
import * as PIXI from 'pixi.js';
import {KeyHandler} from "./helpers/keyboard.ts";

const Application = PIXI.Application;
const Graphics = PIXI.Graphics;

(async () => {

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
    const bullets: PIXI.Graphics[] = [];

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

    KeyHandler(
        " ",
        () => {
            const bullet = createBullet(Player);
            bullets.push(bullet);
            app.stage.addChild(bullet);
        }
    );

    app.stage.addChild(Player);

    app.ticker.add((ticker) => {
        const delta = ticker.deltaTime / 100;
        Player.x += playerSpeedX * delta;

        for(let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            bullet.y -= 10;

            if(bullet.y < -20) {
                app.stage.removeChild(bullet);
                bullets.splice(i, 1);
            }
        }
    });
})();

let bulletTemplate: PIXI.Graphics | undefined = undefined;
function createBullet(source: PIXI.Graphics) {
    if(!bulletTemplate) {
        bulletTemplate = new Graphics();
        bulletTemplate
            .circle(0, 0, 5)
            .fill(0xFFCC66);
    }

    const bullet = bulletTemplate.clone();
    bullet.x = source.x + 25;
    bullet.y = source.y - 20;
    return bullet;
}
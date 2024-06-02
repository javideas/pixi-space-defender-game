import * as PIXI from 'pixi.js';
import {KeyHandler} from "./helpers/keyboard.ts";

const Application = PIXI.Application;
const Graphics = PIXI.Graphics;

(async () => {
    let gameContainer = document.getElementById("game");
    if(!gameContainer) {
        throw new Error("Game container not found");
    }

    const app = new Application();
    await app.init({
        width: 480,
        height: 720,
    });

    let lives = 3;
    let level = 1;
    let score = 0;

    setHudValue("gameLives", lives);
    setHudValue("gameLevel", level);
    setHudValue("gameScore", score);

    gameContainer.appendChild(app.canvas);

    const Player = new Graphics();
    const bullets: PIXI.Graphics[] = [];
    const enemies: PIXI.Graphics[] = [];

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

    const enemySpawnInterval = 2500;
    function spawnEnemy() {
        if(!document.hasFocus()) {
            return;
        }
        const enemy = createEnemy();
        enemies.push(enemy);
        app.stage.addChild(enemy);
    }

    let spawnInterval = setInterval(spawnEnemy, enemySpawnInterval);
    function setEnemySpawnInterval() {
        spawnInterval && clearInterval(spawnInterval);
        // Starts at 1 enemy every 2.5 seconds
        spawnInterval = setInterval(spawnEnemy, enemySpawnInterval - (level * 100) + 100);
    }
    setEnemySpawnInterval();
    spawnEnemy();

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

        for(let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            enemy.y += 2.5;

            if(enemy.y > app.screen.height + 50) {
                app.stage.removeChild(enemy);
                enemies.splice(i, 1);
                lives--;
                setHudValue("gameLives", lives);
            }
        }

        for(let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            for(let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                if(
                    bullet.x > enemy.x &&
                    bullet.x < enemy.x + 50 &&
                    bullet.y > enemy.y &&
                    bullet.y < enemy.y + 25
                ) {
                    app.stage.removeChild(bullet);
                    app.stage.removeChild(enemy);
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    score += 90 + (level * 10); // Starts at 100
                    setHudValue("gameScore", score);
                }
            }
        }

        // The score requirement gets higher every level
        if(score > (level * 1000) + (level * 100) - 100) {
            level++;
            setHudValue("gameLevel", level);
            setEnemySpawnInterval();
        }

        if(lives <= 0) {
            console.log("Game Over");
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

let enemyTemplate: PIXI.Graphics | undefined = undefined;
function createEnemy() {
    if(!enemyTemplate) {
        enemyTemplate = new Graphics();
        enemyTemplate
            .poly([
                0, 0,
                50, 0,
                25, 25,
            ])
            .fill(0xFF6666);
    }

    const enemy = enemyTemplate.clone();
    enemy.x = 25 + (Math.random() * 480) - 50;
    enemy.y = -50;

    return enemy;
}

function setHudValue(targetId: string, value: number) {
    const target = document.getElementById(targetId);
    if(target) {
        target.innerText = value.toString();
    }
}
import * as PIXI from 'pixi.js';
import {KeyHandler} from "./helpers/keyboard.ts";

const Application = PIXI.Application;
const Graphics = PIXI.Graphics;

(async () => {
    enum gameStates {
        "PLAYING",
        "PAUSED",
        "GAME_OVER"
    }
    let gameState = gameStates.PAUSED;

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

    const arrowLeftHandler = KeyHandler(
        "ArrowLeft",
        () => {
            if (gameState !== gameStates.PLAYING) {
                return;
            }
            playerSpeedX = -500
        },
        () => {
            // To prevent player from stopping moving if the other arrow key is pressed
            if(!arrowRightHandler.isDown) {
                playerSpeedX = 0;
            }
        }
    );

    const arrowRightHandler = KeyHandler(
        "ArrowRight",
        () => {
            if (gameState !== gameStates.PLAYING) {
                return;
            }
            playerSpeedX = 500
        },
        () => {
            // To prevent player from stopping moving if the other arrow key is pressed
            if(!arrowLeftHandler.isDown) {
                playerSpeedX = 0;
            }
        }
    );

    KeyHandler(
        " ",
        () => {
            const bullet = createBullet(Player);
            bullets.push(bullet);
            app.stage.addChild(bullet);
        }
    );

    KeyHandler(
        "Escape",
        () => {
            if(gameState !== gameStates.PAUSED) {
                gameState = gameStates.PAUSED;
                startGameText.text = 'Press enter to resume the game';
                togglePauseText();
            }
        }
    );

    KeyHandler(
        "Enter",
        () => {
            if(gameState !== gameStates.PLAYING) {
                if(gameState === gameStates.GAME_OVER) {
                    resetGame();
                }
                gameState = gameStates.PLAYING;
                togglePauseText();
            }
        }
    );

    const textsStyle = {
        fontSize: 24,
        fill: 0xFFFFFF
    };

    let gameOverText = new PIXI.Text({
        text: 'GAME OVER',
        style: textsStyle
    });

    let startGameText = new PIXI.Text({
        text: 'Press enter to start the game',
        style: textsStyle
    });

    let scoreText = new PIXI.Text({
        text: 'Score: 0',
        style: textsStyle
    });

    gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
    gameOverText.y = 200;

    startGameText.y = 250;

    scoreText.y = 300;

    function togglePauseText() {
        if(gameState === gameStates.PAUSED || gameState === gameStates.GAME_OVER) {
            // Since the text can change, we need to reposition it.
            startGameText.x = app.screen.width / 2 - startGameText.width / 2;
            app.stage.addChild(startGameText);
        } else {
            app.stage.removeChild(gameOverText)
            app.stage.removeChild(startGameText);
            app.stage.removeChild(scoreText);
        }
    }
    togglePauseText();

    function resetGame() {
        lives = 3;
        level = 1;
        score = 0;
        setHudValue("gameLives", lives);
        setHudValue("gameLevel", level);
        setHudValue("gameScore", score);
        Player.x = app.screen.width / 2 - Player.width / 2;
        Player.y = app.screen.height - 50;
        bullets.forEach(bullet => app.stage.removeChild(bullet));
        enemies.forEach(enemy => app.stage.removeChild(enemy));
        bullets.length = 0;
        enemies.length = 0;
        setEnemySpawnInterval();
        spawnEnemy();
    }

    const enemySpawnInterval = 2500;
    function spawnEnemy() {
        if(!document.hasFocus() || gameState !== gameStates.PLAYING) {
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
        if(gameState !== gameStates.PLAYING) {
            return;
        }

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
        if(score >= (level * 1000) + (level * 100) - 100) {
            level++;
            setHudValue("gameLevel", level);
            setEnemySpawnInterval();
        }

        if(lives <= 0) {
            gameState = gameStates.GAME_OVER;
            startGameText.text = 'Press enter to restart the game';
            scoreText.text = `Score: ${score}`;
            scoreText.x = app.screen.width / 2 - scoreText.width / 2;
            app.stage.addChild(gameOverText);
            togglePauseText();
            app.stage.addChild(scoreText);
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
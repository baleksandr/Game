import { Application, Container, Graphics, Text } from 'pixi.js';
import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { Coin } from './Coin.js';
import { Enemy } from './Enemy.js';
import { InputHandler } from './InputHandler.js';
import { Background } from './Background.js';
import { Mushroom } from './Mushroom.js';

export class Game {
    constructor() {
        this.app = null;
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.mushrooms = []; // Гриби
        this.inputHandler = null;
        this.background = null;
        
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;
        
        this.worldContainer = null;
        this.cameraX = 0;
        
        this.levelWidth = 3000;
        this.screenWidth = 800;
        this.screenHeight = 600;
        
        this.gravity = 0.5;
    }
    
    async init() {
        // Створюємо PixiJS додаток
        this.app = new Application();
        
        await this.app.init({
            width: this.screenWidth,
            height: this.screenHeight,
            backgroundColor: 0x5c94fc,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        
        // Додаємо canvas до контейнера
        const container = document.getElementById('game-container');
        container.appendChild(this.app.canvas);
        
        // Створюємо контейнер для світу (для скролінгу)
        this.worldContainer = new Container();
        this.app.stage.addChild(this.worldContainer);
        
        // Ініціалізуємо компоненти гри
        this.background = new Background(this);
        this.inputHandler = new InputHandler(this);
        
        // Створюємо рівень
        this.createLevel();
        
        // Створюємо гравця
        this.player = new Player(this);
        this.worldContainer.addChild(this.player.sprite);
        
        // Запускаємо ігровий цикл
        this.app.ticker.add((ticker) => this.gameLoop(ticker));
        
        // Ховаємо екран завантаження
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2000);
        
        console.log('🎮 Game initialized!');
    }
    
    createLevel() {
        // Фон
        this.background.create();
        
        // Земля (головна платформа)
        const groundSegments = [
            { x: 0, width: 800 },
            { x: 900, width: 400 },
            { x: 1400, width: 600 },
            { x: 2100, width: 900 },
        ];
        
        groundSegments.forEach(seg => {
            const ground = new Platform(this, seg.x, this.screenHeight - 40, seg.width, 40, 'ground');
            this.platforms.push(ground);
            this.worldContainer.addChild(ground.sprite);
        });
        
        // Платформи в повітрі
        const airPlatforms = [
            { x: 200, y: 450, width: 100, type: 'brick' },
            { x: 350, y: 350, width: 80, type: 'question' },
            { x: 500, y: 400, width: 150, type: 'brick' },
            { x: 700, y: 300, width: 100, type: 'question' },
            { x: 950, y: 400, width: 120, type: 'brick' },
            { x: 1100, y: 320, width: 80, type: 'question' },
            { x: 1250, y: 250, width: 100, type: 'brick' },
            { x: 1500, y: 380, width: 150, type: 'brick' },
            { x: 1700, y: 300, width: 80, type: 'question' },
            { x: 1900, y: 420, width: 100, type: 'brick' },
            { x: 2200, y: 350, width: 120, type: 'question' },
            { x: 2400, y: 280, width: 150, type: 'brick' },
            { x: 2600, y: 380, width: 100, type: 'question' },
            { x: 2800, y: 300, width: 80, type: 'brick' },
        ];
        
        airPlatforms.forEach(p => {
            if (p.type === 'brick') {
                // Для цегли створюємо окремі блоки 30x30
                const blockSize = 30;
                const numBlocks = Math.ceil(p.width / blockSize);
                
                for (let i = 0; i < numBlocks; i++) {
                    const block = new Platform(this, p.x + i * blockSize, p.y, blockSize, 30, 'brick');
                    this.platforms.push(block);
                    this.worldContainer.addChild(block.sprite);
                }
            } else {
                // Інші типи платформ - як раніше
                const platform = new Platform(this, p.x, p.y, p.width, 30, p.type);
                this.platforms.push(platform);
                this.worldContainer.addChild(platform.sprite);
            }
        });
        
        // Монети
        const coinPositions = [
            { x: 230, y: 400 },
            { x: 260, y: 400 },
            { x: 370, y: 300 },
            { x: 530, y: 350 },
            { x: 570, y: 350 },
            { x: 720, y: 250 },
            { x: 980, y: 350 },
            { x: 1120, y: 270 },
            { x: 1280, y: 200 },
            { x: 1530, y: 330 },
            { x: 1570, y: 330 },
            { x: 1720, y: 250 },
            { x: 2230, y: 300 },
            { x: 2270, y: 300 },
            { x: 2450, y: 230 },
            { x: 2620, y: 330 },
            { x: 2820, y: 250 },
        ];
        
        coinPositions.forEach(pos => {
            const coin = new Coin(this, pos.x, pos.y);
            this.coins.push(coin);
            this.worldContainer.addChild(coin.sprite);
        });
        
        // Вороги
        const enemyPositions = [
            { x: 400, y: this.screenHeight - 70 },
            { x: 1000, y: this.screenHeight - 70 },
            { x: 1600, y: this.screenHeight - 70 },
            { x: 2300, y: this.screenHeight - 70 },
            { x: 2700, y: this.screenHeight - 70 },
        ];
        
        enemyPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y);
            this.enemies.push(enemy);
            this.worldContainer.addChild(enemy.sprite);
        });
        
        // Фінішний прапор
        this.createFlag(2900, this.screenHeight - 200);
    }
    
    createFlag(x, y) {
        const flagPole = new Graphics();
        flagPole.rect(x, y, 8, 160);
        flagPole.fill(0x4a4a4a);
        
        const flag = new Graphics();
        flag.moveTo(x + 8, y);
        flag.lineTo(x + 60, y + 25);
        flag.lineTo(x + 8, y + 50);
        flag.closePath();
        flag.fill(0xff0000);
        
        this.worldContainer.addChild(flagPole);
        this.worldContainer.addChild(flag);
        
        this.flagX = x;
    }
    
    gameLoop(ticker) {
        if (this.isGameOver || this.isPaused) return;
        
        const delta = ticker.deltaTime;
        
        // Оновлюємо гравця
        this.player.update(delta);
        
        // Оновлюємо ворогів
        this.enemies.forEach(enemy => enemy.update(delta));
        
        // Оновлюємо монети
        this.coins.forEach(coin => coin.update(delta));
        
        // Оновлюємо гриби
        this.mushrooms.forEach(mushroom => mushroom.update(delta));
        
        // Оновлюємо фон
        this.background.update();
        
        // Перевіряємо колізії
        this.checkCollisions();
        
        // Оновлюємо камеру
        this.updateCamera();
        
        // Перевіряємо чи гравець впав
        if (this.player.y > this.screenHeight + 50) {
            this.playerDied();
        }
        
        // Перевіряємо чи гравець досяг фінішу
        if (this.player.x > this.flagX) {
            this.winGame();
        }
    }
    
    checkCollisions() {
        // Колізії з платформами (тільки активні!)
        this.platforms.forEach(platform => {
            if (platform.isActive && this.player.checkPlatformCollision(platform)) {
                // Колізія оброблена в Player
            }
        });
        
        // Колізії з монетами
        this.coins.forEach((coin, index) => {
            if (!coin.collected && this.player.checkCoinCollision(coin)) {
                coin.collect();
                this.addScore(100);
            }
        });
        
        // Колізії з ворогами
        this.enemies.forEach(enemy => {
            if (!enemy.isDead && this.player.checkEnemyCollision(enemy)) {
                // Перевіряємо чи гравець стрибнув на ворога
                if (this.player.velocityY > 0 && 
                    this.player.y + this.player.height - 10 < enemy.y + enemy.height / 2) {
                    enemy.die();
                    this.player.bounce();
                    this.addScore(200);
                } else if (!this.player.isInvincible) {
                    this.playerHit();
                }
            }
        });
        
        // Колізії з грибами
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected && mushroom.checkPlayerCollision(this.player)) {
                mushroom.collect();
                this.addScore(500);
                this.addLife();
            }
        });
        
        // Фільтруємо неактивні платформи (розбиті цегли)
        // (колізії з ними вже не перевіряються через isActive)
    }
    
    updateCamera() {
        // Плавне слідування за гравцем
        const targetX = -this.player.x + this.screenWidth / 3;
        
        // Обмежуємо камеру межами рівня
        const maxCameraX = 0;
        const minCameraX = -(this.levelWidth - this.screenWidth);
        
        this.cameraX = Math.max(minCameraX, Math.min(maxCameraX, targetX));
        this.worldContainer.x = this.cameraX;
    }
    
    addScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score;
    }
    
    /**
     * Спавнить гриб з блоку
     */
    spawnMushroom(x, y) {
        const mushroom = new Mushroom(this, x, y);
        this.mushrooms.push(mushroom);
        this.worldContainer.addChild(mushroom.sprite);
        console.log('🍄 Гриб з\'явився!');
    }
    
    /**
     * Додає життя
     */
    addLife() {
        this.lives++;
        document.getElementById('lives').textContent = this.lives;
        console.log('❤️ +1 життя!');
    }
    
    playerHit() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.setInvincible();
        }
    }
    
    playerDied() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.respawn();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.showOverlay('GAME OVER', `Очки: ${this.score}`);
    }
    
    winGame() {
        this.isGameOver = true;
        this.showOverlay('🎉 ПЕРЕМОГА! 🎉', `Очки: ${this.score}`);
    }
    
    showOverlay(title, message) {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="restart-btn">ГРАТИ ЗНОВУ</button>
        `;
        
        document.getElementById('game-container').appendChild(overlay);
        
        overlay.querySelector('.restart-btn').addEventListener('click', () => {
            location.reload();
        });
    }
    
    restart() {
        location.reload();
    }
}


import { Application, Container, Graphics, Text } from 'pixi.js';
import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { Coin } from './Coin.js';
import { Enemy } from './Enemy.js';
import { InputHandler } from './InputHandler.js';
import { Background } from './Background.js';
import { Mushroom } from './Mushroom.js';
import { SoundManager } from './SoundManager.js';

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
        this.soundManager = null;
        
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
        
        this.levels = this.buildLevels();
        this.currentLevelIndex = 0;
        this.spawnPoint = { x: 100, y: 400 };
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
        this.inputHandler = new InputHandler(this);
        this.soundManager = new SoundManager();
        
        // Створюємо рівень
        this.createLevel();
        
        // Створюємо кнопку звуку
        this.createSoundButton();
        
        // Запускаємо ігровий цикл
        this.app.ticker.add((ticker) => this.gameLoop(ticker));
        
        // Ховаємо екран завантаження та запускаємо музику
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            // Запускаємо фонову музику після взаємодії
            document.addEventListener('click', () => {
                this.soundManager.unlock();
                if (!this.soundManager.isMusicPlaying && !this.isGameOver) {
                    this.soundManager.startBackgroundMusic();
                }
            }, { once: true });
            
            document.addEventListener('keydown', () => {
                this.soundManager.unlock();
                if (!this.soundManager.isMusicPlaying && !this.isGameOver) {
                    this.soundManager.startBackgroundMusic();
                }
            }, { once: true });
        }, 2000);
        
        console.log('🎮 Game initialized!');
    }
    
    buildLevels() {
        return [
            {
                name: 'Grasslands',
                levelWidth: 3000,
                spawn: { x: 80, y: 380 },
                background: { skyColors: [0x5c94fc, 0x74a8fc, 0x8cbcfc, 0xa4d0fc] },
                groundSegments: [
                    { x: 0, width: 800 },
                    { x: 900, width: 400 },
                    { x: 1400, width: 600 },
                    { x: 2100, width: 900 },
                ],
                airPlatforms: [
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
                ],
                coins: [
                    { x: 230, y: 400 }, { x: 260, y: 400 },
                    { x: 370, y: 300 }, { x: 530, y: 350 }, { x: 570, y: 350 },
                    { x: 720, y: 250 }, { x: 980, y: 350 }, { x: 1120, y: 270 },
                    { x: 1280, y: 200 }, { x: 1530, y: 330 }, { x: 1570, y: 330 },
                    { x: 1720, y: 250 }, { x: 2230, y: 300 }, { x: 2270, y: 300 },
                    { x: 2450, y: 230 }, { x: 2620, y: 330 }, { x: 2820, y: 250 },
                ],
                enemies: [
                    { x: 400 }, { x: 1000 }, { x: 1600 }, { x: 2300 }, { x: 2700 },
                ],
                flagX: 2900,
            },
            {
                name: 'Ice Cavern',
                levelWidth: 3200,
                spawn: { x: 70, y: 360 },
                background: { skyColors: [0x7fd0ff, 0x9ae3ff, 0xc6f1ff, 0xe8fbff] },
                groundSegments: [
                    { x: 0, width: 700 },
                    { x: 850, width: 420 },
                    { x: 1400, width: 520 },
                    { x: 2000, width: 420 },
                    { x: 2500, width: 700 },
                ],
                airPlatforms: [
                    { x: 180, y: 420, width: 120, type: 'brick' },
                    { x: 360, y: 320, width: 90, type: 'question' },
                    { x: 520, y: 360, width: 180, type: 'brick' },
                    { x: 980, y: 420, width: 140, type: 'brick' },
                    { x: 1150, y: 300, width: 90, type: 'question' },
                    { x: 1340, y: 260, width: 140, type: 'brick' },
                    { x: 1600, y: 360, width: 110, type: 'question' },
                    { x: 1820, y: 300, width: 160, type: 'brick' },
                    { x: 2050, y: 240, width: 90, type: 'question' },
                    { x: 2250, y: 340, width: 180, type: 'brick' },
                    { x: 2550, y: 300, width: 120, type: 'question' },
                    { x: 2760, y: 380, width: 140, type: 'brick' },
                ],
                coins: [
                    { x: 210, y: 370 }, { x: 240, y: 370 }, { x: 270, y: 370 },
                    { x: 380, y: 270 }, { x: 540, y: 310 }, { x: 580, y: 310 },
                    { x: 1020, y: 370 }, { x: 1180, y: 250 }, { x: 1360, y: 210 },
                    { x: 1640, y: 310 }, { x: 1860, y: 250 }, { x: 2070, y: 200 },
                    { x: 2270, y: 290 }, { x: 2310, y: 290 }, { x: 2590, y: 250 },
                    { x: 2790, y: 330 }, { x: 2830, y: 330 },
                ],
                enemies: [
                    { x: 520 }, { x: 1050 }, { x: 1680 }, { x: 2100 }, { x: 2450 }, { x: 2900 },
                ],
                flagX: 3050,
            },
            {
                name: 'Desert Dunes',
                levelWidth: 3400,
                spawn: { x: 70, y: 380 },
                background: { skyColors: [0xf7d79b, 0xf9e4bd, 0xfbf0d9, 0xfcf7ec] },
                groundSegments: [
                    { x: 0, width: 900 },
                    { x: 1100, width: 450 },
                    { x: 1700, width: 550 },
                    { x: 2350, width: 400 },
                    { x: 2800, width: 600 },
                ],
                airPlatforms: [
                    { x: 220, y: 430, width: 140, type: 'brick' },
                    { x: 420, y: 330, width: 100, type: 'question' },
                    { x: 600, y: 380, width: 160, type: 'brick' },
                    { x: 760, y: 280, width: 90, type: 'question' },
                    { x: 1240, y: 360, width: 140, type: 'brick' },
                    { x: 1420, y: 300, width: 110, type: 'question' },
                    { x: 1620, y: 260, width: 140, type: 'brick' },
                    { x: 1880, y: 340, width: 160, type: 'brick' },
                    { x: 2080, y: 280, width: 100, type: 'question' },
                    { x: 2320, y: 240, width: 150, type: 'brick' },
                    { x: 2520, y: 320, width: 120, type: 'question' },
                    { x: 2720, y: 380, width: 180, type: 'brick' },
                    { x: 3000, y: 300, width: 140, type: 'question' },
                ],
                coins: [
                    { x: 250, y: 380 }, { x: 280, y: 380 }, { x: 450, y: 280 },
                    { x: 640, y: 330 }, { x: 680, y: 330 }, { x: 800, y: 230 },
                    { x: 1260, y: 310 }, { x: 1440, y: 250 }, { x: 1640, y: 210 },
                    { x: 1900, y: 290 }, { x: 1940, y: 290 }, { x: 2100, y: 230 },
                    { x: 2340, y: 190 }, { x: 2540, y: 270 }, { x: 2580, y: 270 },
                    { x: 2760, y: 330 }, { x: 3040, y: 250 }, { x: 3080, y: 250 },
                ],
                enemies: [
                    { x: 480 }, { x: 920 }, { x: 1300 }, { x: 1760 }, { x: 2140 }, { x: 2480 }, { x: 2900 }, { x: 3220 },
                ],
                flagX: 3200,
            },
            {
                name: 'Sky Ruins',
                levelWidth: 3600,
                spawn: { x: 80, y: 360 },
                background: { skyColors: [0x3a2f6d, 0x4c4c9a, 0x6b79c6, 0x95b8f6] },
                groundSegments: [
                    { x: 0, width: 760 },
                    { x: 980, width: 520 },
                    { x: 1700, width: 520 },
                    { x: 2400, width: 420 },
                    { x: 2900, width: 700 },
                ],
                airPlatforms: [
                    { x: 200, y: 430, width: 140, type: 'brick' },
                    { x: 420, y: 330, width: 120, type: 'question' },
                    { x: 620, y: 260, width: 160, type: 'brick' },
                    { x: 1120, y: 420, width: 180, type: 'brick' },
                    { x: 1340, y: 320, width: 140, type: 'question' },
                    { x: 1520, y: 260, width: 160, type: 'brick' },
                    { x: 1880, y: 340, width: 150, type: 'brick' },
                    { x: 2080, y: 260, width: 120, type: 'question' },
                    { x: 2260, y: 220, width: 160, type: 'brick' },
                    { x: 2480, y: 320, width: 160, type: 'brick' },
                    { x: 2700, y: 380, width: 140, type: 'question' },
                    { x: 2940, y: 300, width: 180, type: 'brick' },
                    { x: 3180, y: 240, width: 140, type: 'question' },
                ],
                coins: [
                    { x: 240, y: 380 }, { x: 270, y: 380 }, { x: 450, y: 280 }, { x: 640, y: 210 }, { x: 680, y: 210 },
                    { x: 1160, y: 370 }, { x: 1360, y: 270 }, { x: 1540, y: 220 }, { x: 1900, y: 290 }, { x: 1940, y: 290 },
                    { x: 2100, y: 230 }, { x: 2300, y: 180 }, { x: 2520, y: 270 }, { x: 2740, y: 330 }, { x: 2980, y: 250 },
                    { x: 3220, y: 190 }, { x: 3260, y: 190 },
                ],
                enemies: [
                    { x: 520 }, { x: 1040 }, { x: 1500 }, { x: 1820 }, { x: 2140 }, { x: 2460 }, { x: 2760 }, { x: 3100 }, { x: 3400 },
                ],
                flagX: 3400,
            },
            {
                name: 'Volcano Forge',
                levelWidth: 3800,
                spawn: { x: 80, y: 370 },
                background: { skyColors: [0x1d0f0f, 0x3a1414, 0x612222, 0x9a3d29] },
                groundSegments: [
                    { x: 0, width: 820 },
                    { x: 980, width: 520 },
                    { x: 1560, width: 460 },
                    { x: 2100, width: 520 },
                    { x: 2700, width: 460 },
                    { x: 3200, width: 600 },
                ],
                airPlatforms: [
                    { x: 240, y: 430, width: 140, type: 'brick' },
                    { x: 460, y: 330, width: 120, type: 'question' },
                    { x: 680, y: 290, width: 160, type: 'brick' },
                    { x: 1180, y: 410, width: 180, type: 'brick' },
                    { x: 1360, y: 320, width: 140, type: 'question' },
                    { x: 1580, y: 270, width: 160, type: 'brick' },
                    { x: 1840, y: 340, width: 170, type: 'brick' },
                    { x: 2060, y: 260, width: 140, type: 'question' },
                    { x: 2300, y: 230, width: 160, type: 'brick' },
                    { x: 2520, y: 320, width: 170, type: 'brick' },
                    { x: 2760, y: 280, width: 140, type: 'question' },
                    { x: 3000, y: 360, width: 180, type: 'brick' },
                    { x: 3220, y: 300, width: 160, type: 'brick' },
                    { x: 3440, y: 240, width: 140, type: 'question' },
                ],
                coins: [
                    { x: 260, y: 380 }, { x: 290, y: 380 }, { x: 500, y: 280 }, { x: 720, y: 240 }, { x: 760, y: 240 },
                    { x: 1220, y: 360 }, { x: 1400, y: 270 }, { x: 1600, y: 230 }, { x: 1880, y: 290 }, { x: 1920, y: 290 },
                    { x: 2120, y: 230 }, { x: 2340, y: 200 }, { x: 2560, y: 270 }, { x: 2800, y: 310 }, { x: 3040, y: 250 },
                    { x: 3260, y: 210 }, { x: 3500, y: 190 }, { x: 3540, y: 190 },
                ],
                enemies: [
                    { x: 540 }, { x: 1080 }, { x: 1420 }, { x: 1700 }, { x: 2020 }, { x: 2340 }, { x: 2620 }, { x: 2940 }, { x: 3260 }, { x: 3560 },
                ],
                flagX: 3600,
            },
        ];
    }
    
    createLevel() {
        const config = this.levels[this.currentLevelIndex] || this.levels[0];
        
        // Скидаємо світ
        this.worldContainer.removeChildren();
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.mushrooms = [];
        this.cameraX = 0;
        this.levelWidth = config.levelWidth;
        this.spawnPoint = config.spawn || { x: 100, y: 400 };
        
        // Фон
        this.background = new Background(this);
        this.background.create(config.background || {});
        
        // Земля (головна платформа)
        (config.groundSegments || []).forEach(seg => {
            const ground = new Platform(this, seg.x, this.screenHeight - 40, seg.width, 40, 'ground');
            this.platforms.push(ground);
            this.worldContainer.addChild(ground.sprite);
        });
        
        // Платформи в повітрі
        (config.airPlatforms || []).forEach(p => {
            if (p.type === 'brick') {
                const blockSize = 30;
                const numBlocks = Math.ceil(p.width / blockSize);
                
                for (let i = 0; i < numBlocks; i++) {
                    const block = new Platform(this, p.x + i * blockSize, p.y, blockSize, 30, 'brick');
                    this.platforms.push(block);
                    this.worldContainer.addChild(block.sprite);
                }
            } else {
                const platform = new Platform(this, p.x, p.y, p.width, 30, p.type);
                this.platforms.push(platform);
                this.worldContainer.addChild(platform.sprite);
            }
        });
        
        // Монети
        (config.coins || []).forEach(pos => {
            const coin = new Coin(this, pos.x, pos.y);
            this.coins.push(coin);
            this.worldContainer.addChild(coin.sprite);
        });
        
        // Вороги
        (config.enemies || []).forEach(pos => {
            const enemyY = pos.y || this.screenHeight - 70;
            const enemy = new Enemy(this, pos.x, enemyY);
            this.enemies.push(enemy);
            this.worldContainer.addChild(enemy.sprite);
        });
        
        // Фінішний прапор
        const flagY = this.screenHeight - 200;
        this.createFlag(config.flagX || (config.levelWidth - 100), flagY);
        
        // Створюємо / оновлюємо гравця
        if (this.player) {
            this.worldContainer.addChild(this.player.sprite);
            this.player.respawnTo(this.spawnPoint.x, this.spawnPoint.y);
        } else {
            this.player = new Player(this);
            this.worldContainer.addChild(this.player.sprite);
            this.player.respawnTo(this.spawnPoint.x, this.spawnPoint.y);
        }
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
    
    createSoundButton() {
        const btn = document.createElement('button');
        btn.id = 'sound-btn';
        btn.innerHTML = '🔊';
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid #fff;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        
        btn.addEventListener('mouseover', () => {
            btn.style.transform = 'scale(1.1)';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            btn.innerHTML = enabled ? '🔊' : '🔇';
            
            if (enabled && !this.isGameOver) {
                this.soundManager.startBackgroundMusic();
            }
        });
        
        document.body.appendChild(btn);
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
                this.soundManager.playCoin();
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
                    this.soundManager.playStompEnemy();
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
                
                // Якщо вже великий - дає життя, інакше - збільшує
                if (this.player.isBig) {
                    this.addLife();
                } else {
                    this.player.grow();
                }
                this.soundManager.playPowerUp();
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
        // Якщо великий - зменшуємо, але не втрачаємо життя
        if (this.player.isBig) {
            this.player.shrink();
            this.soundManager.playHurt();
            return;
        }
        
        // Якщо малий - втрачаємо життя
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        this.soundManager.playHurt();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.setInvincible();
        }
    }
    
    playerDied() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        this.soundManager.playHurt();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.respawn();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.soundManager.playGameOver();
        this.showOverlay('GAME OVER', `Очки: ${this.score}`);
    }
    
    winGame() {
        this.isGameOver = true;
        this.soundManager.playLevelComplete();
        const hasNext = this.currentLevelIndex < this.levels.length - 1;
        this.showOverlay('🎉 ПЕРЕМОГА! 🎉', `Очки: ${this.score}`, hasNext);
    }
    
    showOverlay(title, message, hasNext = false) {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="overlay-actions">
                ${hasNext ? '<button class="next-btn">НАСТУПНИЙ РІВЕНЬ</button>' : ''}
                <button class="restart-btn">ГРАТИ ЗНОВУ</button>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(overlay);
        
        overlay.querySelector('.restart-btn').addEventListener('click', () => {
            location.reload();
        });
        
        if (hasNext) {
            overlay.querySelector('.next-btn').addEventListener('click', () => {
                overlay.remove();
                this.advanceLevel();
            });
        }
    }
    
    advanceLevel() {
        this.currentLevelIndex = Math.min(this.currentLevelIndex + 1, this.levels.length - 1);
        this.isGameOver = false;
        this.cameraX = 0;
        this.createLevel();
        this.soundManager.startBackgroundMusic();
    }
    
    restart() {
        location.reload();
    }
}
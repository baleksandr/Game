import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bullet } from './Bullet.js';
import { Background } from './Background.js';
import { InputHandler } from './InputHandler.js';
import { ParticleSystem } from './ParticleSystem.js';
import { SpineManager } from './SpineManager.js';
import { PowerUp } from './PowerUp.js';
import { SoundManager } from './SoundManager.js';

export class Game {
    constructor() {
        this.app = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = null;
        this.background = null;
        this.inputHandler = null;
        this.spineManager = null;
        
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.maxHealth = 100;
        
        this.isGameOver = false;
        this.isPaused = false;
        
        this.screenWidth = 800;
        this.screenHeight = 600;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60;
        this.enemiesPerWave = 5;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        
        // Спавн апгрейдів
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 300; // Кожні ~5 секунд
        
        this.worldContainer = null;
    }
    
    async init() {
        this.app = new Application();
        
        await this.app.init({
            width: this.screenWidth,
            height: this.screenHeight,
            backgroundColor: 0x0a0a2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        
        const container = document.getElementById('game-container');
        container.appendChild(this.app.canvas);
        
        this.worldContainer = new Container();
        this.app.stage.addChild(this.worldContainer);
        
        this.spineManager = new SpineManager(this);
        await this.spineManager.init();
        
        // Звукова система
        this.sound = new SoundManager();
        
        // Запуск космічної фонової музики
        setTimeout(() => {
            this.sound.startBackgroundMusic();
        }, 1000); // Затримка для плавного входу
        
        this.background = new Background(this);
        this.background.create();
        
        this.particles = new ParticleSystem(this);
        this.worldContainer.addChild(this.particles.container);
        
        this.player = new Player(this);
        this.worldContainer.addChild(this.player.container);
        
        this.inputHandler = new InputHandler(this);
        
        this.app.ticker.add((ticker) => this.gameLoop(ticker));
        
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2500);
        
        // Створюємо UI для апгрейдів
        this.createUpgradeUI();
        
        // Створюємо кнопку звуку
        this.createSoundButton();
        
        console.log('🚀 Space Shooter initialized!');
    }
    
    createUpgradeUI() {
        const upgradePanel = document.createElement('div');
        upgradePanel.id = 'upgrade-panel';
        upgradePanel.innerHTML = `
            <div class="upgrade-label">UPGRADES</div>
            <div id="upgrade-icons"></div>
        `;
        // Додаємо до game-container, не ui-overlay
        document.getElementById('game-container').appendChild(upgradePanel);
        
        // Додаємо стилі
        const style = document.createElement('style');
        style.textContent = `
            #upgrade-panel {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(0, 255, 242, 0.4);
                border-radius: 8px;
                padding: 8px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                pointer-events: none;
                z-index: 55;
            }
            .upgrade-label {
                font-size: 10px;
                color: rgba(0, 255, 242, 0.7);
                letter-spacing: 2px;
            }
            #upgrade-icons {
                display: flex;
                gap: 8px;
            }
            .upgrade-icon {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                position: relative;
                animation: upgradeGlow 1s ease-in-out infinite alternate;
            }
            .upgrade-icon.shield { background: rgba(0, 255, 255, 0.3); border: 2px solid #00ffff; }
            .upgrade-icon.doubleShot { background: rgba(255, 102, 0, 0.3); border: 2px solid #ff6600; }
            .upgrade-icon.tripleShot { background: rgba(255, 0, 255, 0.3); border: 2px solid #ff00ff; }
            .upgrade-icon.speed { background: rgba(0, 255, 0, 0.3); border: 2px solid #00ff00; }
            .upgrade-timer {
                position: absolute;
                bottom: -2px;
                left: 0;
                height: 3px;
                background: #fff;
                border-radius: 2px;
                transition: width 0.1s;
            }
            @keyframes upgradeGlow {
                from { box-shadow: 0 0 5px currentColor; }
                to { box-shadow: 0 0 15px currentColor; }
            }
            .upgrade-icon.losing {
                animation: upgradeLose 0.5s ease-out;
            }
            @keyframes upgradeLose {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); background: rgba(255,0,0,0.5); }
                100% { transform: scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    gameLoop(ticker) {
        if (this.isGameOver || this.isPaused) return;
        
        const delta = ticker.deltaTime;
        
        this.background.update(delta);
        this.player.update(delta);
        this.updateEnemies(delta);
        this.updateBullets(delta);
        this.updatePowerUps(delta);
        this.particles.update(delta);
        
        this.spawnEnemies(delta);
        this.spawnPowerUps(delta);
        
        this.checkCollisions();
        this.checkWaveComplete();
        this.updateUI();
        this.updateUpgradeUI();
    }
    
    updateEnemies(delta) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);
            
            if (enemy.y > this.screenHeight + 50) {
                this.worldContainer.removeChild(enemy.container);
                this.enemies.splice(i, 1);
                this.enemiesKilled++;
            }
        }
    }
    
    updateBullets(delta) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(delta);
            
            if (bullet.y < -20 || bullet.y > this.screenHeight + 20 ||
                bullet.x < -20 || bullet.x > this.screenWidth + 20) {
                this.worldContainer.removeChild(bullet.sprite);
                this.bullets.splice(i, 1);
            }
        }
        
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.update(delta);
            
            if (bullet.y > this.screenHeight + 20) {
                this.worldContainer.removeChild(bullet.sprite);
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    updatePowerUps(delta) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(delta);
            
            // Видаляємо якщо за екраном або зібрано
            if (powerUp.y > this.screenHeight + 50 || powerUp.collected) {
                if (!powerUp.collected) {
                    this.worldContainer.removeChild(powerUp.container);
                }
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    spawnEnemies(delta) {
        if (this.enemiesSpawned >= this.enemiesPerWave) return;
        
        this.enemySpawnTimer += delta;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.enemiesSpawned++;
            
            const x = 50 + Math.random() * (this.screenWidth - 100);
            const type = Math.random() > 0.7 ? 'heavy' : 'basic';
            
            const enemy = new Enemy(this, x, -50, type);
            this.enemies.push(enemy);
            this.worldContainer.addChild(enemy.container);
        }
    }
    
    spawnPowerUps(delta) {
        this.powerUpSpawnTimer += delta;
        
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.powerUpSpawnTimer = 0;
            
            const x = 50 + Math.random() * (this.screenWidth - 100);
            const powerUp = new PowerUp(this, x, -30, 'random');
            this.powerUps.push(powerUp);
            this.worldContainer.addChild(powerUp.container);
        }
    }
    
    checkCollisions() {
        // Кулі гравця vs вороги
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    const destroyed = enemy.takeDamage(bullet.damage);
                    this.particles.createHitEffect(bullet.x, bullet.y, 0x00ffff);
                    this.sound.playHit();
                    
                    this.worldContainer.removeChild(bullet.sprite);
                    this.bullets.splice(i, 1);
                    
                    if (destroyed) {
                        this.enemyDestroyed(enemy, j);
                    }
                    
                    break;
                }
            }
        }
        
        // Ворожі кулі vs гравець
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (this.checkCollision(bullet, this.player)) {
                this.playerHit(bullet.damage);
                this.particles.createHitEffect(bullet.x, bullet.y, 0xff0000);
                
                this.worldContainer.removeChild(bullet.sprite);
                this.enemyBullets.splice(i, 1);
            }
        }
        
        // Вороги vs гравець
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.checkCollision(enemy, this.player)) {
                this.playerHit(20);
                this.enemyDestroyed(enemy, i);
            }
        }
        
        // Апгрейди vs гравець
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (!powerUp.collected && this.checkCollision(powerUp, this.player)) {
                this.collectPowerUp(powerUp);
            }
        }
    }
    
    checkCollision(a, b) {
        const aLeft = a.x - (a.width || 10) / 2;
        const aRight = a.x + (a.width || 10) / 2;
        const aTop = a.y - (a.height || 10) / 2;
        const aBottom = a.y + (a.height || 10) / 2;
        
        const bLeft = b.x - (b.width || 10) / 2;
        const bRight = b.x + (b.width || 10) / 2;
        const bTop = b.y - (b.height || 10) / 2;
        const bBottom = b.y + (b.height || 10) / 2;
        
        return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
    }
    
    enemyDestroyed(enemy, index) {
        this.particles.createExplosion(enemy.x, enemy.y);
        this.sound.playExplosion();
        this.addScore(enemy.type === 'heavy' ? 200 : 100);
        this.enemiesKilled++;
        
        // Шанс дропу апгрейду при знищенні ворога
        if (Math.random() < 0.15) { // 15% шанс
            const powerUp = new PowerUp(this, enemy.x, enemy.y, 'random');
            this.powerUps.push(powerUp);
            this.worldContainer.addChild(powerUp.container);
        }
        
        this.worldContainer.removeChild(enemy.container);
        this.enemies.splice(index, 1);
    }
    
    collectPowerUp(powerUp) {
        powerUp.collect();
        this.addScore(50);
        this.sound.playPowerUp();
        
        const config = powerUp.getConfig();
        
        // Застосовуємо ефект
        if (powerUp.type === 'health') {
            // Миттєве лікування
            this.health = Math.min(this.health + 30, this.maxHealth);
            this.updateHealthBar();
            this.showMessage('+30 HP', 0xff0066);
        } else {
            // Додаємо апгрейд гравцю
            this.player.addUpgrade(powerUp.type, config.duration);
            this.showMessage(config.name + '!', config.color);
        }
    }
    
    showMessage(text, color) {
        const message = new Text({
            text: text,
            style: new TextStyle({
                fontFamily: 'Orbitron',
                fontSize: 24,
                fontWeight: 'bold',
                fill: color,
                dropShadow: true,
                dropShadowColor: color,
                dropShadowBlur: 8,
                dropShadowDistance: 0,
            })
        });
        
        message.anchor.set(0.5);
        message.x = this.player.x;
        message.y = this.player.y - 50;
        
        this.app.stage.addChild(message);
        
        let progress = 0;
        const animate = () => {
            progress += 0.03;
            message.y -= 1;
            message.alpha = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.app.stage.removeChild(message);
            }
        };
        animate();
    }
    
    playerHit(damage) {
        // Спочатку перевіряємо чи є щит
        if (this.player.hasUpgrade('shield')) {
            // Щит блокує удар і знімається
            this.player.removeUpgrade('shield');
            this.particles.createHitEffect(this.player.x, this.player.y, 0x00ffff);
            this.sound.playShieldBlock();
            this.showMessage('SHIELD BROKEN!', 0x00ffff);
            this.player.flash();
            return;
        }
        
        // Потім перевіряємо інші апгрейди
        const upgrades = this.player.getUpgradesList();
        if (upgrades.length > 0) {
            // Забираємо випадковий апгрейд замість здоров'я
            const randomIndex = Math.floor(Math.random() * upgrades.length);
            const lostUpgrade = upgrades[randomIndex];
            this.player.removeUpgrade(lostUpgrade);
            this.particles.createHitEffect(this.player.x, this.player.y, 0xff6600);
            this.sound.playDamage();
            this.showMessage('LOST ' + lostUpgrade.toUpperCase() + '!', 0xff6600);
            this.player.flash();
            return;
        }
        
        // Якщо апгрейдів немає - забираємо здоров'я
        this.health -= damage;
        this.sound.playDamage();
        this.player.flash();
        
        const healthFill = document.getElementById('health-fill');
        const healthPercent = (this.health / this.maxHealth) * 100;
        healthFill.style.width = healthPercent + '%';
        
        if (healthPercent <= 30) {
            healthFill.classList.add('low');
        }
        
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    updateUpgradeUI() {
        const container = document.getElementById('upgrade-icons');
        if (!container) return;
        
        const upgrades = this.player.upgrades;
        let html = '';
        
        const icons = {
            shield: '🛡️',
            doubleShot: '🔥',
            tripleShot: '⚡',
            speed: '💨',
        };
        
        for (const [type, data] of upgrades) {
            const percent = (data.remaining / data.duration) * 100;
            html += `
                <div class="upgrade-icon ${type}" title="${type}">
                    ${icons[type] || '?'}
                    <div class="upgrade-timer" style="width: ${percent}%"></div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    checkWaveComplete() {
        if (this.enemiesKilled >= this.enemiesPerWave && this.enemies.length === 0) {
            this.nextWave();
        }
    }
    
    nextWave() {
        this.wave++;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.enemiesPerWave = Math.floor(5 + this.wave * 2);
        this.enemySpawnInterval = Math.max(40, 120 - this.wave * 10);
        
        document.getElementById('wave').textContent = this.wave;
        
        this.addScore(500 * this.wave);
        this.health = Math.min(this.health + 20, this.maxHealth);
        this.updateHealthBar();
        this.sound.playWaveStart();
        this.showWaveMessage();
        
        // Бонусний апгрейд за хвилю
        if (this.wave % 2 === 0) {
            const x = this.screenWidth / 2;
            const powerUp = new PowerUp(this, x, -30, 'random');
            this.powerUps.push(powerUp);
            this.worldContainer.addChild(powerUp.container);
        }
    }
    
    showWaveMessage() {
        const message = new Text({
            text: `WAVE ${this.wave}`,
            style: new TextStyle({
                fontFamily: 'Orbitron',
                fontSize: 48,
                fontWeight: 'bold',
                fill: 0x00fff2,
                dropShadow: true,
                dropShadowColor: 0x00fff2,
                dropShadowBlur: 10,
                dropShadowDistance: 0,
            })
        });
        
        message.anchor.set(0.5);
        message.x = this.screenWidth / 2;
        message.y = this.screenHeight / 2;
        message.alpha = 0;
        
        this.app.stage.addChild(message);
        
        let progress = 0;
        const animate = () => {
            progress += 0.02;
            
            if (progress < 0.3) {
                message.alpha = progress / 0.3;
                message.scale.set(0.5 + progress);
            } else if (progress < 0.7) {
                message.alpha = 1;
            } else if (progress < 1) {
                message.alpha = 1 - (progress - 0.7) / 0.3;
            } else {
                this.app.stage.removeChild(message);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    addScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score.toLocaleString();
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        const healthPercent = (this.health / this.maxHealth) * 100;
        healthFill.style.width = healthPercent + '%';
        
        if (healthPercent > 30) {
            healthFill.classList.remove('low');
        }
    }
    
    updateUI() {}
    
    gameOver() {
        this.isGameOver = true;
        this.particles.createExplosion(this.player.x, this.player.y, 50);
        this.sound.playExplosion();
        this.sound.playGameOver();
        this.player.container.visible = false;
        
        setTimeout(() => {
            this.showOverlay();
        }, 1000);
    }
    
    showOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <h2>GAME OVER</h2>
            <div class="stats">
                <p>SCORE: ${this.score.toLocaleString()}</p>
                <p>WAVES SURVIVED: ${this.wave}</p>
            </div>
            <button class="restart-btn">PLAY AGAIN</button>
        `;
        
        document.getElementById('game-container').appendChild(overlay);
        
        overlay.querySelector('.restart-btn').addEventListener('click', () => {
            location.reload();
        });
    }
    
    shoot(x, y, angle = -Math.PI / 2) {
        const bullet = new Bullet(this, x, y, angle, 'player');
        this.bullets.push(bullet);
        this.worldContainer.addChild(bullet.sprite);
        this.sound.playShoot();
    }
    
    enemyShoot(x, y, angle = Math.PI / 2) {
        const bullet = new Bullet(this, x, y, angle, 'enemy');
        this.enemyBullets.push(bullet);
        this.worldContainer.addChild(bullet.sprite);
        this.sound.playEnemyShoot();
    }
    
    createSoundButton() {
        const container = document.getElementById('game-container');
        
        // Кнопка звукових ефектів
        const sfxBtn = document.createElement('button');
        sfxBtn.id = 'sound-btn';
        sfxBtn.innerHTML = '🔊';
        sfxBtn.title = 'Toggle Sound Effects';
        container.appendChild(sfxBtn);
        
        // Кнопка музики
        const musicBtn = document.createElement('button');
        musicBtn.id = 'music-btn';
        musicBtn.innerHTML = '🎵';
        musicBtn.title = 'Toggle Music';
        container.appendChild(musicBtn);
        
        // Стилі
        const style = document.createElement('style');
        style.textContent = `
            #sound-btn, #music-btn {
                position: absolute;
                top: 15px;
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(0, 255, 242, 0.4);
                border-radius: 8px;
                font-size: 20px;
                cursor: pointer;
                z-index: 100;
                transition: all 0.2s;
            }
            #sound-btn {
                right: 190px;
            }
            #music-btn {
                right: 235px;
            }
            #sound-btn:hover, #music-btn:hover {
                background: rgba(0, 255, 242, 0.2);
                transform: scale(1.1);
            }
            #music-btn.off {
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
        
        // Клік - перемикає звукові ефекти
        sfxBtn.addEventListener('click', () => {
            const enabled = this.sound.toggle();
            sfxBtn.innerHTML = enabled ? '🔊' : '🔇';
            this.sound.unlock();
        });
        
        // Клік - перемикає музику
        musicBtn.addEventListener('click', () => {
            this.sound.unlock();
            const playing = this.sound.toggleMusic();
            musicBtn.innerHTML = playing ? '🎵' : '🔇';
            musicBtn.classList.toggle('off', !playing);
        });
        
        // Розблокування аудіо при першому кліку
        document.addEventListener('click', () => {
            this.sound.unlock();
        }, { once: true });
        
        document.addEventListener('keydown', () => {
            this.sound.unlock();
        }, { once: true });
    }
}

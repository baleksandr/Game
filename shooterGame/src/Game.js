import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bullet } from './Bullet.js';
import { Background } from './Background.js';
import { InputHandler } from './InputHandler.js';
import { ParticleSystem } from './ParticleSystem.js';
import { SpineManager } from './SpineManager.js';
import { PowerUp } from './PowerUp.js';
import { HomingMissile } from './HomingMissile.js';
import { SoundManager } from './SoundManager.js';

export class Game {
    constructor() {
        this.app = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.missiles = [];
        this.powerUps = [];
        this.particles = null;
        this.background = null;
        this.inputHandler = null;
        this.spineManager = null;
        
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.credits = 0;
        this.levelCredits = 0; // Кредити зібрані на поточному рівні
        
        // Система рівнів
        this.level = 1;
        this.levelScoreGoal = 10000; // Очки для переходу на наступний рівень
        this.levelScore = 0; // Очки на поточному рівні
        this.levelCompleting = false; // Флаг для запобігання повторного виклику
        
        this.isGameOver = false;
        this.isPaused = false;
        
        this.screenWidth = 800;
        this.screenHeight = 600;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 50; // Швидший спавн
        this.enemiesPerWave = 8; // Більше ворогів на хвилю
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        
        // Спавн апгрейдів
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 250; // Частіший спавн
        
        this.worldContainer = null;
        
        // Апгрейди корабля (перманентні)
        this.shipUpgrades = {
            guns: 0,      // Рівень пушок (0-3)
            blasters: 0,  // Рівень бластерів (0-3)
            missiles: 0,  // Рівень ракет (0-3)
        };
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
        this.createShopStyles();
        const wallet = document.getElementById('credits');
        if (wallet) wallet.textContent = this.credits.toLocaleString();
        
        // Оновлюємо UI рівня
        this.updateLevelUI();
        
        // Створюємо кнопку звуку
        this.createSoundButton();
        
        // Спавнимо стартовий бонус для рівня 1
        setTimeout(() => {
            this.spawnLevelBonus();
        }, 3000);
        
        console.log('🚀 Space Shooter initialized!');
        console.log('🎯 Level Goal: ' + this.levelScoreGoal + ' points');
    }

    createShopStyles() {
        // Стилі винесені в styles/style.css
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
        // Стилі винесені в styles/style.css
    }
    
    gameLoop(ticker) {
        if (this.isGameOver || this.isPaused) return;
        
        const delta = ticker.deltaTime;
        
        this.background.update(delta);
        this.player.update(delta);
        this.updateEnemies(delta);
        this.updateBullets(delta);
        this.updateMissiles(delta);
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

    updateMissiles(delta) {
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            missile.update(delta);
            if (missile.y < -40 || missile.y > this.screenHeight + 60 ||
                missile.x < -60 || missile.x > this.screenWidth + 60) {
                this.worldContainer.removeChild(missile.sprite);
                this.missiles.splice(i, 1);
            }
        }
    }
    
    updatePowerUps(delta) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(delta);
            
            // Обробка часу життя для бонусів рівня
            if (powerUp.isLevelBonus && powerUp.lifeTime !== undefined) {
                powerUp.lifeTime -= delta;
                
                // Блимання коли залишилось мало часу (~5 секунд)
                if (powerUp.lifeTime < 300) {
                    powerUp.container.alpha = 0.5 + Math.sin(powerUp.lifeTime * 0.4) * 0.5;
                }
                
                // Видаляємо якщо час вийшов
                if (powerUp.lifeTime <= 0) {
                    this.worldContainer.removeChild(powerUp.container);
                    this.powerUps.splice(i, 1);
                    this.showMessage('Бонус зник!', 0xff6666);
                    continue;
                }
            }
            
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

        // Ракети гравця vs вороги
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.checkCollision(missile, enemy)) {
                    const destroyed = enemy.takeDamage(missile.damage);
                    this.particles.createExplosion(missile.x, missile.y);
                    this.sound.playExplosion();
                    this.worldContainer.removeChild(missile.sprite);
                    this.missiles.splice(i, 1);
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
        this.addCredits(enemy.type === 'heavy' ? 120 : 80);
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
        
        // Перевіряємо чи це перманентний апгрейд
        if (config.permanent) {
            this.applyPermanentUpgrade(powerUp.type);
            this.showMessage('🎉 ' + config.name, config.color);
            return;
        }
        
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
    
    applyPermanentUpgrade(type) {
        // Збільшуємо рівень апгрейду
        if (this.shipUpgrades[type] < 3) {
            this.shipUpgrades[type]++;
        }
        
        // Застосовуємо ефекти
        this.applyShipUpgrades();
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

        // Магазин апгрейдів після переходу на 2 хвилю
        if (this.wave === 2) {
            this.openUpgradeShop();
        }

        // Обнуляємо кредит хвилі після відкриття магазину
        if (this.wave > 1) {
            this.waveCredits = 0;
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

    openUpgradeShop() {
        // Старий метод — тепер не використовується
    }

    openLevelUpgradeShop() {
        if (this.shopOpen) return;
        this.shopOpen = true;
        
        // Кошик вибраних апгрейдів
        const cart = new Map(); // id -> nextLevel
        let availableCredits = this.levelCredits;
        
        const upgrades = [
            { 
                id: 'guns', 
                title: '🔫 ПУШКИ', 
                desc: 'Швидша стрільба та більше снарядів',
                levels: ['Базові пушки', 'Подвійний постріл', 'Швидкострільні', 'Максимальна потужність'],
                costs: [0, 200, 400, 800],
                color: '#ff8c42',
                preview: '● ● → ●●● → 🔥🔥🔥',
                minLevel: 1 // Доступно з 1 рівня
            },
            { 
                id: 'blasters', 
                title: '⚡ БЛАСТЕРИ', 
                desc: 'Додаткові кулі під кутом',
                levels: ['Немає', 'Бічні бластери', 'Triple shot', 'Омні-бластери'],
                costs: [0, 300, 600, 1000],
                color: '#c040ff',
                preview: '↑ → ↖↑↗ → 🌟360°',
                minLevel: 2 // Доступно з 2 рівня
            },
            { 
                id: 'missiles', 
                title: '🚀 РАКЕТИ', 
                desc: 'Самонавідні ракети з високою шкодою',
                levels: ['Немає', 'Базові ракети', 'Швидкі ракети', 'Мега-ракети'],
                costs: [0, 350, 700, 1200],
                color: '#ffc400',
                preview: '🚀 → 🚀🚀 → 💥💥💥',
                minLevel: 3 // Доступно з 3 рівня
            },
        ];
        
        const overlay = document.createElement('div');
        overlay.id = 'shop-overlay';
        
        // Створюємо контейнер для панелі один раз
        const panelContainer = document.createElement('div');
        panelContainer.className = 'shop-panel wide';
        overlay.appendChild(panelContainer);
        
        const renderShop = () => {
            const totalCost = Array.from(cart.entries()).reduce((sum, [id, lvl]) => {
                const upg = upgrades.find(u => u.id === id);
                return sum + upg.costs[lvl];
            }, 0);
            
            availableCredits = this.levelCredits - totalCost;
            
            const cards = upgrades.map(u => {
                const baseLevel = this.shipUpgrades[u.id];
                const inCart = cart.has(u.id);
                const cartLevel = inCart ? cart.get(u.id) : baseLevel;
                const nextLevel = cartLevel + 1;
                const maxed = nextLevel > 3;
                const cost = maxed ? 0 : u.costs[nextLevel];
                const canAfford = availableCredits >= cost;
                const locked = this.level < u.minLevel; // Перевірка чи доступний апгрейд
                
                if (locked) {
                    return `
                        <div class="shop-card locked" data-id="${u.id}">
                            <h4 style="color:#666">🔒 ${u.title}</h4>
                            <p style="color:#888">${u.desc}</p>
                            <div class="locked-label">Доступно з рівня ${u.minLevel}</div>
                        </div>
                    `;
                }
                
                return `
                    <div class="shop-card ${maxed ? 'maxed' : ''} ${inCart ? 'selected' : ''}" data-id="${u.id}">
                        <h4 style="color:${u.color}">${u.title}</h4>
                        <p>${u.desc}</p>
                        <div class="upgrade-preview">${u.preview}</div>
                        <div class="upgrade-levels">
                            ${u.levels.map((lvl, i) => `
                                <span class="level-dot ${i <= baseLevel ? 'active' : ''} ${inCart && i === cartLevel ? 'pending' : ''}" title="${lvl}"></span>
                            `).join('')}
                        </div>
                        <div class="current-level">
                            ${inCart ? `<span class="pending-text">→ ${u.levels[cartLevel]}</span>` : u.levels[baseLevel]}
                        </div>
                        ${maxed ? 
                            '<div class="maxed-label">МАКСИМУМ</div>' : 
                            `<div class="price ${canAfford || inCart ? '' : 'cant-afford'}">${inCart ? `Обрано: ${u.costs[cartLevel]}¢` : `Наступний: ${cost}¢`}</div>
                            <div class="card-actions">
                                ${inCart ? 
                                    `<button class="remove-btn" data-upg="${u.id}">✕ Відмінити</button>` :
                                    `<button class="add-btn" data-upg="${u.id}" ${canAfford ? '' : 'disabled'}>
                                        ${canAfford ? '+ Додати' : 'Недостатньо'}
                                    </button>`
                                }
                            </div>`
                        }
                    </div>
                `;
            }).join('');
            
            const cartItems = Array.from(cart.entries()).map(([id, lvl]) => {
                const upg = upgrades.find(u => u.id === id);
                return `<div class="cart-item">
                    <span style="color:${upg.color}">${upg.title}</span> 
                    <span class="cart-cost">${upg.costs[lvl]}¢</span>
                </div>`;
            }).join('');
            
            panelContainer.innerHTML = `
                <h3>🎉 РІВЕНЬ ${this.level} ЗАВЕРШЕНО!</h3>
                <div class="shop-subtitle">Оберіть апгрейди для корабля (можна декілька)</div>
                <div class="shop-credits">
                    <span class="credits-icon">💰</span>
                    Доступно: <strong id="available-credits">${availableCredits.toLocaleString()}</strong> / ${this.levelCredits.toLocaleString()}¢
                </div>
                <div class="shop-grid">${cards}</div>
                ${cart.size > 0 ? `
                    <div class="shop-cart">
                        <div class="cart-title">🛒 Обрані апгрейди:</div>
                        <div class="cart-items">${cartItems}</div>
                        <div class="cart-total">Разом: ${totalCost}¢</div>
                    </div>
                ` : ''}
                <div class="shop-actions">
                    ${cart.size > 0 ? 
                        `<button class="confirm-btn">✓ Застосувати (${cart.size})</button>` : ''
                    }
                    <button class="skip-btn">${cart.size > 0 ? 'Скасувати все' : 'Продовжити без апгрейдів →'}</button>
                </div>
            `;
            
            // Додати апгрейд
            panelContainer.querySelectorAll('.add-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.upg;
                    const upg = upgrades.find(u => u.id === id);
                    const baseLevel = this.shipUpgrades[id];
                    const nextLevel = baseLevel + 1;
                    if (nextLevel > 3) return;
                    
                    const cost = upg.costs[nextLevel];
                    if (availableCredits < cost) return;
                    
                    cart.set(id, nextLevel);
                    renderShop();
                });
            });
            
            // Видалити апгрейд
            panelContainer.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.upg;
                    cart.delete(id);
                    renderShop();
                });
            });
            
            // Підтвердити
            const confirmBtn = panelContainer.querySelector('.confirm-btn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    // Застосовуємо всі апгрейди з кошика
                    for (const [id, lvl] of cart.entries()) {
                        const upg = upgrades.find(u => u.id === id);
                        const cost = upg.costs[lvl];
                        this.credits -= cost;
                        this.levelCredits -= cost;
                        this.shipUpgrades[id] = lvl;
                    }
                    
                    const wallet = document.getElementById('credits');
                    if (wallet) wallet.textContent = this.credits.toLocaleString();
                    
                    this.applyShipUpgrades();
                    this.closeShopAndAdvance(overlay);
                });
            }
            
            // Пропустити / Скасувати
            const skipBtn = panelContainer.querySelector('.skip-btn');
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    this.closeShopAndAdvance(overlay);
                });
            }
        };
        
        renderShop();
        document.body.appendChild(overlay);
    }

    applyShipUpgrades() {
        // Застосовуємо апгрейди пушок
        if (this.shipUpgrades.guns >= 1) {
            this.player.addUpgrade('doubleShot', 999999);
        }
        if (this.shipUpgrades.guns >= 2) {
            this.player.baseShootDelay = 5;
            this.player.shootDelay = 5;
        }
        if (this.shipUpgrades.guns >= 3) {
            this.player.baseShootDelay = 3;
            this.player.shootDelay = 3;
        }
        
        // Застосовуємо апгрейди бластерів
        if (this.shipUpgrades.blasters >= 1) {
            this.player.sideBlasters = true;
        }
        if (this.shipUpgrades.blasters >= 2) {
            this.player.addUpgrade('tripleShot', 999999);
        }
        if (this.shipUpgrades.blasters >= 3) {
            this.player.omniBlasters = true;
        }
        
        // Застосовуємо апгрейди ракет
        if (this.shipUpgrades.missiles >= 1) {
            this.player.homingUnlocked = true;
            this.player.missileDelay = 45;
        }
        if (this.shipUpgrades.missiles >= 2) {
            this.player.missileDelay = 30;
        }
        if (this.shipUpgrades.missiles >= 3) {
            this.player.missileDelay = 18;
            this.player.doubleMissiles = true;
        }
    }

    closeShopAndAdvance(overlay) {
        // Знімаємо паузу ПЕРШ за все
        this.isPaused = false;
        this.shopOpen = false;
        this.levelCompleting = false;
        
        // Видаляємо overlay
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        
        // Переходимо на наступний рівень
        this.advanceToNextLevel();
    }

    applyShopUpgrade(type) {
        // Старий метод — для сумісності
    }

    closeShop(overlay) {
        overlay.remove();
        this.shopOpen = false;
        this.isPaused = false;
    }
    
    addScore(points) {
        this.score += points;
        this.levelScore += points;
        document.getElementById('score').textContent = this.score.toLocaleString();
        
        // Оновлюємо прогрес рівня
        this.updateLevelUI();
        
        // Перевіряємо чи досягнуто цілі рівня
        if (this.levelScore >= this.levelScoreGoal) {
            this.completeLevel();
        }
    }

    addCredits(amount) {
        this.credits += amount;
        this.levelCredits += amount;
        const wallet = document.getElementById('credits');
        if (wallet) wallet.textContent = this.credits.toLocaleString();
    }
    
    updateLevelUI() {
        const levelEl = document.getElementById('level');
        if (levelEl) levelEl.textContent = this.level;
        
        const progressFill = document.getElementById('level-progress-fill');
        const progressText = document.getElementById('level-progress-text');
        
        if (progressFill) {
            const percent = Math.min(100, (this.levelScore / this.levelScoreGoal) * 100);
            progressFill.style.width = percent + '%';
        }
        
        if (progressText) {
            progressText.textContent = this.levelScore.toLocaleString() + ' / ' + this.levelScoreGoal.toLocaleString();
        }
    }
    
    completeLevel() {
        if (this.levelCompleting) return; // Запобігаємо повторному виклику
        this.levelCompleting = true;
        this.isPaused = true;
        
        // Показуємо магазин апгрейдів
        this.openLevelUpgradeShop();
    }
    
    advanceToNextLevel() {
        // Скидаємо паузу на початку
        this.isPaused = false;
        this.levelCompleting = false;
        
        this.level++;
        this.levelScore = 0;
        this.levelCredits = 0;
        
        // Збільшуємо складність
        this.levelScoreGoal = Math.floor(10000 * (1 + (this.level - 1) * 0.3));
        this.enemiesPerWave = 8 + this.level * 2;
        this.enemySpawnInterval = Math.max(30, 50 - this.level * 3);
        
        // Бонусне здоров'я
        this.health = Math.min(this.health + 30, this.maxHealth);
        this.updateHealthBar();
        
        this.updateLevelUI();
        this.showLevelMessage();
        
        // Спавнимо бонус апгрейду для цього рівня
        this.spawnLevelBonus();
    }
    
    spawnLevelBonus() {
        // Визначаємо який бонус спавнити для поточного рівня
        const levelBonuses = {
            1: 'guns',      // Рівень 1: пушки
            2: 'blasters',  // Рівень 2: бластери
            3: 'missiles',  // Рівень 3: ракети
        };
        
        const bonusType = levelBonuses[this.level];
        if (!bonusType) return; // Немає бонусу для цього рівня
        
        // Перевіряємо чи вже є цей апгрейд
        if (this.shipUpgrades[bonusType] >= 1) return;
        
        // Спавнимо бонус з невеликою затримкою
        setTimeout(() => {
            const x = this.screenWidth / 2;
            const powerUp = new PowerUp(this, x, -50, bonusType);
            powerUp.isLevelBonus = true; // Позначаємо як бонус рівня
            powerUp.lifeTime = 900; // ~15 секунд життя
            this.powerUps.push(powerUp);
            this.worldContainer.addChild(powerUp.container);
            
            // Показуємо підказку
            this.showMessage('⬇️ БОНУС! Збери апгрейд!', 0xffc400);
        }, 1500);
    }
    
    showLevelMessage() {
        const message = new Text({
            text: `LEVEL ${this.level}`,
            style: new TextStyle({
                fontFamily: 'Orbitron',
                fontSize: 56,
                fontWeight: 'bold',
                fill: 0x7dda45,
                dropShadow: true,
                dropShadowColor: 0x7dda45,
                dropShadowBlur: 15,
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
            progress += 0.015;
            
            if (progress < 0.3) {
                message.alpha = progress / 0.3;
                message.scale.set(0.5 + progress * 1.5);
            } else if (progress < 0.7) {
                message.alpha = 1;
                message.scale.set(1);
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

    shootMissile(x, y) {
        const missile = new HomingMissile(this, x, y);
        this.missiles.push(missile);
        this.worldContainer.addChild(missile.sprite);
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
        
        // Стилі винесені в styles/style.css
        
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

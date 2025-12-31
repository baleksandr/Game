import { Container, Graphics } from 'pixi.js';

export class Player {
    constructor(game) {
        this.game = game;
        
        this.x = game.screenWidth / 2;
        this.y = game.screenHeight - 80;
        this.width = 50;
        this.height = 50;
        
        this.baseSpeed = 6;
        this.speed = this.baseSpeed;
        this.shootCooldown = 0;
        this.baseShootDelay = 8;
        this.shootDelay = this.baseShootDelay;
        
        this.isFlashing = false;
        this.flashTimer = 0;
        
        // Анімаційні параметри
        this.animTime = 0;
        this.tiltAngle = 0;
        this.targetTilt = 0;
        this.isBoosting = false;
        
        // Система апгрейдів
        this.upgrades = new Map();
        // Формат: { type: { duration, remaining } }
        
        // Візуальні ефекти апгрейдів
        this.shieldSprite = null;
        
        this.container = this.createSprite();
        this.createShieldSprite();
    }
    
    createSprite() {
        const container = new Container();
        
        // === СВІТІННЯ ПІД КОРАБЛЕМ ===
        this.glowOuter = new Graphics();
        this.glowOuter.circle(25, 30, 45);
        this.glowOuter.fill({ color: 0x00fff2, alpha: 0.08 });
        container.addChild(this.glowOuter);
        
        this.glowInner = new Graphics();
        this.glowInner.circle(25, 30, 25);
        this.glowInner.fill({ color: 0x00fff2, alpha: 0.15 });
        container.addChild(this.glowInner);
        
        // === ДВИГУНУ (ПОЗАДУ) ===
        this.engineContainer = new Container();
        
        // Ліве сопло
        this.leftNozzle = new Graphics();
        this.leftNozzle.roundRect(8, 42, 10, 8, 2);
        this.leftNozzle.fill(0x333355);
        this.leftNozzle.stroke({ width: 1, color: 0x00fff2 });
        this.engineContainer.addChild(this.leftNozzle);
        
        // Праве сопло
        this.rightNozzle = new Graphics();
        this.rightNozzle.roundRect(32, 42, 10, 8, 2);
        this.rightNozzle.fill(0x333355);
        this.rightNozzle.stroke({ width: 1, color: 0x00fff2 });
        this.engineContainer.addChild(this.rightNozzle);
        
        // Полум'я двигунів
        this.leftFlame = new Graphics();
        this.engineContainer.addChild(this.leftFlame);
        
        this.rightFlame = new Graphics();
        this.engineContainer.addChild(this.rightFlame);
        
        container.addChild(this.engineContainer);
        
        // === КРИЛА ===
        this.wingsContainer = new Container();
        
        // Ліве крило
        const leftWing = new Graphics();
        leftWing.moveTo(12, 28);
        leftWing.lineTo(-5, 45);
        leftWing.lineTo(-10, 50);
        leftWing.lineTo(5, 42);
        leftWing.lineTo(12, 35);
        leftWing.closePath();
        leftWing.fill(0x1a2a4a);
        leftWing.stroke({ width: 2, color: 0x00fff2 });
        this.wingsContainer.addChild(leftWing);
        
        // Праве крило
        const rightWing = new Graphics();
        rightWing.moveTo(38, 28);
        rightWing.lineTo(55, 45);
        rightWing.lineTo(60, 50);
        rightWing.lineTo(45, 42);
        rightWing.lineTo(38, 35);
        rightWing.closePath();
        rightWing.fill(0x1a2a4a);
        rightWing.stroke({ width: 2, color: 0x00fff2 });
        this.wingsContainer.addChild(rightWing);
        
        // Деталі крил
        const leftWingDetail = new Graphics();
        leftWingDetail.moveTo(8, 32);
        leftWingDetail.lineTo(-2, 44);
        leftWingDetail.stroke({ width: 1, color: 0x00aacc });
        this.wingsContainer.addChild(leftWingDetail);
        
        const rightWingDetail = new Graphics();
        rightWingDetail.moveTo(42, 32);
        rightWingDetail.lineTo(52, 44);
        rightWingDetail.stroke({ width: 1, color: 0x00aacc });
        this.wingsContainer.addChild(rightWingDetail);
        
        container.addChild(this.wingsContainer);
        
        // === ГОЛОВНИЙ КОРПУС ===
        const body = new Graphics();
        
        // Основа корпусу
        body.moveTo(25, 0);       // Ніс
        body.lineTo(42, 15);      // Правий згин
        body.lineTo(45, 35);      // Правий бік
        body.lineTo(38, 45);      // Правий задній
        body.lineTo(25, 48);      // Центр задній
        body.lineTo(12, 45);      // Лівий задній
        body.lineTo(5, 35);       // Лівий бік
        body.lineTo(8, 15);       // Лівий згин
        body.closePath();
        body.fill(0x1a1a3e);
        body.stroke({ width: 2, color: 0x00fff2 });
        container.addChild(body);
        
        // Броньовані панелі
        const panel1 = new Graphics();
        panel1.moveTo(25, 8);
        panel1.lineTo(35, 18);
        panel1.lineTo(35, 32);
        panel1.lineTo(25, 38);
        panel1.lineTo(15, 32);
        panel1.lineTo(15, 18);
        panel1.closePath();
        panel1.fill(0x2a2a5e);
        panel1.stroke({ width: 1, color: 0x4488aa });
        container.addChild(panel1);
        
        // === КОКПІТ ===
        const cockpitOuter = new Graphics();
        cockpitOuter.ellipse(25, 20, 10, 14);
        cockpitOuter.fill(0x003344);
        cockpitOuter.stroke({ width: 2, color: 0x00fff2 });
        container.addChild(cockpitOuter);
        
        const cockpitInner = new Graphics();
        cockpitInner.ellipse(25, 18, 6, 10);
        cockpitInner.fill(0x00fff2);
        container.addChild(cockpitInner);
        
        const cockpitGlow = new Graphics();
        cockpitGlow.ellipse(23, 16, 3, 5);
        cockpitGlow.fill(0xaaffff);
        container.addChild(cockpitGlow);
        
        // === ГАРМАТИ ===
        const leftGun = new Graphics();
        leftGun.roundRect(2, 8, 6, 20, 2);
        leftGun.fill(0x444466);
        leftGun.stroke({ width: 1, color: 0x00fff2 });
        leftGun.circle(5, 8, 3);
        leftGun.fill(0x00fff2);
        container.addChild(leftGun);
        
        const rightGun = new Graphics();
        rightGun.roundRect(42, 8, 6, 20, 2);
        rightGun.fill(0x444466);
        rightGun.stroke({ width: 1, color: 0x00fff2 });
        rightGun.circle(45, 8, 3);
        rightGun.fill(0x00fff2);
        container.addChild(rightGun);
        
        // === ДЕКОРАТИВНІ ЕЛЕМЕНТИ ===
        // Антена
        const antenna = new Graphics();
        antenna.moveTo(25, 0);
        antenna.lineTo(25, -8);
        antenna.stroke({ width: 2, color: 0x666688 });
        antenna.circle(25, -10, 3);
        antenna.fill(0xff0066);
        container.addChild(antenna);
        
        // Бічні вогні
        this.leftLight = new Graphics();
        this.leftLight.circle(5, 35, 3);
        this.leftLight.fill(0x00ff00);
        container.addChild(this.leftLight);
        
        this.rightLight = new Graphics();
        this.rightLight.circle(45, 35, 3);
        this.rightLight.fill(0xff0000);
        container.addChild(this.rightLight);
        
        container.pivot.set(25, 25);
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    update(delta) {
        const input = this.game.inputHandler;
        this.animTime += delta * 0.1;
        
        // Рух
        let moving = false;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
            this.x -= this.speed * delta;
            this.targetTilt = -0.2;
            moving = true;
        } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
            this.x += this.speed * delta;
            this.targetTilt = 0.2;
            moving = true;
        } else {
            this.targetTilt = 0;
        }
        
        // Плавний нахил
        this.tiltAngle += (this.targetTilt - this.tiltAngle) * 0.15;
        this.container.rotation = this.tiltAngle;
        
        // Вертикальний рух
        if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) {
            this.y -= this.speed * delta;
            this.isBoosting = true;
        } else {
            this.isBoosting = false;
        }
        if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) {
            this.y += this.speed * delta * 0.7;
        }
        
        // Обмеження
        this.x = Math.max(30, Math.min(this.game.screenWidth - 30, this.x));
        this.y = Math.max(50, Math.min(this.game.screenHeight - 30, this.y));
        
        // Стрільба
        if (this.shootCooldown > 0) {
            this.shootCooldown -= delta;
        }
        
        if ((input.isKeyDown('Space') || input.isKeyDown('KeyZ')) && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootDelay;
        }
        
        // Оновлюємо позицію
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Анімації
        this.updateEngineAnimation(delta);
        this.updateLightsAnimation();
        this.updateGlowAnimation();
        
        // Мигання при пошкодженні
        if (this.isFlashing) {
            this.flashTimer -= delta;
            this.container.alpha = Math.sin(this.flashTimer * 2) > 0 ? 1 : 0.3;
            
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
                this.container.alpha = 1;
            }
        }
        
        // Оновлюємо апгрейди
        this.updateUpgrades(delta);
    }
    
    updateEngineAnimation(delta) {
        const baseHeight = this.isBoosting ? 25 : 15;
        const flicker = Math.sin(this.animTime * 20) * 0.3 + 0.7;
        const height = baseHeight + Math.sin(this.animTime * 25) * 5;
        
        // Ліве полум'я
        this.leftFlame.clear();
        this.leftFlame.moveTo(13, 50);
        this.leftFlame.lineTo(8, 50 + height);
        this.leftFlame.lineTo(18, 50);
        this.leftFlame.closePath();
        this.leftFlame.fill({ color: 0xff6600, alpha: flicker });
        
        this.leftFlame.moveTo(13, 50);
        this.leftFlame.lineTo(10, 50 + height * 0.7);
        this.leftFlame.lineTo(16, 50);
        this.leftFlame.closePath();
        this.leftFlame.fill({ color: 0xffff00, alpha: flicker });
        
        this.leftFlame.moveTo(13, 50);
        this.leftFlame.lineTo(12, 50 + height * 0.4);
        this.leftFlame.lineTo(14, 50);
        this.leftFlame.closePath();
        this.leftFlame.fill({ color: 0xffffff, alpha: flicker });
        
        // Праве полум'я
        this.rightFlame.clear();
        this.rightFlame.moveTo(37, 50);
        this.rightFlame.lineTo(32, 50 + height);
        this.rightFlame.lineTo(42, 50);
        this.rightFlame.closePath();
        this.rightFlame.fill({ color: 0xff6600, alpha: flicker });
        
        this.rightFlame.moveTo(37, 50);
        this.rightFlame.lineTo(34, 50 + height * 0.7);
        this.rightFlame.lineTo(40, 50);
        this.rightFlame.closePath();
        this.rightFlame.fill({ color: 0xffff00, alpha: flicker });
        
        this.rightFlame.moveTo(37, 50);
        this.rightFlame.lineTo(36, 50 + height * 0.4);
        this.rightFlame.lineTo(38, 50);
        this.rightFlame.closePath();
        this.rightFlame.fill({ color: 0xffffff, alpha: flicker });
    }
    
    updateLightsAnimation() {
        const blink = Math.sin(this.animTime * 3) > 0;
        this.leftLight.alpha = blink ? 1 : 0.3;
        this.rightLight.alpha = blink ? 0.3 : 1;
    }
    
    updateGlowAnimation() {
        const pulse = 0.8 + Math.sin(this.animTime * 2) * 0.2;
        this.glowOuter.alpha = 0.08 * pulse;
        this.glowInner.alpha = 0.15 * pulse;
        
        const scale = 1 + Math.sin(this.animTime * 3) * 0.05;
        this.glowOuter.scale.set(scale);
    }
    
    shoot() {
        // Базовий подвійний постріл
        this.game.shoot(this.x - 20, this.y - 15);
        this.game.shoot(this.x + 20, this.y - 15);
        
        // Triple Shot - додаткова куля по центру
        if (this.hasUpgrade('tripleShot')) {
            this.game.shoot(this.x, this.y - 20);
            // Бічні кулі під кутом
            this.game.shoot(this.x - 25, this.y - 10, -Math.PI / 2 - 0.2);
            this.game.shoot(this.x + 25, this.y - 10, -Math.PI / 2 + 0.2);
        }
        // Double Shot - швидша стрільба (вже в shootDelay)
        else if (this.hasUpgrade('doubleShot')) {
            this.game.shoot(this.x, this.y - 20);
        }
        
        // Ефект віддачі
        this.container.y += 2;
        
        // Частинки
        this.game.particles.createMuzzleFlash(this.x - 20, this.y - 20);
        this.game.particles.createMuzzleFlash(this.x + 20, this.y - 20);
        
        if (this.hasUpgrade('tripleShot') || this.hasUpgrade('doubleShot')) {
            this.game.particles.createMuzzleFlash(this.x, this.y - 25);
        }
    }
    
    flash() {
        this.isFlashing = true;
        this.flashTimer = 30;
    }
    
    // === СИСТЕМА АПГРЕЙДІВ ===
    
    createShieldSprite() {
        // Створюємо окремий контейнер для щита
        this.shieldContainer = new Container();
        
        this.shieldSprite = new Graphics();
        // Малюємо в центрі (0, 0)
        this.shieldSprite.circle(0, 0, 45);
        this.shieldSprite.stroke({ width: 3, color: 0x00ffff, alpha: 0.7 });
        this.shieldSprite.circle(0, 0, 40);
        this.shieldSprite.stroke({ width: 2, color: 0x00aaff, alpha: 0.4 });
        this.shieldSprite.circle(0, 0, 35);
        this.shieldSprite.fill({ color: 0x00ffff, alpha: 0.1 });
        
        // Додаткові декоративні елементи щита
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const x = Math.cos(angle) * 42;
            const y = Math.sin(angle) * 42;
            this.shieldSprite.circle(x, y, 4);
            this.shieldSprite.fill({ color: 0x00ffff, alpha: 0.8 });
        }
        
        this.shieldContainer.addChild(this.shieldSprite);
        this.shieldContainer.visible = false;
        
        // Додаємо до worldContainer гри (буде оновлюватись в update)
        this.shieldAddedToWorld = false;
    }
    
    addUpgrade(type, duration) {
        this.upgrades.set(type, {
            duration: duration,
            remaining: duration,
        });
        
        // Застосовуємо ефекти
        this.applyUpgradeEffects();
    }
    
    removeUpgrade(type) {
        this.upgrades.delete(type);
        this.applyUpgradeEffects();
    }
    
    hasUpgrade(type) {
        return this.upgrades.has(type);
    }
    
    getUpgradesList() {
        return Array.from(this.upgrades.keys());
    }
    
    applyUpgradeEffects() {
        // Швидкість
        if (this.hasUpgrade('speed')) {
            this.speed = this.baseSpeed * 1.5;
        } else {
            this.speed = this.baseSpeed;
        }
        
        // Швидкість стрільби
        if (this.hasUpgrade('doubleShot') || this.hasUpgrade('tripleShot')) {
            this.shootDelay = this.baseShootDelay * 0.6;
        } else {
            this.shootDelay = this.baseShootDelay;
        }
        
        // Візуальний щит
        if (this.shieldContainer) {
            this.shieldContainer.visible = this.hasUpgrade('shield');
        }
    }
    
    updateUpgrades(delta) {
        // Зменшуємо таймери апгрейдів
        for (const [type, data] of this.upgrades) {
            data.remaining -= delta;
            
            if (data.remaining <= 0) {
                this.upgrades.delete(type);
            }
        }
        
        // Оновлюємо ефекти
        this.applyUpgradeEffects();
        
        // Анімація щита - слідує за гравцем
        if (this.shieldContainer) {
            // Додаємо до світу якщо ще не додано
            if (!this.shieldAddedToWorld && this.game.worldContainer) {
                this.game.worldContainer.addChild(this.shieldContainer);
                this.shieldAddedToWorld = true;
            }
            
            // Оновлюємо позицію щита
            this.shieldContainer.x = this.x;
            this.shieldContainer.y = this.y;
            
            if (this.shieldContainer.visible) {
                this.shieldSprite.rotation += delta * 0.03;
                this.shieldContainer.alpha = 0.6 + Math.sin(this.animTime * 4) * 0.3;
                
                // Пульсація розміру
                const pulse = 1 + Math.sin(this.animTime * 5) * 0.05;
                this.shieldSprite.scale.set(pulse);
            }
        }
    }
}

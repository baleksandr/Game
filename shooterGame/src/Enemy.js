import { Container, Graphics } from 'pixi.js';

export class Enemy {
    constructor(game, x, y, type = 'basic') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'heavy') {
            this.width = 65;
            this.height = 55;
            this.health = 3;
            this.speed = 1.2;
            this.shootChance = 0.015;
        } else {
            this.width = 45;
            this.height = 40;
            this.health = 1;
            this.speed = 2.2;
            this.shootChance = 0.008;
        }
        
        this.velocityX = (Math.random() - 0.5) * 2;
        this.oscillation = Math.random() * Math.PI * 2;
        this.animTime = Math.random() * 100;
        
        this.container = this.createSprite();
    }
    
    createSprite() {
        const container = new Container();
        
        if (this.type === 'heavy') {
            this.createHeavyShip(container);
        } else {
            this.createBasicShip(container);
        }
        
        container.pivot.set(this.width / 2, this.height / 2);
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    createBasicShip(container) {
        // Світіння
        const glow = new Graphics();
        glow.circle(22, 20, 30);
        glow.fill({ color: 0xff00ff, alpha: 0.1 });
        container.addChild(glow);
        
        // Крила
        const leftWing = new Graphics();
        leftWing.moveTo(10, 15);
        leftWing.lineTo(-5, 35);
        leftWing.lineTo(0, 40);
        leftWing.lineTo(10, 30);
        leftWing.closePath();
        leftWing.fill(0x3a0a4e);
        leftWing.stroke({ width: 1, color: 0xff00ff });
        container.addChild(leftWing);
        
        const rightWing = new Graphics();
        rightWing.moveTo(35, 15);
        rightWing.lineTo(50, 35);
        rightWing.lineTo(45, 40);
        rightWing.lineTo(35, 30);
        rightWing.closePath();
        rightWing.fill(0x3a0a4e);
        rightWing.stroke({ width: 1, color: 0xff00ff });
        container.addChild(rightWing);
        
        // Корпус (інопланетний корабель)
        const body = new Graphics();
        body.moveTo(22, 40);      // Ніс (вниз)
        body.lineTo(40, 10);      // Правий кут
        body.lineTo(35, 5);       // Правий виріз
        body.lineTo(22, 12);      // Верхній виріз
        body.lineTo(10, 5);       // Лівий виріз
        body.lineTo(5, 10);       // Лівий кут
        body.closePath();
        body.fill(0x2a0a3e);
        body.stroke({ width: 2, color: 0xff00ff });
        container.addChild(body);
        
        // Панелі
        const panel = new Graphics();
        panel.moveTo(22, 35);
        panel.lineTo(32, 15);
        panel.lineTo(22, 10);
        panel.lineTo(12, 15);
        panel.closePath();
        panel.fill(0x4a1a5e);
        panel.stroke({ width: 1, color: 0xcc00cc });
        container.addChild(panel);
        
        // Кокпіт (око)
        const cockpit = new Graphics();
        cockpit.ellipse(22, 22, 8, 10);
        cockpit.fill(0x220022);
        cockpit.stroke({ width: 2, color: 0xff00ff });
        container.addChild(cockpit);
        
        // Зіниця
        this.pupil = new Graphics();
        this.pupil.circle(22, 22, 5);
        this.pupil.fill(0xff0066);
        container.addChild(this.pupil);
        
        // Блік
        const eyeGlow = new Graphics();
        eyeGlow.circle(20, 20, 2);
        eyeGlow.fill(0xffffff);
        container.addChild(eyeGlow);
        
        // Двигуни зверху
        this.engineLeft = new Graphics();
        container.addChild(this.engineLeft);
        
        this.engineRight = new Graphics();
        container.addChild(this.engineRight);
    }
    
    createHeavyShip(container) {
        // Велике світіння
        const glow = new Graphics();
        glow.circle(32, 28, 45);
        glow.fill({ color: 0x9d00ff, alpha: 0.12 });
        container.addChild(glow);
        
        // Бічні модулі
        const leftModule = new Graphics();
        leftModule.roundRect(-5, 15, 15, 30, 3);
        leftModule.fill(0x2a0a3e);
        leftModule.stroke({ width: 2, color: 0x9d00ff });
        container.addChild(leftModule);
        
        const rightModule = new Graphics();
        rightModule.roundRect(55, 15, 15, 30, 3);
        rightModule.fill(0x2a0a3e);
        rightModule.stroke({ width: 2, color: 0x9d00ff });
        container.addChild(rightModule);
        
        // Гармати на модулях
        const leftGun = new Graphics();
        leftGun.roundRect(-2, 35, 10, 20, 2);
        leftGun.fill(0x444466);
        leftGun.circle(3, 55, 4);
        leftGun.fill(0xff0066);
        container.addChild(leftGun);
        
        const rightGun = new Graphics();
        rightGun.roundRect(57, 35, 10, 20, 2);
        rightGun.fill(0x444466);
        rightGun.circle(62, 55, 4);
        rightGun.fill(0xff0066);
        container.addChild(rightGun);
        
        // Основний корпус
        const body = new Graphics();
        body.roundRect(10, 5, 45, 50, 8);
        body.fill(0x1a0a2e);
        body.stroke({ width: 3, color: 0x9d00ff });
        container.addChild(body);
        
        // Броньовані пластини
        const armor1 = new Graphics();
        armor1.roundRect(15, 10, 35, 18, 4);
        armor1.fill(0x3a1a4e);
        armor1.stroke({ width: 1, color: 0x6600aa });
        container.addChild(armor1);
        
        const armor2 = new Graphics();
        armor2.roundRect(15, 32, 35, 18, 4);
        armor2.fill(0x3a1a4e);
        armor2.stroke({ width: 1, color: 0x6600aa });
        container.addChild(armor2);
        
        // Центральний кокпіт
        const cockpitOuter = new Graphics();
        cockpitOuter.ellipse(32, 28, 12, 15);
        cockpitOuter.fill(0x110011);
        cockpitOuter.stroke({ width: 3, color: 0xcc66ff });
        container.addChild(cockpitOuter);
        
        const cockpitInner = new Graphics();
        cockpitInner.ellipse(32, 28, 8, 11);
        cockpitInner.fill(0x9d00ff);
        container.addChild(cockpitInner);
        
        // Око всередині
        this.pupil = new Graphics();
        this.pupil.circle(32, 28, 5);
        this.pupil.fill(0xff00ff);
        container.addChild(this.pupil);
        
        const eyeGlow = new Graphics();
        eyeGlow.circle(29, 25, 3);
        eyeGlow.fill(0xffffff);
        container.addChild(eyeGlow);
        
        // Декоративні вогні
        this.light1 = new Graphics();
        this.light1.circle(20, 12, 3);
        this.light1.fill(0xff0066);
        container.addChild(this.light1);
        
        this.light2 = new Graphics();
        this.light2.circle(44, 12, 3);
        this.light2.fill(0xff0066);
        container.addChild(this.light2);
        
        this.light3 = new Graphics();
        this.light3.circle(20, 48, 3);
        this.light3.fill(0x00ffff);
        container.addChild(this.light3);
        
        this.light4 = new Graphics();
        this.light4.circle(44, 48, 3);
        this.light4.fill(0x00ffff);
        container.addChild(this.light4);
        
        // Двигуни
        this.engineLeft = new Graphics();
        container.addChild(this.engineLeft);
        
        this.engineRight = new Graphics();
        container.addChild(this.engineRight);
    }
    
    update(delta) {
        this.animTime += delta * 0.1;
        
        // Рух вниз
        this.y += this.speed * delta;
        
        // Коливальний рух
        this.oscillation += delta * 0.05;
        this.x += Math.sin(this.oscillation) * this.velocityX * delta;
        
        // Обмеження
        if (this.x < 30) {
            this.x = 30;
            this.velocityX *= -1;
        }
        if (this.x > this.game.screenWidth - 30) {
            this.x = this.game.screenWidth - 30;
            this.velocityX *= -1;
        }
        
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Легке обертання
        this.container.rotation = Math.sin(this.oscillation) * 0.15;
        
        // Анімація ока (слідкує за гравцем)
        this.updateEyeTracking();
        
        // Анімація двигунів
        this.updateEngineAnimation();
        
        // Анімація вогнів (для heavy)
        if (this.type === 'heavy') {
            this.updateLightsAnimation();
        }
        
        // Стрільба
        if (Math.random() < this.shootChance && this.y > 50 && this.y < this.game.screenHeight - 100) {
            this.shoot();
        }
    }
    
    updateEyeTracking() {
        if (!this.pupil) return;
        
        // Зіниця дивиться на гравця
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const distance = 3;
        
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        
        if (this.type === 'heavy') {
            this.pupil.x = offsetX;
            this.pupil.y = offsetY;
        } else {
            this.pupil.x = offsetX;
            this.pupil.y = offsetY;
        }
    }
    
    updateEngineAnimation() {
        if (!this.engineLeft || !this.engineRight) return;
        
        const flicker = Math.sin(this.animTime * 15) * 0.3 + 0.7;
        const height = 8 + Math.sin(this.animTime * 20) * 3;
        
        if (this.type === 'heavy') {
            // Двигуни для важкого корабля
            this.engineLeft.clear();
            this.engineLeft.moveTo(3, 0);
            this.engineLeft.lineTo(-2, -height);
            this.engineLeft.lineTo(8, 0);
            this.engineLeft.closePath();
            this.engineLeft.fill({ color: 0xff00ff, alpha: flicker });
            
            this.engineRight.clear();
            this.engineRight.moveTo(62, 0);
            this.engineRight.lineTo(57, -height);
            this.engineRight.lineTo(67, 0);
            this.engineRight.closePath();
            this.engineRight.fill({ color: 0xff00ff, alpha: flicker });
        } else {
            // Двигуни для базового
            this.engineLeft.clear();
            this.engineLeft.moveTo(12, 5);
            this.engineLeft.lineTo(10, -height);
            this.engineLeft.lineTo(14, 5);
            this.engineLeft.closePath();
            this.engineLeft.fill({ color: 0xff00ff, alpha: flicker });
            
            this.engineRight.clear();
            this.engineRight.moveTo(32, 5);
            this.engineRight.lineTo(30, -height);
            this.engineRight.lineTo(34, 5);
            this.engineRight.closePath();
            this.engineRight.fill({ color: 0xff00ff, alpha: flicker });
        }
    }
    
    updateLightsAnimation() {
        const blink1 = Math.sin(this.animTime * 4) > 0;
        const blink2 = Math.sin(this.animTime * 4 + Math.PI) > 0;
        
        if (this.light1) this.light1.alpha = blink1 ? 1 : 0.3;
        if (this.light2) this.light2.alpha = blink1 ? 1 : 0.3;
        if (this.light3) this.light3.alpha = blink2 ? 1 : 0.3;
        if (this.light4) this.light4.alpha = blink2 ? 1 : 0.3;
    }
    
    shoot() {
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        if (this.type === 'heavy') {
            // Три постріли
            this.game.enemyShoot(this.x - 30, this.y + 25, Math.PI / 2);
            this.game.enemyShoot(this.x, this.y + this.height / 2, angle);
            this.game.enemyShoot(this.x + 30, this.y + 25, Math.PI / 2);
        } else {
            this.game.enemyShoot(this.x, this.y + this.height / 2, angle);
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Ефект попадання - мигання
        this.container.alpha = 0.5;
        setTimeout(() => {
            if (this.container) {
                this.container.alpha = 1;
            }
        }, 50);
        
        return this.health <= 0;
    }
}

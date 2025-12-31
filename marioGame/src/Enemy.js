import { Graphics, Container } from 'pixi.js';

export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        
        this.velocityX = -1.5;
        this.isDead = false;
        this.animProgress = 0;
        
        this.patrolStart = x - 100;
        this.patrolEnd = x + 100;
        
        this.sprite = this.createSprite();
    }
    
    createSprite() {
        const container = new Container();
        
        // Тіло гумби (гриб-ворог)
        const body = new Graphics();
        body.ellipse(16, 24, 16, 12);
        body.fill(0x8b4513);
        container.addChild(body);
        
        // Голова
        const head = new Graphics();
        head.ellipse(16, 12, 18, 14);
        head.fill(0xcd853f);
        container.addChild(head);
        
        // Обличчя - злі брови
        const browLeft = new Graphics();
        browLeft.moveTo(6, 8);
        browLeft.lineTo(14, 12);
        browLeft.stroke({ width: 3, color: 0x000000 });
        container.addChild(browLeft);
        
        const browRight = new Graphics();
        browRight.moveTo(26, 8);
        browRight.lineTo(18, 12);
        browRight.stroke({ width: 3, color: 0x000000 });
        container.addChild(browRight);
        
        // Очі
        const eyeLeft = new Graphics();
        eyeLeft.circle(10, 14, 3);
        eyeLeft.fill(0xffffff);
        eyeLeft.circle(11, 14, 1.5);
        eyeLeft.fill(0x000000);
        container.addChild(eyeLeft);
        
        const eyeRight = new Graphics();
        eyeRight.circle(22, 14, 3);
        eyeRight.fill(0xffffff);
        eyeRight.circle(21, 14, 1.5);
        eyeRight.fill(0x000000);
        container.addChild(eyeRight);
        
        // Ніжки
        this.leftFoot = new Graphics();
        this.leftFoot.ellipse(8, 32, 6, 4);
        this.leftFoot.fill(0x2f1a0a);
        container.addChild(this.leftFoot);
        
        this.rightFoot = new Graphics();
        this.rightFoot.ellipse(24, 32, 6, 4);
        this.rightFoot.fill(0x2f1a0a);
        container.addChild(this.rightFoot);
        
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    update(delta) {
        if (this.isDead) return;
        
        // Рух
        this.x += this.velocityX * delta;
        
        // Патрулювання - змінюємо напрямок на краях
        if (this.x <= this.patrolStart || this.x >= this.patrolEnd) {
            this.velocityX *= -1;
        }
        
        // Перевіряємо колізії з платформами
        let onGround = false;
        this.game.platforms.forEach(platform => {
            if (this.x + this.width > platform.x && 
                this.x < platform.x + platform.width &&
                this.y + this.height >= platform.y &&
                this.y + this.height <= platform.y + 20) {
                onGround = true;
            }
        });
        
        // Якщо на краю платформи - повертаємось
        if (!onGround) {
            // Спробуємо знайти землю попереду
            let groundAhead = false;
            this.game.platforms.forEach(platform => {
                const checkX = this.velocityX > 0 ? this.x + this.width + 5 : this.x - 5;
                if (checkX > platform.x && 
                    checkX < platform.x + platform.width &&
                    Math.abs((this.y + this.height) - platform.y) < 10) {
                    groundAhead = true;
                }
            });
            
            if (!groundAhead) {
                this.velocityX *= -1;
            }
        }
        
        // Анімація ходьби
        this.animProgress += delta * 0.2;
        
        // Рух ніжок
        const footOffset = Math.sin(this.animProgress * 5) * 3;
        if (this.leftFoot && this.rightFoot) {
            this.leftFoot.y = 32 + footOffset;
            this.rightFoot.y = 32 - footOffset;
        }
        
        // Напрямок спрайта
        this.sprite.scale.x = this.velocityX > 0 ? -1 : 1;
        if (this.velocityX > 0) {
            this.sprite.pivot.x = this.width;
        } else {
            this.sprite.pivot.x = 0;
        }
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    die() {
        this.isDead = true;
        
        // Анімація смерті - сплющування
        let animProgress = 0;
        
        const animate = () => {
            animProgress += 0.15;
            
            this.sprite.scale.y = 1 - animProgress * 0.8;
            this.sprite.y = this.y + animProgress * 20;
            this.sprite.alpha = 1 - animProgress;
            
            if (animProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.sprite.visible = false;
            }
        };
        
        animate();
    }
}
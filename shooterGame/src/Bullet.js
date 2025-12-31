import { Graphics } from 'pixi.js';

export class Bullet {
    constructor(game, x, y, angle, owner = 'player') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
        
        if (owner === 'player') {
            this.speed = 15;
            this.damage = 1;
            this.width = 6;
            this.height = 20;
            this.color = 0x00fff2;
        } else {
            this.speed = 8;
            this.damage = 10;
            this.width = 8;
            this.height = 16;
            this.color = 0xff00ff;
        }
        
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
        
        this.sprite = this.createSprite();
    }
    
    createSprite() {
        const bullet = new Graphics();
        
        if (this.owner === 'player') {
            // Лазерний промінь
            bullet.roundRect(-3, -10, 6, 20, 3);
            bullet.fill(this.color);
            
            // Світіння
            bullet.roundRect(-5, -12, 10, 24, 5);
            bullet.fill({ color: this.color, alpha: 0.3 });
            
            // Серцевина
            bullet.roundRect(-1, -8, 2, 16, 1);
            bullet.fill(0xffffff);
        } else {
            // Ворожа куля - плазма
            bullet.circle(0, 0, 8);
            bullet.fill({ color: 0xff00ff, alpha: 0.5 });
            
            bullet.circle(0, 0, 5);
            bullet.fill(0xff00ff);
            
            bullet.circle(0, 0, 2);
            bullet.fill(0xffffff);
        }
        
        bullet.x = this.x;
        bullet.y = this.y;
        bullet.rotation = this.angle + Math.PI / 2;
        
        return bullet;
    }
    
    update(delta) {
        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Пульсація для ворожих куль
        if (this.owner === 'enemy') {
            const scale = 1 + Math.sin(Date.now() / 50) * 0.2;
            this.sprite.scale.set(scale);
        }
    }
}


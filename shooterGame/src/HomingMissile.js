import { Graphics } from 'pixi.js';

export class HomingMissile {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 8;
        this.turnRate = 0.08;
        this.damage = 6;
        this.width = 14;
        this.height = 32;
        this.angle = -Math.PI / 2;
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        this.sprite = this.createSprite();
    }

    createSprite() {
        const g = new Graphics();
        // Корпус ракети
        g.roundRect(-7, -16, 14, 32, 6);
        g.fill(0xffcc00);
        // Носик
        g.roundRect(-4, -18, 8, 12, 4);
        g.fill(0xff6600);
        // Полум'я (трикутник через moveTo/lineTo)
        g.moveTo(-3, 16);
        g.lineTo(3, 16);
        g.lineTo(0, 26);
        g.closePath();
        g.fill(0xff3300);
        g.x = this.x;
        g.y = this.y;
        g.rotation = this.angle + Math.PI / 2;
        return g;
    }

    findTarget() {
        let best = null;
        let bestDist = Infinity;
        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) {
                bestDist = dist;
                best = enemy;
            }
        }
        return best;
    }

    update(delta) {
        const target = this.findTarget();
        if (target) {
            const desiredAngle = Math.atan2(target.y - this.y, target.x - this.x);
            // обмежуємо швидкість повороту
            let diff = desiredAngle - this.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            diff = Math.max(-this.turnRate, Math.min(this.turnRate, diff));
            this.angle += diff;
            this.velocityX = Math.cos(this.angle) * this.speed;
            this.velocityY = Math.sin(this.angle) * this.speed;
        }

        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;

        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.rotation = this.angle + Math.PI / 2;
    }
}



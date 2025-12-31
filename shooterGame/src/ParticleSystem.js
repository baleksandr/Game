import { Container, Graphics } from 'pixi.js';

export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.particles = [];
    }
    
    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Оновлюємо позицію
            particle.x += particle.velocityX * delta;
            particle.y += particle.velocityY * delta;
            
            // Гравітація (якщо є)
            if (particle.gravity) {
                particle.velocityY += particle.gravity * delta;
            }
            
            // Час життя
            particle.life -= delta;
            particle.sprite.alpha = Math.max(0, particle.life / particle.maxLife);
            
            // Зменшення розміру
            if (particle.shrink) {
                const scale = particle.life / particle.maxLife;
                particle.sprite.scale.set(scale * particle.initialScale);
            }
            
            // Збільшення розміру (для диму)
            if (particle.grow) {
                const scale = 1 + (1 - particle.life / particle.maxLife) * 0.5;
                particle.sprite.scale.set(scale);
            }
            
            // Оновлюємо позицію спрайта
            particle.sprite.x = particle.x;
            particle.sprite.y = particle.y;
            
            // Видаляємо мертві частинки
            if (particle.life <= 0) {
                this.container.removeChild(particle.sprite);
                this.particles.splice(i, 1);
            }
        }
    }
    
    createExplosion(x, y, count = 40) {
        // Основні частинки вибуху
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 3 + Math.random() * 7;
            const size = 3 + Math.random() * 6;
            
            // Кольори вибуху - неоновий стиль
            const colors = [0xff6600, 0xff0066, 0xffff00, 0xff3300, 0xffffff, 0x00ffff];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const sprite = new Graphics();
            sprite.circle(0, 0, size);
            sprite.fill(color);
            
            // Світіння
            sprite.circle(0, 0, size * 2);
            sprite.fill({ color, alpha: 0.4 });
            
            sprite.x = x;
            sprite.y = y;
            
            this.container.addChild(sprite);
            
            this.particles.push({
                sprite,
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                gravity: 0.15,
                life: 35 + Math.random() * 25,
                maxLife: 60,
                shrink: true,
                initialScale: 1,
            });
        }
        
        // Хвиля вибуху (розширюється)
        this.createShockwave(x, y);
        
        // Центральний спалах
        const flash = new Graphics();
        flash.circle(0, 0, 50);
        flash.fill({ color: 0xffffff, alpha: 0.9 });
        flash.circle(0, 0, 35);
        flash.fill({ color: 0xffff00, alpha: 0.8 });
        flash.x = x;
        flash.y = y;
        
        this.container.addChild(flash);
        
        this.particles.push({
            sprite: flash,
            x,
            y,
            velocityX: 0,
            velocityY: 0,
            life: 12,
            maxLife: 12,
            shrink: true,
            initialScale: 1,
        });
        
        // Димові частинки
        this.createSmoke(x, y, 8);
    }
    
    createShockwave(x, y) {
        const ring = new Graphics();
        ring.circle(0, 0, 10);
        ring.stroke({ width: 4, color: 0x00ffff, alpha: 0.8 });
        ring.x = x;
        ring.y = y;
        
        this.container.addChild(ring);
        
        // Анімація розширення
        let scale = 1;
        const expandRing = () => {
            scale += 0.3;
            ring.scale.set(scale);
            ring.alpha = Math.max(0, 1 - scale / 8);
            
            if (ring.alpha > 0) {
                requestAnimationFrame(expandRing);
            } else {
                this.container.removeChild(ring);
            }
        };
        expandRing();
    }
    
    createSmoke(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            const size = 10 + Math.random() * 15;
            
            const smoke = new Graphics();
            smoke.circle(0, 0, size);
            smoke.fill({ color: 0x444444, alpha: 0.4 });
            smoke.x = x + offsetX;
            smoke.y = y + offsetY;
            
            this.container.addChild(smoke);
            
            this.particles.push({
                sprite: smoke,
                x: x + offsetX,
                y: y + offsetY,
                velocityX: (Math.random() - 0.5) * 0.5,
                velocityY: -0.5 - Math.random() * 1,
                life: 40 + Math.random() * 30,
                maxLife: 70,
                shrink: false,
                initialScale: 1,
                grow: true, // Дим розширюється
            });
        }
    }
    
    createHitEffect(x, y, color = 0x00ffff) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 2 + Math.random() * 3;
            
            const sprite = new Graphics();
            sprite.circle(0, 0, size);
            sprite.fill(color);
            
            sprite.x = x;
            sprite.y = y;
            
            this.container.addChild(sprite);
            
            this.particles.push({
                sprite,
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 15 + Math.random() * 10,
                maxLife: 25,
                shrink: true,
                initialScale: 1,
            });
        }
    }
    
    createMuzzleFlash(x, y) {
        // Спалах від пострілу
        const flash = new Graphics();
        flash.ellipse(0, 0, 8, 15);
        flash.fill({ color: 0x00fff2, alpha: 0.8 });
        flash.x = x;
        flash.y = y;
        
        this.container.addChild(flash);
        
        this.particles.push({
            sprite: flash,
            x,
            y,
            velocityX: 0,
            velocityY: -2,
            life: 5,
            maxLife: 5,
            shrink: true,
            initialScale: 1,
        });
        
        // Іскри
        for (let i = 0; i < 4; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            const speed = 3 + Math.random() * 2;
            
            const spark = new Graphics();
            spark.circle(0, 0, 2);
            spark.fill(0x88ffff);
            spark.x = x;
            spark.y = y;
            
            this.container.addChild(spark);
            
            this.particles.push({
                sprite: spark,
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 8,
                maxLife: 8,
                shrink: true,
                initialScale: 1,
            });
        }
    }
    
    createTrail(x, y, color = 0x00fff2) {
        const trail = new Graphics();
        trail.circle(0, 0, 3);
        trail.fill({ color, alpha: 0.5 });
        trail.x = x;
        trail.y = y;
        
        this.container.addChild(trail);
        
        this.particles.push({
            sprite: trail,
            x,
            y,
            velocityX: 0,
            velocityY: 1,
            life: 10,
            maxLife: 10,
            shrink: true,
            initialScale: 1,
        });
    }
}


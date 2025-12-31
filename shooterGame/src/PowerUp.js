import { Container, Graphics } from 'pixi.js';

export class PowerUp {
    constructor(game, x, y, type = 'random') {
        this.game = game;
        this.x = x;
        this.y = y;
        
        // Типи апгрейдів
        const types = ['shield', 'doubleShot', 'tripleShot', 'speed', 'health'];
        this.type = type === 'random' ? types[Math.floor(Math.random() * types.length)] : type;
        
        this.width = 30;
        this.height = 30;
        this.speed = 1.5;
        this.collected = false;
        
        this.animTime = Math.random() * 100;
        this.oscillation = Math.random() * Math.PI * 2;
        
        this.container = this.createSprite();
    }
    
    getConfig() {
        const configs = {
            shield: {
                color: 0x00ffff,
                icon: '🛡️',
                name: 'SHIELD',
                duration: 600, // 10 секунд
            },
            doubleShot: {
                color: 0xff6600,
                icon: '🔥',
                name: 'DOUBLE',
                duration: 480,
            },
            tripleShot: {
                color: 0xff00ff,
                icon: '⚡',
                name: 'TRIPLE',
                duration: 360,
            },
            speed: {
                color: 0x00ff00,
                icon: '💨',
                name: 'SPEED',
                duration: 480,
            },
            health: {
                color: 0xff0066,
                icon: '❤️',
                name: 'HEALTH',
                duration: 0, // Миттєвий ефект
            },
        };
        return configs[this.type];
    }
    
    createSprite() {
        const container = new Container();
        const config = this.getConfig();
        
        // Зовнішнє світіння (пульсуюче)
        this.glowOuter = new Graphics();
        this.glowOuter.circle(0, 0, 25);
        this.glowOuter.fill({ color: config.color, alpha: 0.2 });
        container.addChild(this.glowOuter);
        
        // Середнє світіння
        this.glowMiddle = new Graphics();
        this.glowMiddle.circle(0, 0, 18);
        this.glowMiddle.fill({ color: config.color, alpha: 0.3 });
        container.addChild(this.glowMiddle);
        
        // Основа (коробка/капсула)
        const base = new Graphics();
        base.roundRect(-15, -15, 30, 30, 8);
        base.fill(0x1a1a3e);
        base.stroke({ width: 3, color: config.color });
        container.addChild(base);
        
        // Внутрішня панель
        const inner = new Graphics();
        inner.roundRect(-10, -10, 20, 20, 5);
        inner.fill({ color: config.color, alpha: 0.3 });
        container.addChild(inner);
        
        // Іконка в центрі
        this.createIcon(container, config);
        
        // Обертові частинки навколо
        this.orbitParticles = [];
        for (let i = 0; i < 4; i++) {
            const particle = new Graphics();
            particle.circle(0, 0, 3);
            particle.fill(config.color);
            container.addChild(particle);
            this.orbitParticles.push({
                sprite: particle,
                angle: (Math.PI * 2 / 4) * i,
                radius: 20,
            });
        }
        
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    createIcon(container, config) {
        // Спеціальна іконка для кожного типу
        const icon = new Graphics();
        
        switch (this.type) {
            case 'shield':
                // Щит
                icon.moveTo(0, -8);
                icon.lineTo(8, -4);
                icon.lineTo(8, 4);
                icon.lineTo(0, 10);
                icon.lineTo(-8, 4);
                icon.lineTo(-8, -4);
                icon.closePath();
                icon.fill(config.color);
                icon.stroke({ width: 1, color: 0xffffff });
                break;
                
            case 'doubleShot':
                // Дві кулі
                icon.rect(-6, -8, 4, 16);
                icon.fill(config.color);
                icon.rect(2, -8, 4, 16);
                icon.fill(config.color);
                break;
                
            case 'tripleShot':
                // Три промені
                icon.moveTo(0, -8);
                icon.lineTo(0, 8);
                icon.stroke({ width: 3, color: config.color });
                icon.moveTo(-6, -4);
                icon.lineTo(-6, 8);
                icon.stroke({ width: 2, color: config.color });
                icon.moveTo(6, -4);
                icon.lineTo(6, 8);
                icon.stroke({ width: 2, color: config.color });
                break;
                
            case 'speed':
                // Стрілка швидкості
                icon.moveTo(0, -8);
                icon.lineTo(8, 0);
                icon.lineTo(3, 0);
                icon.lineTo(3, 8);
                icon.lineTo(-3, 8);
                icon.lineTo(-3, 0);
                icon.lineTo(-8, 0);
                icon.closePath();
                icon.fill(config.color);
                break;
                
            case 'health':
                // Серце/хрест
                icon.rect(-2, -8, 4, 16);
                icon.fill(config.color);
                icon.rect(-8, -2, 16, 4);
                icon.fill(config.color);
                break;
        }
        
        container.addChild(icon);
    }
    
    update(delta) {
        if (this.collected) return;
        
        this.animTime += delta * 0.1;
        this.oscillation += delta * 0.03;
        
        // Рух вниз з коливанням
        this.y += this.speed * delta;
        this.x += Math.sin(this.oscillation) * 0.5;
        
        // Оновлюємо позицію
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Пульсуюче світіння
        const pulse = 0.8 + Math.sin(this.animTime * 3) * 0.4;
        this.glowOuter.scale.set(pulse);
        this.glowOuter.alpha = 0.2 * pulse;
        this.glowMiddle.alpha = 0.3 * pulse;
        
        // Обертання контейнера
        this.container.rotation = Math.sin(this.animTime) * 0.1;
        
        // Обертання частинок навколо
        this.orbitParticles.forEach((p, i) => {
            p.angle += delta * 0.1;
            p.sprite.x = Math.cos(p.angle) * p.radius;
            p.sprite.y = Math.sin(p.angle) * p.radius;
            p.sprite.alpha = 0.5 + Math.sin(this.animTime * 2 + i) * 0.5;
        });
    }
    
    collect() {
        if (this.collected) return;
        this.collected = true;
        
        // Анімація збору
        let progress = 0;
        const config = this.getConfig();
        
        // Створюємо частинки при зборі
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            this.game.particles.createHitEffect(
                this.x + Math.cos(angle) * 10,
                this.y + Math.sin(angle) * 10,
                config.color
            );
        }
        
        const animate = () => {
            progress += 0.15;
            
            this.container.scale.set(1 + progress * 0.5);
            this.container.alpha = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.container.visible = false;
            }
        };
        
        animate();
    }
}


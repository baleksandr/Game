import { Container, Graphics } from 'pixi.js';

export class PowerUp {
    constructor(game, x, y, type = 'random') {
        this.game = game;
        this.x = x;
        this.y = y;
        
        // Вибір типу з урахуванням рівня
        if (type === 'random') {
            this.type = this.selectRandomType();
        } else {
            this.type = type;
        }
        
        this.width = 30;
        this.height = 30;
        this.speed = 1.5;
        this.collected = false;
        
        this.animTime = Math.random() * 100;
        this.oscillation = Math.random() * Math.PI * 2;
        
        // Властивості для бонусів рівня та куплених апгрейдів
        this.isLevelBonus = false;
        this.isPurchased = false;
        this.lifeTime = undefined;
        
        this.container = this.createSprite();
    }
    
    selectRandomType() {
        // Базові типи апгрейдів
        const types = ['shield', 'doubleShot', 'tripleShot', 'speed', 'health'];
        
        // Шанс health зменшується з кожним рівнем
        const level = this.game.level || 1;
        const healthChance = Math.max(0.05, 0.3 - (level - 1) * 0.03); // Від 30% до 5%
        
        // Випадкове число для визначення типу
        const rand = Math.random();
        
        if (rand < healthChance) {
            return 'health';
        }
        
        // Решта типів розподіляються рівномірно
        const otherTypes = types.filter(t => t !== 'health');
        return otherTypes[Math.floor(Math.random() * otherTypes.length)];
    }
    
    getConfig() {
        const configs = {
            shield: {
                color: 0x00ffff,
                icon: '🛡️',
                name: 'SHIELD',
                duration: 600, // 10 секунд
                permanent: false,
            },
            doubleShot: {
                color: 0xff6600,
                icon: '🔥',
                name: 'DOUBLE',
                duration: 480,
                permanent: false,
            },
            tripleShot: {
                color: 0xff00ff,
                icon: '⚡',
                name: 'TRIPLE',
                duration: 360,
                permanent: false,
            },
            speed: {
                color: 0x00ff00,
                icon: '💨',
                name: 'SPEED',
                duration: 480,
                permanent: false,
            },
            health: {
                color: 0xff0066,
                icon: '❤️',
                name: 'HEALTH',
                duration: 0, // Миттєвий ефект
                permanent: false,
            },
            // Перманентні апгрейди
            guns: {
                color: 0xff8c42,
                icon: '🔫',
                name: 'GUNS UP!',
                duration: 0,
                permanent: true,
            },
            blasters: {
                color: 0xc040ff,
                icon: '⚡',
                name: 'BLASTERS!',
                duration: 0,
                permanent: true,
            },
            missiles: {
                color: 0xffc400,
                icon: '🚀',
                name: 'MISSILES!',
                duration: 0,
                permanent: true,
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
                
            case 'guns':
                // Пушки - дві гармати
                icon.roundRect(-7, -6, 5, 12, 2);
                icon.fill(config.color);
                icon.roundRect(2, -6, 5, 12, 2);
                icon.fill(config.color);
                icon.circle(-4, -8, 3);
                icon.fill(0xffffff);
                icon.circle(5, -8, 3);
                icon.fill(0xffffff);
                break;
                
            case 'blasters':
                // Бластери - три промені під кутом
                icon.moveTo(0, -10);
                icon.lineTo(0, 6);
                icon.stroke({ width: 3, color: config.color });
                icon.moveTo(-8, -6);
                icon.lineTo(-4, 6);
                icon.stroke({ width: 2, color: config.color });
                icon.moveTo(8, -6);
                icon.lineTo(4, 6);
                icon.stroke({ width: 2, color: config.color });
                break;
                
            case 'missiles':
                // Ракета
                icon.roundRect(-3, -10, 6, 16, 3);
                icon.fill(config.color);
                icon.moveTo(-4, 6);
                icon.lineTo(0, 10);
                icon.lineTo(4, 6);
                icon.closePath();
                icon.fill(0xff3300);
                icon.circle(0, -6, 3);
                icon.fill(0xffffff);
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


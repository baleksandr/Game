import { Graphics, Container, Sprite, Assets } from 'pixi.js';

export class Mushroom {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        
        this.velocityX = 2; // Рухається вправо
        this.velocityY = 0;
        
        this.collected = false;
        this.isSpawning = true;
        this.spawnProgress = 0;
        
        this.sprite = this.createSprite();
        this.loadTexture();
    }
    
    createSprite() {
        const container = new Container();
        
        // Placeholder (замінимо на текстуру)
        this.mushroomGraphics = new Graphics();
        
        // Шапка гриба
        this.mushroomGraphics.ellipse(14, 8, 14, 10);
        this.mushroomGraphics.fill(0xff0000);
        
        // Білі крапки
        this.mushroomGraphics.circle(8, 6, 4);
        this.mushroomGraphics.fill(0xffffff);
        this.mushroomGraphics.circle(18, 8, 3);
        this.mushroomGraphics.fill(0xffffff);
        
        // Ніжка
        this.mushroomGraphics.roundRect(6, 14, 16, 14, 4);
        this.mushroomGraphics.fill(0xf5deb3);
        
        // Очі
        this.mushroomGraphics.circle(10, 20, 2);
        this.mushroomGraphics.fill(0x000000);
        this.mushroomGraphics.circle(18, 20, 2);
        this.mushroomGraphics.fill(0x000000);
        
        container.addChild(this.mushroomGraphics);
        
        container.x = this.x - this.width / 2;
        container.y = this.y;
        
        // Ховаємо на початку для анімації появи
        container.y = this.y + this.height;
        
        return container;
    }
    
    async loadTexture() {
        try {
            const texture = await Assets.load('img/mashroom.png');
            
            this.mushroomSprite = new Sprite(texture);
            this.mushroomSprite.width = this.width;
            this.mushroomSprite.height = this.height;
            
            this.sprite.removeChild(this.mushroomGraphics);
            this.sprite.addChild(this.mushroomSprite);
            
            console.log('🍄 Mushroom texture loaded!');
        } catch (error) {
            console.log('Using fallback mushroom graphics');
        }
    }
    
    update(delta) {
        if (this.collected) return;
        
        // Анімація появи з блоку
        if (this.isSpawning) {
            this.spawnProgress += delta * 0.05;
            this.sprite.y = this.y + this.height * (1 - this.spawnProgress);
            
            if (this.spawnProgress >= 1) {
                this.isSpawning = false;
                this.sprite.y = this.y;
            }
            return;
        }
        
        // Гравітація
        this.velocityY += this.game.gravity * delta;
        if (this.velocityY > 10) this.velocityY = 10;
        
        // Рух
        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;
        
        // Колізії з платформами
        this.game.platforms.forEach(platform => {
            if (!platform.isActive) return;
            
            const mushroomBottom = this.y + this.height;
            const mushroomLeft = this.x - this.width / 2;
            const mushroomRight = this.x + this.width / 2;
            
            const platTop = platform.y;
            const platBottom = platform.y + platform.height;
            const platLeft = platform.x;
            const platRight = platform.x + platform.width;
            
            // Падіння на платформу
            if (mushroomRight > platLeft && mushroomLeft < platRight) {
                if (mushroomBottom >= platTop && mushroomBottom <= platTop + 15 && this.velocityY > 0) {
                    this.y = platTop - this.height;
                    this.velocityY = 0;
                }
            }
            
            // Бокова колізія - змінюємо напрямок
            if (this.y + this.height > platTop + 5 && this.y < platBottom - 5) {
                if (mushroomRight >= platLeft && mushroomRight <= platLeft + 10 && this.velocityX > 0) {
                    this.velocityX = -this.velocityX;
                }
                if (mushroomLeft <= platRight && mushroomLeft >= platRight - 10 && this.velocityX < 0) {
                    this.velocityX = -this.velocityX;
                }
            }
        });
        
        // Оновлюємо позицію спрайта
        this.sprite.x = this.x - this.width / 2;
        this.sprite.y = this.y;
        
        // Видаляємо якщо впав за екран
        if (this.y > this.game.screenHeight + 50) {
            this.collected = true;
            this.sprite.visible = false;
        }
    }
    
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        
        // Анімація збору
        let animProgress = 0;
        const startY = this.sprite.y;
        
        const animate = () => {
            animProgress += 0.15;
            
            this.sprite.y = startY - animProgress * 20;
            this.sprite.alpha = 1 - animProgress;
            this.sprite.scale.set(1 + animProgress * 0.3);
            
            if (animProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.sprite.visible = false;
            }
        };
        
        animate();
    }
    
    /**
     * Перевірка колізії з гравцем
     */
    checkPlayerCollision(player) {
        if (this.collected || this.isSpawning) return false;
        
        const dx = player.x + player.width / 2 - this.x;
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 30;
    }
}
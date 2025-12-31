import { Graphics, Container } from 'pixi.js';

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
    }
    
    createSprite() {
        const container = new Container();
        
        // 🍄 Малюємо гриб вручну!
        this.mushroomGraphics = new Graphics();
        
        // === ШАПКА ГРИБА (червона) ===
        this.mushroomGraphics.ellipse(14, 10, 14, 12);
        this.mushroomGraphics.fill(0xe52521);
        
        // Темніший контур шапки
        this.mushroomGraphics.ellipse(14, 10, 14, 12);
        this.mushroomGraphics.stroke({ width: 2, color: 0xb71c1c });
        
        // === БІЛІ ПЛЯМИ НА ШАПЦІ ===
        this.mushroomGraphics.ellipse(7, 6, 5, 4);
        this.mushroomGraphics.fill(0xffffff);
        
        this.mushroomGraphics.ellipse(20, 8, 4, 3);
        this.mushroomGraphics.fill(0xffffff);
        
        this.mushroomGraphics.ellipse(12, 14, 3, 2);
        this.mushroomGraphics.fill(0xffffff);
        
        // === НІЖКА (бежева/біла) ===
        this.mushroomGraphics.roundRect(6, 18, 16, 10, 3);
        this.mushroomGraphics.fill(0xfff8e7);
        
        // Контур ніжки
        this.mushroomGraphics.roundRect(6, 18, 16, 10, 3);
        this.mushroomGraphics.stroke({ width: 1, color: 0xd4a574 });
        
        // === ОЧКИ (милі!) ===
        // Білки очей
        this.mushroomGraphics.ellipse(10, 22, 3, 3);
        this.mushroomGraphics.fill(0x000000);
        this.mushroomGraphics.ellipse(18, 22, 3, 3);
        this.mushroomGraphics.fill(0x000000);
        
        // Блиск в очах
        this.mushroomGraphics.circle(9, 21, 1);
        this.mushroomGraphics.fill(0xffffff);
        this.mushroomGraphics.circle(17, 21, 1);
        this.mushroomGraphics.fill(0xffffff);
        
        container.addChild(this.mushroomGraphics);
        
        container.x = this.x - this.width / 2;
        container.y = this.y;
        
        // Ховаємо на початку для анімації появи
        container.y = this.y + this.height;
        
        console.log('🍄 Mushroom created with Graphics!');
        
        return container;
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

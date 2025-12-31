import { Graphics, Container } from 'pixi.js';

export class Platform {
    constructor(game, x, y, width, height, type = 'ground') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.isUsed = false;
        this.isBroken = false; // Для розбитих цегли
        this.isActive = true; // Чи платформа активна для колізій
        
        this.sprite = this.createSprite();
    }
    
    createSprite() {
        const container = new Container();
        
        switch (this.type) {
            case 'ground':
                this.createGround(container);
                break;
            case 'brick':
                this.createBrick(container);
                break;
            case 'question':
                this.createQuestionBlock(container);
                break;
            default:
                this.createGround(container);
        }
        
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    createGround(container) {
        // Верхній шар трави
        const grass = new Graphics();
        grass.rect(0, 0, this.width, 8);
        grass.fill(0x00a800);
        container.addChild(grass);
        
        // Земля
        const dirt = new Graphics();
        dirt.rect(0, 8, this.width, this.height - 8);
        dirt.fill(0xc84c0c);
        container.addChild(dirt);
        
        // Декоративні лінії
        const lines = new Graphics();
        for (let i = 0; i < this.width; i += 20) {
            lines.rect(i, 10, 2, this.height - 12);
            lines.fill(0xa03c0c);
        }
        container.addChild(lines);
    }
    
    createBrick(container) {
        // Один блок цегли 30x30
        const blockWidth = this.width;
        const blockHeight = this.height;
        
        // Основний блок
        const block = new Graphics();
        block.rect(0, 0, blockWidth, blockHeight);
        block.fill(0xc84c0c);
        container.addChild(block);
        
        // Обводка (світла зверху/зліва, темна знизу/справа)
        const border = new Graphics();
        // Верх
        border.rect(0, 0, blockWidth, 3);
        border.fill(0xfc9838);
        // Ліва
        border.rect(0, 0, 3, blockHeight);
        border.fill(0xfc9838);
        // Низ
        border.rect(0, blockHeight - 3, blockWidth, 3);
        border.fill(0x802c0c);
        // Права
        border.rect(blockWidth - 3, 0, 3, blockHeight);
        border.fill(0x802c0c);
        container.addChild(border);
        
        // Центральні лінії (цегляний малюнок)
        const lines = new Graphics();
        lines.rect(blockWidth / 2 - 1, 0, 2, blockHeight);
        lines.fill(0x802c0c);
        lines.rect(0, blockHeight / 2 - 1, blockWidth, 2);
        lines.fill(0x802c0c);
        container.addChild(lines);
    }
    
    createQuestionBlock(container) {
        // Жовтий блок
        const block = new Graphics();
        block.roundRect(0, 0, this.width, this.height, 4);
        block.fill(this.isUsed ? 0x8b7355 : 0xfab800);
        container.addChild(block);
        
        // Обводка
        const border = new Graphics();
        border.roundRect(0, 0, this.width, this.height, 4);
        border.stroke({ width: 3, color: this.isUsed ? 0x5c4033 : 0xffd700 });
        container.addChild(border);
        
        // Знак питання
        if (!this.isUsed) {
            const question = new Graphics();
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            
            // Верхня частина знаку питання
            question.arc(centerX, centerY - 5, 8, Math.PI, 0);
            question.stroke({ width: 4, color: 0xfff });
            
            // Нижня частина
            question.moveTo(centerX + 8, centerY - 5);
            question.lineTo(centerX, centerY + 2);
            question.stroke({ width: 4, color: 0xfff });
            
            // Крапка
            question.circle(centerX, centerY + 10, 3);
            question.fill(0xffffff);
            
            container.addChild(question);
        }
        
        // Анімація блоку
        this.questionAnim = 0;
    }
    
    activate() {
        if (this.isUsed) return;
        
        this.isUsed = true;
        
        // Анімація підстрибування
        const originalY = this.sprite.y;
        let animProgress = 0;
        
        const animate = () => {
            animProgress += 0.15;
            
            if (animProgress < Math.PI) {
                this.sprite.y = originalY - Math.sin(animProgress) * 10;
                requestAnimationFrame(animate);
            } else {
                this.sprite.y = originalY;
                // Оновлюємо вигляд блоку
                this.updateToUsed();
            }
        };
        
        animate();
    }
    
    updateToUsed() {
        // Видаляємо старі графіки
        while (this.sprite.children.length > 0) {
            this.sprite.removeChildAt(0);
        }
        
        // Створюємо сірий використаний блок
        const block = new Graphics();
        block.roundRect(0, 0, this.width, this.height, 4);
        block.fill(0x8b7355);
        this.sprite.addChild(block);
        
        const border = new Graphics();
        border.roundRect(0, 0, this.width, this.height, 4);
        border.stroke({ width: 3, color: 0x5c4033 });
        this.sprite.addChild(border);
    }
    
    update(delta) {
        // Анімація блоку з питанням
        if (this.type === 'question' && !this.isUsed) {
            this.questionAnim += delta * 0.1;
            this.sprite.y = this.y + Math.sin(this.questionAnim) * 2;
        }
    }
    
    /**
     * Розбиває цегляний блок з ефектом
     */
    breakBrick() {
        if (this.type !== 'brick' || this.isBroken) return false;
        
        this.isBroken = true;
        this.isActive = false; // Вимикаємо колізію
        
        // Створюємо уламки
        this.createDebris();
        
        // Ховаємо оригінальну платформу
        this.sprite.visible = false;
        
        console.log('💥 Цегла розбита!');
        return true;
    }
    
    /**
     * Створює уламки від розбитої цегли
     */
    createDebris() {
        const numDebris = 4;
        const debrisSize = 12;
        
        for (let i = 0; i < numDebris; i++) {
            const debris = new Graphics();
            debris.rect(0, 0, debrisSize, debrisSize);
            debris.fill(0xc84c0c);
            debris.rect(0, 0, debrisSize, 2);
            debris.fill(0xfc9838);
            
            // Початкова позиція в центрі блоку
            const startX = this.x + this.width / 2 + (i % 2 === 0 ? -10 : 10);
            const startY = this.y + this.height / 2;
            
            debris.x = startX;
            debris.y = startY;
            
            this.game.worldContainer.addChild(debris);
            
            // Швидкість уламків
            const velocityX = (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2);
            const velocityY = -8 - Math.random() * 4;
            
            // Анімація уламків
            this.animateDebris(debris, velocityX, velocityY);
        }
    }
    
    /**
     * Анімує падіння уламка
     */
    animateDebris(debris, velocityX, velocityY) {
        let vx = velocityX;
        let vy = velocityY;
        const gravity = 0.4;
        let rotation = 0;
        const rotationSpeed = (Math.random() - 0.5) * 0.3;
        
        const animate = () => {
            vy += gravity;
            debris.x += vx;
            debris.y += vy;
            rotation += rotationSpeed;
            debris.rotation = rotation;
            
            // Якщо уламок впав за екран - видаляємо
            if (debris.y > this.game.screenHeight + 100) {
                this.game.worldContainer.removeChild(debris);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}


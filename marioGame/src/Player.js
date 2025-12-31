import { Graphics, Container, Sprite, Assets } from 'pixi.js';

export class Player {
    constructor(game) {
        this.game = game;
        
        this.x = 100;
        this.y = 400;
        this.width = 40;
        this.height = 50;
        
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.speed = 5;
        this.jumpForce = 12;
        this.isGrounded = false;
        this.isJumping = false;
        this.facingRight = true;
        
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;
        
        this.sprite = this.createSprite();
        this.loadTexture();
    }
    
    createSprite() {
        const container = new Container();
        
        // Спочатку створюємо placeholder (потім замінимо на текстуру)
        this.marioGraphics = new Graphics();
        this.marioGraphics.roundRect(0, 0, this.width, this.height, 8);
        this.marioGraphics.fill(0xe52521);
        container.addChild(this.marioGraphics);
        
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    async loadTexture() {
        try {
            // Завантажуємо текстуру Mario
            const texture = await Assets.load('img/mario.png');
            
            // Створюємо спрайт
            this.marioSprite = new Sprite(texture);
            this.marioSprite.width = this.width;
            this.marioSprite.height = this.height;
            
            // Видаляємо placeholder і додаємо спрайт
            this.sprite.removeChild(this.marioGraphics);
            this.sprite.addChild(this.marioSprite);
            
            console.log('🍄 Mario texture loaded!');
        } catch (error) {
            console.log('Using fallback Mario graphics');
            // Залишаємо Graphics якщо текстура не завантажилась
        }
    }
    
    update(delta) {
        const input = this.game.inputHandler;
        
        // Горизонтальний рух
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
            this.velocityX = -this.speed;
            this.facingRight = false;
            this.sprite.scale.x = -1;
            this.sprite.pivot.x = this.width;
        } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
            this.velocityX = this.speed;
            this.facingRight = true;
            this.sprite.scale.x = 1;
            this.sprite.pivot.x = 0;
        } else {
            this.velocityX *= 0.8; // Тертя
            if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
        }
        
        // Стрибок
        if ((input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW') || input.isKeyDown('Space')) 
            && this.isGrounded && !this.isJumping) {
            this.velocityY = -this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
        }
        
        // Скидаємо isJumping коли кнопка відпущена
        if (!input.isKeyDown('ArrowUp') && !input.isKeyDown('KeyW') && !input.isKeyDown('Space')) {
            this.isJumping = false;
        }
        
        // Застосовуємо гравітацію
        this.velocityY += this.game.gravity * delta;
        
        // Обмеження швидкості падіння
        if (this.velocityY > 15) this.velocityY = 15;
        
        // Оновлюємо позицію
        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;
        
        // Обмежуємо ліву границю
        if (this.x < 0) this.x = 0;
        
        // Скидаємо isGrounded для перевірки колізій
        this.isGrounded = false;
        
        // Оновлюємо позицію спрайта
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Анімація бігу
        if (Math.abs(this.velocityX) > 0.5 && this.isGrounded) {
            const bobAmount = Math.sin(Date.now() / 80) * 2;
            this.sprite.y = this.y + bobAmount;
        }
        
        // Обробка невразливості
        if (this.isInvincible) {
            this.invincibleTimer -= delta * 16;
            this.blinkTimer += delta * 16;
            
            // Мигання
            this.sprite.alpha = Math.sin(this.blinkTimer / 50) > 0 ? 1 : 0.3;
            
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.sprite.alpha = 1;
            }
        }
    }
    
    checkPlatformCollision(platform) {
        const playerBottom = this.y + this.height;
        const playerTop = this.y;
        const playerLeft = this.x;
        const playerRight = this.x + this.width;
        
        const platTop = platform.y;
        const platBottom = platform.y + platform.height;
        const platLeft = platform.x;
        const platRight = platform.x + platform.width;
        
        // Перевіряємо чи є перетин
        if (playerRight > platLeft && playerLeft < platRight) {
            // Падіння на платформу (зверху)
            if (playerBottom >= platTop && playerBottom <= platTop + 20 && this.velocityY >= 0) {
                this.y = platTop - this.height;
                this.velocityY = 0;
                this.isGrounded = true;
                return true;
            }
            
            // Удар головою знизу
            if (playerTop <= platBottom && playerTop >= platBottom - 15 && this.velocityY < 0) {
                this.y = platBottom;
                this.velocityY = 0;
                
                // Якщо це блок з питанням - активуємо його
                if (platform.type === 'question' && !platform.isUsed) {
                    platform.activate();
                    this.game.addScore(50);
                    // Спавнимо гриб!
                    this.game.spawnMushroom(platform.x + platform.width / 2, platform.y - 30);
                }
                
                // Якщо це цегла - розбиваємо її!
                if (platform.type === 'brick' && !platform.isBroken) {
                    platform.breakBrick();
                    this.game.addScore(25);
                }
                
                return true;
            }
        }
        
        // Бокова колізія
        if (playerBottom > platTop + 5 && playerTop < platBottom - 5) {
            // Зліва
            if (playerRight >= platLeft && playerRight <= platLeft + 10 && this.velocityX > 0) {
                this.x = platLeft - this.width;
                this.velocityX = 0;
                return true;
            }
            // Справа
            if (playerLeft <= platRight && playerLeft >= platRight - 10 && this.velocityX < 0) {
                this.x = platRight;
                this.velocityX = 0;
                return true;
            }
        }
        
        return false;
    }
    
    checkCoinCollision(coin) {
        const dx = (this.x + this.width / 2) - coin.x;
        const dy = (this.y + this.height / 2) - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 25;
    }
    
    checkEnemyCollision(enemy) {
        return this.x < enemy.x + enemy.width &&
               this.x + this.width > enemy.x &&
               this.y < enemy.y + enemy.height &&
               this.y + this.height > enemy.y;
    }
    
    bounce() {
        this.velocityY = -8;
    }
    
    setInvincible() {
        this.isInvincible = true;
        this.invincibleTimer = 2000;
        this.blinkTimer = 0;
    }
    
    respawn() {
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
        this.setInvincible();
    }
}


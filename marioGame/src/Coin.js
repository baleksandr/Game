import { Graphics, Container } from 'pixi.js';

export class Coin {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.collected = false;
        this.animProgress = Math.random() * Math.PI * 2;
        
        this.sprite = this.createSprite();
    }
    
    createSprite() {
        const container = new Container();
        
        // Монета
        const coin = new Graphics();
        coin.circle(0, 0, 12);
        coin.fill(0xffd700);
        coin.stroke({ width: 2, color: 0xffa500 });
        container.addChild(coin);
        
        // Блиск
        const shine = new Graphics();
        shine.circle(-4, -4, 4);
        shine.fill(0xffff99);
        container.addChild(shine);
        
        // Символ долара/монети
        const symbol = new Graphics();
        symbol.circle(0, 0, 6);
        symbol.stroke({ width: 2, color: 0xcc9900 });
        container.addChild(symbol);
        
        container.x = this.x;
        container.y = this.y;
        
        return container;
    }
    
    update(delta) {
        if (this.collected) return;
        
        // Анімація плавання
        this.animProgress += delta * 0.08;
        this.sprite.y = this.y + Math.sin(this.animProgress) * 5;
        
        // Анімація обертання (зміна масштабу по X)
        this.sprite.scale.x = 0.5 + Math.abs(Math.sin(this.animProgress * 2)) * 0.5;
    }
    
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        
        // Анімація збору
        let animProgress = 0;
        const startY = this.sprite.y;
        
        const animate = () => {
            animProgress += 0.1;
            
            this.sprite.y = startY - animProgress * 30;
            this.sprite.alpha = 1 - animProgress;
            this.sprite.scale.set(1 + animProgress * 0.5);
            
            if (animProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.sprite.visible = false;
            }
        };
        
        animate();
    }
}


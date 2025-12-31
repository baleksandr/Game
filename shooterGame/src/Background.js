import { Container, Graphics } from 'pixi.js';

export class Background {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.stars = [];
        this.nebulas = [];
    }
    
    create() {
        // Глибокий космічний фон
        this.createSpaceGradient();
        
        // Туманності
        this.createNebulas();
        
        // Зірки різних розмірів та яскравості
        this.createStars();
        
        // Далекі галактики
        this.createDistantGalaxies();
        
        // Додаємо контейнер фону
        this.game.worldContainer.addChildAt(this.container, 0);
    }
    
    createSpaceGradient() {
        const bg = new Graphics();
        
        // Темний градієнт
        bg.rect(0, 0, this.game.screenWidth, this.game.screenHeight);
        bg.fill(0x0a0a1a);
        
        this.container.addChild(bg);
        
        // Кольорові плями
        const spots = [
            { x: 100, y: 100, color: 0x1a0a3e, size: 200 },
            { x: 600, y: 400, color: 0x0a1a3e, size: 250 },
            { x: 400, y: 200, color: 0x1a1a4e, size: 180 },
        ];
        
        spots.forEach(spot => {
            const glow = new Graphics();
            glow.circle(spot.x, spot.y, spot.size);
            glow.fill({ color: spot.color, alpha: 0.3 });
            this.container.addChild(glow);
        });
    }
    
    createNebulas() {
        // Кольорові туманності
        const nebulaColors = [
            { color: 0x9d00ff, x: 200, y: 150 },
            { color: 0x00fff2, x: 600, y: 300 },
            { color: 0xff00ff, x: 400, y: 500 },
        ];
        
        nebulaColors.forEach(nebula => {
            const cloud = new Graphics();
            
            // Кілька шарів для глибини
            for (let i = 3; i >= 1; i--) {
                cloud.circle(nebula.x, nebula.y, 80 * i);
                cloud.fill({ color: nebula.color, alpha: 0.02 / i });
            }
            
            this.container.addChild(cloud);
            this.nebulas.push({ sprite: cloud, baseX: nebula.x, baseY: nebula.y });
        });
    }
    
    createStars() {
        // Різні шари зірок
        const layers = [
            { count: 100, sizeRange: [0.5, 1], speedRange: [0.2, 0.5], alpha: 0.3 },
            { count: 60, sizeRange: [1, 2], speedRange: [0.5, 1], alpha: 0.6 },
            { count: 30, sizeRange: [2, 3], speedRange: [1, 2], alpha: 0.9 },
        ];
        
        layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                const star = new Graphics();
                const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
                const x = Math.random() * this.game.screenWidth;
                const y = Math.random() * this.game.screenHeight;
                
                // Деякі зірки кольорові
                let color = 0xffffff;
                if (Math.random() > 0.9) {
                    const colors = [0x00fff2, 0xff00ff, 0xffff00, 0xff6600];
                    color = colors[Math.floor(Math.random() * colors.length)];
                }
                
                star.circle(0, 0, size);
                star.fill({ color, alpha: layer.alpha });
                
                // Світіння для більших зірок
                if (size > 1.5) {
                    star.circle(0, 0, size * 2);
                    star.fill({ color, alpha: 0.1 });
                }
                
                star.x = x;
                star.y = y;
                
                this.container.addChild(star);
                
                this.stars.push({
                    sprite: star,
                    speed: layer.speedRange[0] + Math.random() * (layer.speedRange[1] - layer.speedRange[0]),
                    twinkleSpeed: 0.01 + Math.random() * 0.03,
                    twinklePhase: Math.random() * Math.PI * 2,
                    baseAlpha: layer.alpha,
                });
            }
        });
    }
    
    createDistantGalaxies() {
        // Далекі галактики як еліпси
        const galaxyPositions = [
            { x: 700, y: 80, rotation: 0.3 },
            { x: 100, y: 450, rotation: -0.5 },
        ];
        
        galaxyPositions.forEach(pos => {
            const galaxy = new Graphics();
            
            // Центральне ядро
            galaxy.ellipse(0, 0, 30, 8);
            galaxy.fill({ color: 0xffffcc, alpha: 0.3 });
            
            galaxy.ellipse(0, 0, 20, 5);
            galaxy.fill({ color: 0xffffff, alpha: 0.5 });
            
            galaxy.x = pos.x;
            galaxy.y = pos.y;
            galaxy.rotation = pos.rotation;
            
            this.container.addChild(galaxy);
        });
    }
    
    update(delta) {
        // Рух зірок (паралакс)
        this.stars.forEach(star => {
            star.sprite.y += star.speed * delta;
            
            // Якщо зірка вийшла за екран - повертаємо вгору
            if (star.sprite.y > this.game.screenHeight + 10) {
                star.sprite.y = -10;
                star.sprite.x = Math.random() * this.game.screenWidth;
            }
            
            // Мерехтіння
            star.twinklePhase += star.twinkleSpeed * delta;
            const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
            star.sprite.alpha = star.baseAlpha * twinkle;
        });
        
        // Повільний рух туманностей
        this.nebulas.forEach((nebula, index) => {
            nebula.sprite.alpha = 0.8 + Math.sin(Date.now() / 3000 + index) * 0.2;
        });
    }
}


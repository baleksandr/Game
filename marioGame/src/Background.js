import { Graphics, Container } from 'pixi.js';

export class Background {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.clouds = [];
        this.hills = [];
        this.bushes = [];
    }
    
    create() {
        // Небо (градієнт симулюється кількома прямокутниками)
        this.createSky();
        
        // Далекі гори
        this.createMountains();
        
        // Хмари
        this.createClouds();
        
        // Пагорби
        this.createHills();
        
        // Кущі
        this.createBushes();
        
        // Додаємо контейнер фону перед світом
        this.game.worldContainer.addChildAt(this.container, 0);
    }
    
    createSky() {
        const skyColors = [0x5c94fc, 0x74a8fc, 0x8cbcfc, 0xa4d0fc];
        const segmentHeight = this.game.screenHeight / skyColors.length;
        
        skyColors.forEach((color, index) => {
            const segment = new Graphics();
            segment.rect(0, index * segmentHeight, this.game.levelWidth, segmentHeight);
            segment.fill(color);
            this.container.addChild(segment);
        });
    }
    
    createMountains() {
        const mountainPositions = [100, 400, 800, 1200, 1600, 2000, 2400, 2800];
        
        mountainPositions.forEach((x, index) => {
            const mountain = new Graphics();
            const height = 80 + Math.random() * 60;
            const width = 150 + Math.random() * 100;
            const baseY = this.game.screenHeight - 40;
            
            // Гора
            mountain.moveTo(x, baseY);
            mountain.lineTo(x + width / 2, baseY - height);
            mountain.lineTo(x + width, baseY);
            mountain.closePath();
            mountain.fill(index % 2 === 0 ? 0x228b22 : 0x2e8b2e);
            
            // Снігова шапка
            if (height > 100) {
                const snow = new Graphics();
                const snowHeight = height * 0.3;
                snow.moveTo(x + width / 2 - 20, baseY - height + snowHeight);
                snow.lineTo(x + width / 2, baseY - height);
                snow.lineTo(x + width / 2 + 20, baseY - height + snowHeight);
                snow.closePath();
                snow.fill(0xffffff);
                this.container.addChild(snow);
            }
            
            this.container.addChild(mountain);
        });
    }
    
    createClouds() {
        const cloudPositions = [
            { x: 100, y: 80 },
            { x: 350, y: 120 },
            { x: 600, y: 60 },
            { x: 900, y: 100 },
            { x: 1200, y: 70 },
            { x: 1500, y: 110 },
            { x: 1800, y: 80 },
            { x: 2100, y: 90 },
            { x: 2400, y: 60 },
            { x: 2700, y: 100 },
        ];
        
        cloudPositions.forEach(pos => {
            const cloud = this.createCloud(pos.x, pos.y);
            this.clouds.push({ sprite: cloud, speed: 0.1 + Math.random() * 0.2, originalX: pos.x });
            this.container.addChild(cloud);
        });
    }
    
    createCloud(x, y) {
        const cloud = new Graphics();
        
        // Кілька кіл для пухнастої хмари
        cloud.circle(0, 0, 25);
        cloud.circle(25, -5, 30);
        cloud.circle(55, 0, 25);
        cloud.circle(15, 15, 20);
        cloud.circle(40, 15, 22);
        cloud.fill(0xffffff);
        
        cloud.x = x;
        cloud.y = y;
        
        return cloud;
    }
    
    createHills() {
        const hillPositions = [0, 300, 700, 1100, 1500, 1900, 2300, 2700];
        
        hillPositions.forEach((x, index) => {
            const hill = new Graphics();
            const width = 200 + Math.random() * 100;
            const height = 50 + Math.random() * 30;
            const baseY = this.game.screenHeight - 40;
            
            // Пагорб як половина еліпса
            hill.ellipse(x + width / 2, baseY, width / 2, height);
            hill.fill(index % 2 === 0 ? 0x00c800 : 0x00b800);
            
            this.container.addChild(hill);
            this.hills.push(hill);
        });
    }
    
    createBushes() {
        const bushPositions = [50, 180, 450, 620, 850, 1050, 1300, 1550, 1750, 2000, 2250, 2500, 2750];
        
        bushPositions.forEach((x, index) => {
            const bush = new Graphics();
            const baseY = this.game.screenHeight - 45;
            
            // Кущ з кількох кіл
            bush.circle(x, baseY, 15);
            bush.circle(x + 18, baseY - 5, 18);
            bush.circle(x + 38, baseY, 15);
            bush.fill(0x228b22);
            
            // Темніші плями
            bush.circle(x + 5, baseY + 3, 5);
            bush.circle(x + 25, baseY - 2, 6);
            bush.fill(0x1a6b1a);
            
            this.container.addChild(bush);
            this.bushes.push(bush);
        });
    }
    
    update() {
        // Паралакс-ефект для хмар
        this.clouds.forEach(cloud => {
            // Хмари рухаються повільніше за камеру
            cloud.sprite.x = cloud.originalX - this.game.cameraX * 0.1;
        });
    }
}
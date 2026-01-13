/**
 * Constellations Effect - Real constellation patterns
 * Accurate star positions based on actual constellations
 */

class ConstellationsEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.constellations = [];
        this.animationId = null;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'constellations-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        this.createConstellations();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.constellations.length > 0) {
            this.createConstellations();
        }
    }
    
    // Real constellation data with accurate relative positions
    getConstellationPatterns() {
        return [
            // Orion - The Hunter (найвідоміше зимове сузір'я)
            {
                name: 'Orion',
                stars: [
                    { x: 0.22, y: 0.0, mag: 0.5 },   // Betelgeuse (α) - червона
                    { x: 0.78, y: 0.05, mag: 1.6 },  // Bellatrix (γ)
                    { x: 0.0, y: 0.35, mag: 2.0 },   // λ Orionis
                    { x: 0.35, y: 0.50, mag: 1.7 },  // Alnitak (ζ) - пояс
                    { x: 0.50, y: 0.52, mag: 1.7 },  // Alnilam (ε) - пояс
                    { x: 0.65, y: 0.54, mag: 2.2 },  // Mintaka (δ) - пояс
                    { x: 0.18, y: 0.95, mag: 2.1 },  // Saiph (κ)
                    { x: 0.82, y: 1.0, mag: 0.1 },   // Rigel (β) - блакитна
                ],
                connections: [[0, 2], [0, 3], [1, 5], [2, 6], [3, 4], [4, 5], [5, 7], [6, 3]]
            },
            
            // Ursa Major - Big Dipper (Великий Віз)
            {
                name: 'Ursa Major',
                stars: [
                    { x: 0.0, y: 0.30, mag: 1.8 },   // Alkaid (η)
                    { x: 0.18, y: 0.15, mag: 2.4 },  // Mizar (ζ)
                    { x: 0.35, y: 0.08, mag: 2.4 },  // Alioth (ε)
                    { x: 0.52, y: 0.0, mag: 2.4 },   // Megrez (δ)
                    { x: 0.65, y: 0.20, mag: 2.4 },  // Phecda (γ)
                    { x: 0.85, y: 0.05, mag: 2.0 },  // Merak (β)
                    { x: 1.0, y: 0.25, mag: 1.8 },   // Dubhe (α)
                ],
                connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 6]]
            },
            
            // Cassiopeia - W-подібне сузір'я
            {
                name: 'Cassiopeia',
                stars: [
                    { x: 0.0, y: 0.5, mag: 2.2 },    // Caph (β)
                    { x: 0.25, y: 0.0, mag: 2.2 },   // Schedar (α)
                    { x: 0.50, y: 0.4, mag: 2.5 },   // Gamma Cas
                    { x: 0.75, y: 0.0, mag: 2.7 },   // Ruchbah (δ)
                    { x: 1.0, y: 0.3, mag: 3.4 },    // Segin (ε)
                ],
                connections: [[0, 1], [1, 2], [2, 3], [3, 4]]
            },
            
            // Cygnus - Лебідь (Північний Хрест)
            {
                name: 'Cygnus',
                stars: [
                    { x: 0.50, y: 0.0, mag: 1.3 },   // Deneb (α) - дуже яскрава
                    { x: 0.50, y: 0.35, mag: 2.5 },  // Sadr (γ)
                    { x: 0.20, y: 0.50, mag: 2.9 },  // Gienah (ε)
                    { x: 0.80, y: 0.50, mag: 2.5 },  // Delta Cyg
                    { x: 0.50, y: 0.70, mag: 3.0 },  // Eta Cyg
                    { x: 0.50, y: 1.0, mag: 3.1 },   // Albireo (β) - подвійна
                ],
                connections: [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5]]
            },
            
            // Leo - Лев
            {
                name: 'Leo',
                stars: [
                    { x: 0.0, y: 0.25, mag: 1.4 },   // Regulus (α)
                    { x: 0.15, y: 0.0, mag: 2.6 },   // Eta Leo
                    { x: 0.35, y: 0.10, mag: 3.4 },  // Gamma Leo
                    { x: 0.50, y: 0.25, mag: 2.1 },  // Zeta Leo
                    { x: 0.40, y: 0.45, mag: 3.5 },  // Mu Leo
                    { x: 0.75, y: 0.35, mag: 2.6 },  // Theta Leo
                    { x: 1.0, y: 0.50, mag: 2.0 },   // Denebola (β)
                ],
                connections: [[0, 1], [1, 2], [2, 3], [0, 4], [3, 5], [5, 6], [4, 3]]
            },
            
            // Scorpius - Скорпіон
            {
                name: 'Scorpius',
                stars: [
                    { x: 0.45, y: 0.0, mag: 2.9 },   // Dschubba (δ)
                    { x: 0.55, y: 0.15, mag: 2.6 },  // Pi Sco
                    { x: 0.50, y: 0.30, mag: 0.9 },  // Antares (α) - червона!
                    { x: 0.45, y: 0.50, mag: 2.8 },  // Tau Sco
                    { x: 0.30, y: 0.65, mag: 2.7 },  // Epsilon Sco
                    { x: 0.15, y: 0.80, mag: 2.4 },  // Mu Sco
                    { x: 0.0, y: 0.90, mag: 2.8 },   // Zeta Sco
                    { x: 0.10, y: 1.0, mag: 1.6 },   // Shaula (λ) - жало
                ],
                connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
            },
            
            // Gemini - Близнюки
            {
                name: 'Gemini',
                stars: [
                    { x: 0.0, y: 0.0, mag: 1.6 },    // Castor (α)
                    { x: 0.15, y: 0.15, mag: 1.2 },  // Pollux (β) - найяскравіша
                    { x: 0.30, y: 0.40, mag: 2.9 },  // Wasat (δ)
                    { x: 0.20, y: 0.60, mag: 3.2 },  // Kappa Gem
                    { x: 0.45, y: 0.80, mag: 3.0 },  // Gamma Gem
                    { x: 0.70, y: 1.0, mag: 3.5 },   // Mu Gem
                    { x: 0.55, y: 0.50, mag: 3.3 },  // Xi Gem
                ],
                connections: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [2, 6], [4, 5]]
            },
            
            // Lyra - Ліра (з Вегою)
            {
                name: 'Lyra',
                stars: [
                    { x: 0.50, y: 0.0, mag: 0.0 },   // Vega (α) - найяскравіша!
                    { x: 0.20, y: 0.60, mag: 3.3 },  // Zeta Lyr
                    { x: 0.35, y: 0.80, mag: 4.3 },  // Delta Lyr
                    { x: 0.65, y: 0.80, mag: 4.2 },  // Gamma Lyr
                    { x: 0.80, y: 0.60, mag: 3.2 },  // Sheliak (β)
                ],
                connections: [[0, 1], [0, 4], [1, 2], [2, 3], [3, 4]]
            }
        ];
    }
    
    createConstellations() {
        this.constellations = [];
        
        const patterns = this.getConstellationPatterns();
        const count = 6; // Завжди 6 сузір'їв
        const shuffled = [...patterns].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        
        // Розміщуємо у видимих зонах
        const positions = this.generatePositions(count);
        
        selected.forEach((pattern, index) => {
            const pos = positions[index];
            const constellation = this.createConstellation(pattern, pos);
            this.constellations.push(constellation);
        });
    }
    
    generatePositions(count) {
        const positions = [];
        const size = 120; // Трохи більший розмір
        
        // Визначаємо зони біля країв та між карточками
        const zones = [
            // Верхній лівий кут
            { x: 20, y: 80, w: 200, h: 150 },
            // Верхній правий кут
            { x: this.canvas.width - 220, y: 80, w: 200, h: 150 },
            // Лівий край (середина)
            { x: 10, y: this.canvas.height * 0.4, w: 150, h: 200 },
            // Правий край (середина)
            { x: this.canvas.width - 160, y: this.canvas.height * 0.4, w: 150, h: 200 },
            // Нижній лівий
            { x: 30, y: this.canvas.height - 200, w: 180, h: 150 },
            // Нижній правий
            { x: this.canvas.width - 210, y: this.canvas.height - 200, w: 180, h: 150 },
            // Центр верху (між header і карточками)
            { x: this.canvas.width * 0.35, y: 100, w: this.canvas.width * 0.3, h: 100 },
            // Центр низу
            { x: this.canvas.width * 0.3, y: this.canvas.height - 120, w: this.canvas.width * 0.4, h: 100 },
        ];
        
        // Вибираємо випадкові зони
        const shuffledZones = [...zones].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < count; i++) {
            const zone = shuffledZones[i % shuffledZones.length];
            const x = zone.x + Math.random() * Math.max(0, zone.w - size);
            const y = zone.y + Math.random() * Math.max(0, zone.h - size);
            
            positions.push({ x, y, size });
        }
        
        return positions;
    }
    
    createConstellation(pattern, pos) {
        const stars = pattern.stars.map(star => {
            // Magnitude to size (менша magnitude = яскравіша зірка)
            const baseSize = Math.max(1, 3.5 - star.mag * 0.6);
            
            return {
                x: pos.x + star.x * pos.size,
                y: pos.y + star.y * pos.size,
                baseSize: baseSize,
                size: baseSize,
                brightness: Math.max(0.4, 1 - star.mag * 0.15),
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.8 + Math.random() * 1.2,
                color: this.getStarColor(star.mag)
            };
        });
        
        return {
            name: pattern.name,
            stars: stars,
            connections: pattern.connections,
            opacity: 0,
            targetOpacity: 0.8,
            fadeSpeed: 0.008 + Math.random() * 0.005
        };
    }
    
    getStarColor(magnitude) {
        // Яскраві зірки мають різні кольори
        if (magnitude < 1) {
            // Дуже яскраві - білі/блакитні
            return { r: 220, g: 235, b: 255 };
        } else if (magnitude < 2) {
            // Яскраві - білі
            return { r: 255, g: 255, b: 255 };
        } else {
            // Тьмяніші - тепліші відтінки
            const colors = [
                { r: 255, g: 250, b: 240 },
                { r: 240, g: 245, b: 255 },
                { r: 255, g: 255, b: 255 },
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    animate() {
        this.time += 0.016;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.constellations.forEach(constellation => {
            // Плавна поява
            if (constellation.opacity < constellation.targetOpacity) {
                constellation.opacity += constellation.fadeSpeed;
            }
            
            this.drawConstellation(constellation);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConstellation(constellation) {
        const { stars, connections, opacity } = constellation;
        
        // Малюємо лінії між зірками
        connections.forEach(([i, j]) => {
            if (i >= stars.length || j >= stars.length) return;
            
            const star1 = stars[i];
            const star2 = stars[j];
            
            const gradient = this.ctx.createLinearGradient(
                star1.x, star1.y, star2.x, star2.y
            );
            
            const alpha = opacity * 0.25;
            gradient.addColorStop(0, `rgba(150, 180, 255, ${alpha * star1.brightness})`);
            gradient.addColorStop(0.5, `rgba(130, 160, 230, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(150, 180, 255, ${alpha * star2.brightness})`);
            
            this.ctx.beginPath();
            this.ctx.moveTo(star1.x, star1.y);
            this.ctx.lineTo(star2.x, star2.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
        });
        
        // Малюємо зірки
        stars.forEach(star => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
            const sizeFactor = 1 + twinkle * 0.25;
            const brightnessFactor = 0.75 + (twinkle + 1) * 0.125;
            
            star.size = star.baseSize * sizeFactor;
            
            const { r, g, b } = star.color;
            const alpha = opacity * star.brightness * brightnessFactor;
            
            // Зовнішнє сяйво
            const glowRadius = star.size * 3;
            const glow = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, glowRadius
            );
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
            glow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
            glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = glow;
            this.ctx.fill();
            
            // Ядро зірки
            const core = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size
            );
            core.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            core.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
            core.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = core;
            this.ctx.fill();
        });
    }
    
    regenerate() {
        this.constellations = [];
        this.createConstellations();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Ініціалізація
let constellationsEffect = null;

document.addEventListener('DOMContentLoaded', () => {
    constellationsEffect = new ConstellationsEffect();
});

window.ConstellationsEffect = ConstellationsEffect;
window.regenerateConstellations = () => {
    if (constellationsEffect) {
        constellationsEffect.regenerate();
    }
};

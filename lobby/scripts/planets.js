/**
 * Planets Effect - Interactive rotating planets with facts
 * Beautiful planets with rotation and click interaction
 */

class PlanetsEffect {
    constructor() {
        this.container = null;
        this.planets = [];
        this.tooltip = null;
        this.activePlanet = null;
        
        // Planet data
        this.planetData = [
            {
                name: 'Mercury',
                fact: 'The closest planet to the Sun. A day on Mercury lasts 59 Earth days!',
                size: 45,
                image: 'img/Mercury.png'
            },
            {
                name: 'Venus',
                fact: 'The hottest planet (462°C). It rotates in the opposite direction!',
                size: 55,
                image: 'img/Venus.png'
            },
            {
                name: 'Earth',
                fact: 'The only known planet with life. 71% of its surface is covered by water.',
                size: 55,
                image: 'img/Earth.png'
            },
            {
                name: 'Mars',
                fact: 'The Red Planet. Home to the tallest mountain in the Solar System - Olympus Mons (21 km)!',
                size: 50,
                image: 'img/Mars.png'
            },
            {
                name: 'Jupiter',
                fact: 'The largest planet! It could fit 1300 Earths inside. The Great Red Spot is a storm raging for 400 years.',
                size: 75,
                image: 'img/Jupiter.png'
            },
            {
                name: 'Saturn',
                fact: 'The planet with the most beautiful rings! So light it could float on water.',
                size: 100,
                rings: true,
                image: 'img/Saturn.png'
            },
            {
                name: 'Uranus',
                fact: 'It lies on its side! Rotates at a 98° angle. Has 27 moons.',
                size: 55,
                image: 'img/Uranus.png'
            },
            {
                name: 'Neptune',
                fact: 'The windiest planet! Wind speeds reach 2100 km/h.',
                size: 55,
                image: 'img/Neptune.png'
            },
            {
                name: 'Pluto',
                fact: 'The dwarf planet with a heart! Its largest moon Charon is half its size.',
                size: 35,
                image: 'img/Pluto.png'
            }
        ];
        
        this.init();
    }
    
    init() {
        // Контейнер для планет
        this.container = document.createElement('div');
        this.container.id = 'planets-container';
        document.body.appendChild(this.container);
        
        // Tooltip для інформації
        this.createTooltip();
        
        // Створюємо планети
        this.createPlanets();
        
        // Закриття tooltip при кліку на фон
        document.addEventListener('click', (e) => {
            if (this.activePlanet && !e.target.closest('.planet') && !e.target.closest('#planet-tooltip')) {
                this.hideTooltip();
            }
        });
        
        window.addEventListener('resize', () => this.repositionPlanets());
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'planet-tooltip';
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="planet-icon">🪐</span>
                <span class="planet-name"></span>
            </div>
            <div class="tooltip-fact"></div>
            <div class="tooltip-arrow"></div>
        `;
        document.body.appendChild(this.tooltip);
    }
    
    createPlanets() {
        // Вибираємо 4-5 випадкових планет
        const count = 9 + Math.floor(Math.random() * 2);
        const shuffled = [...this.planetData].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        
        // Позиції для планет (в кутах та по краях)
        const positions = this.generatePositions(count);
        
        selected.forEach((data, index) => {
            // Перевірка чи є позиція для планети
            if (positions[index]) {
                const planet = this.createPlanet(data, positions[index]);
                this.planets.push(planet);
                this.container.appendChild(planet.element);
            }
        });
    }
    
    generatePositions(count) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const planetSize = 75;
        const minDistance = 80; // Мінімальна відстань між планетами
        
        // Зони для планет — розподілені по всьому екрану
        const zones = [
            // Над карточками (під header текстом)
            { x: w * 0.08, y: 125 },
            { x: w * 0.25, y: 130 },
            { x: w * 0.75, y: 128 },
            { x: w * 0.88, y: 132 },
            
            // Знизу під карточками (над footer)
            { x: w * 0.1, y: h - 80 },
            { x: w * 0.35, y: h - 70 },
            { x: w * 0.6, y: h - 75 },
            { x: w * 0.85, y: h - 72 },
            
            // По краях (зліва)
            { x: 15, y: h * 0.35 },
            { x: 20, y: h * 0.55 },
            
            // По краях (справа)
            { x: w - 85, y: h * 0.38 },
            { x: w - 80, y: h * 0.58 },
        ];
        
        const shuffledZones = [...zones].sort(() => Math.random() - 0.5);
        
        // Беремо позиції без накладання
        const usedPositions = [];
        for (let i = 0; i < shuffledZones.length && usedPositions.length < count; i++) {
            const zone = shuffledZones[i];
            
            // Перевірка на накладання з іншими планетами
            let tooClose = false;
            for (const pos of usedPositions) {
                const dx = zone.x - pos.x;
                const dy = zone.y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                usedPositions.push({
                    x: zone.x,
                    y: zone.y
                });
            }
        }
        
        return usedPositions;
    }
    
    createPlanet(data, position) {
        const element = document.createElement('div');
        element.className = 'planet';
        if (data.rings) {
            element.classList.add('has-rings');
        }
        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
        
        const size = data.size;
        
        // Створюємо зображення планети
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = data.name;
        img.draggable = false;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.objectFit = 'contain';
        element.appendChild(img);
        
        // Якщо це Земля — додаємо Місяць
        if (data.name === 'Earth') {
            const moonOrbit = document.createElement('div');
            moonOrbit.className = 'moon-orbit';
            
            const moon = document.createElement('div');
            moon.className = 'moon';
            
            moonOrbit.appendChild(moon);
            element.appendChild(moonOrbit);
            element.classList.add('has-moon');
        }
        
        const planetObj = {
            element,
            img,
            data,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        // Обробка кліку
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTooltip(planetObj, e);
        });
        
        // Запускаємо анімацію
        this.animatePlanet(planetObj);
        
        return planetObj;
    }
    
    animatePlanet(planet) {
        const animate = () => {
            // Плаваюча анімація
            const floatY = Math.sin(Date.now() / 2000 + planet.floatOffset) * 5;
            planet.element.style.transform = `translateY(${floatY}px)`;
            
            planet.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    showTooltip(planet, event) {
        // Прибираємо активний стан з попередньої планети
        if (this.activePlanet && this.activePlanet !== planet) {
            this.activePlanet.element.classList.remove('active');
        }
        
        // Якщо клікнули на ту саму планету - закриваємо tooltip
        if (this.activePlanet === planet && this.tooltip.classList.contains('active')) {
            this.hideTooltip();
            return;
        }
        
        this.activePlanet = planet;
        planet.element.classList.add('active');
        
        // Оновлюємо вміст
        const nameEl = this.tooltip.querySelector('.planet-name');
        const factEl = this.tooltip.querySelector('.tooltip-fact');
        const iconEl = this.tooltip.querySelector('.planet-icon');
        
        nameEl.textContent = planet.data.name;
        factEl.textContent = planet.data.fact;
        
        // Показуємо маленьку картинку планети
        iconEl.innerHTML = '';
        const miniImg = document.createElement('img');
        miniImg.src = planet.data.image;
        miniImg.alt = planet.data.name;
        miniImg.style.cssText = 'width: 30px; height: 30px; border-radius: 50%; object-fit: cover;';
        iconEl.appendChild(miniImg);
        
        // Позиціонуємо tooltip
        const rect = planet.element.getBoundingClientRect();
        
        // Визначаємо чи планета зліва чи справа екрану
        const isLeftSide = rect.left < window.innerWidth / 2;
        
        let left, top;
        const arrowEl = this.tooltip.querySelector('.tooltip-arrow');
        
        if (isLeftSide) {
            // Планета зліва - tooltip праворуч від неї
            left = rect.right + 15;
            top = rect.top + rect.height / 2 - 60;
            arrowEl.style.cssText = `
                left: -7px;
                right: auto;
                top: 50%;
                bottom: auto;
                margin-top: -6px;
                transform: rotate(135deg);
            `;
        } else {
            // Планета справа - tooltip ліворуч від неї
            left = rect.left - 295;
            top = rect.top + rect.height / 2 - 60;
            arrowEl.style.cssText = `
                right: -7px;
                left: auto;
                top: 50%;
                bottom: auto;
                margin-top: -6px;
                transform: rotate(-45deg);
            `;
        }
        
        // Перевіряємо межі екрану
        if (left < 10) left = 10;
        if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
        if (top < 10) top = 10;
        if (top + 150 > window.innerHeight) top = window.innerHeight - 160;
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
        
        // Показуємо з анімацією
        requestAnimationFrame(() => {
            this.tooltip.style.opacity = '1';
            this.tooltip.style.visibility = 'visible';
            this.tooltip.style.transform = 'scale(1) translateY(0)';
            this.tooltip.classList.add('active');
        });
    }
    
    hideTooltip() {
        if (this.activePlanet) {
            this.activePlanet.element.classList.remove('active');
            this.activePlanet = null;
        }
        this.tooltip.style.opacity = '0';
        this.tooltip.style.visibility = 'hidden';
        this.tooltip.style.transform = 'scale(0.85) translateY(10px)';
        this.tooltip.classList.remove('active');
    }
    
    repositionPlanets() {
        // Закриваємо tooltip при ресайзі
        this.hideTooltip();
        
        const positions = this.generatePositions(this.planets.length);
        this.planets.forEach((planet, index) => {
            planet.element.style.left = `${positions[index].x}px`;
            planet.element.style.top = `${positions[index].y}px`;
        });
    }
    
    destroy() {
        this.planets.forEach(planet => {
            if (planet.animationId) {
                cancelAnimationFrame(planet.animationId);
            }
        });
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}

// Ініціалізація
let planetsEffect = null;

document.addEventListener('DOMContentLoaded', () => {
    planetsEffect = new PlanetsEffect();
});

window.PlanetsEffect = PlanetsEffect;


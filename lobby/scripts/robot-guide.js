/**
 * Robot Guide - Floating robot that gives tips about games
 * Flies between cards and planets, showing helpful messages
 */

class RobotGuide {
    constructor() {
        this.element = null;
        this.speechBubble = null;
        this.isMoving = false;
        this.currentX = 100;
        this.currentY = 200;
        
        // Привітання робота
        this.introMessage = "Hi, I'm Cosmo! 👋 I'll help you choose a game!";
        this.hasIntroduced = false;
        
        // Tips for players (card - CSS selector for game card)
        this.tips = [
            { text: "Try Space Shooter! 🚀", card: ".game-card.shooter" },
            { text: "Mario is waiting for you! 🍄", card: ".game-card.mario" },
            { text: "Snake — a true classic! 🐍", card: ".game-card.snake" },
            { text: "Tetris for real gamers! 🧱", card: ".game-card.tetris" },
            { text: "Battle Ships — sink the enemy! ⚓", card: ".game-card.battleship" },
            { text: "Click a planet to learn a fact! 🪐", card: null },
            { text: "Look for constellations! ✨", card: null },
            { text: "Which game will you choose? 🤔", card: null },
            { text: "Click on me to learn cool space facts! 🛸", card: null },
        ];
        
        // Цікаві факти про космос
        this.spaceFacts = [
            "🌟 A day on Venus is longer than a year on Venus! It takes 243 Earth days to rotate once.",
            "🌙 The Moon is slowly drifting away from Earth — about 3.8 cm per year!",
            "☀️ The Sun makes up 99.86% of the total mass of our Solar System!",
            "🪐 Saturn would float if you could find a bathtub big enough — it's less dense than water!",
            "⭐ Neutron stars are so dense that a teaspoon of their material would weigh 6 billion tons!",
            "🌌 There are more stars in the universe than grains of sand on all Earth's beaches!",
            "🚀 A space suit costs about $12 million — mostly for the backpack and control module!",
            "🔴 Olympus Mons on Mars is 3 times taller than Mount Everest!",
            "💫 The Milky Way and Andromeda galaxies will collide in about 4.5 billion years!",
            "🌍 Earth is the only planet not named after a Greek or Roman god!"
        ];
        
        this.currentTipIndex = 0;
        this.lastFactIndex = -1;
        this.init();
    }
    
    init() {
        this.createRobot();
        this.createSpeechBubble();
        
        // Початкова позиція (за межами екрану)
        this.currentX = -100;
        this.currentY = window.innerHeight * 0.3;
        this.updatePosition();
        
        // Запускаємо анімації
        this.startFloating();
        
        // Перша порада з затримкою
        setTimeout(() => this.flyAndShowTip(), 500);
        
        // Показуємо поради кожні 10 секунд
        setInterval(() => this.flyAndShowTip(), 10000);
        
        // Перша трансформація через 8 секунд
        setTimeout(() => this.idleTransform(), 8000);
        
        // Idle анімація — трансформація в тарілку кожні 20 секунд
        this.transformInterval = setInterval(() => this.idleTransform(), 20000);
        
        // Чергування сердечка та імені на екрані
        this.startScreenAnimation();
    }
    
    // Анімація екрану — чергування сердечка та імені
    startScreenAnimation() {
        const screen = this.element.querySelector('.robot-screen');
        let showName = false;
        
        setInterval(() => {
            // Не міняємо якщо в режимі UFO
            if (this.element.classList.contains('ufo-mode')) return;
            
            showName = !showName;
            if (showName) {
                screen.classList.add('show-name');
            } else {
                screen.classList.remove('show-name');
            }
        }, 10000);
    }
    
    // Idle анімація — трансформація в тарілку і назад
    idleTransform() {
        // Не трансформуємося якщо летимо - спробуємо пізніше
        if (this.isMoving) {
            setTimeout(() => this.idleTransform(), 3000);
            return;
        }
        
        // Перевіряємо чи вже в режимі UFO
        if (this.element.classList.contains('ufo-mode')) return;
        
        // Трансформуємось в UFO (тултіп залишається видимим)
        this.element.classList.add('ufo-mode');
        
        // Через 4 секунди повертаємось в робота
        setTimeout(() => {
            this.element.classList.remove('ufo-mode');
        }, 4000);
    }
    
    createRobot() {
        this.element = document.createElement('div');
        this.element.id = 'robot-guide';
        this.element.innerHTML = `
            <div class="robot-body">
                <div class="robot-antenna">
                    <div class="antenna-ball"></div>
                </div>
                <div class="robot-head">
                    <div class="robot-eye left"></div>
                    <div class="robot-eye right"></div>
                    <div class="robot-mouth"></div>
                </div>
                <div class="robot-torso">
                    <div class="robot-screen">
                        <div class="robot-screen-content">
                            <span class="robot-heart">♥</span>
                            <span class="robot-name-text">COSMO</span>
                        </div>
                    </div>
                </div>
                <div class="robot-arms">
                    <div class="robot-arm left"></div>
                    <div class="robot-arm right"></div>
                </div>
                <div class="robot-jetpack">
                    <div class="flame"></div>
                    <div class="flame"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.element);
        
        // Клік на робота — показує цікавий факт про космос
        this.element.addEventListener('click', () => {
            this.showSpaceFact();
        });
    }
    
    // Показати випадковий факт про космос
    showSpaceFact() {
        // Якщо робот летить — ігноруємо
        if (this.isMoving) return;
        
        // Ховаємо попередню підказку
        this.speechBubble.classList.remove('visible');
        
        // Вибираємо випадковий факт (не повторюємо попередній)
        let factIndex;
        do {
            factIndex = Math.floor(Math.random() * this.spaceFacts.length);
        } while (factIndex === this.lastFactIndex && this.spaceFacts.length > 1);
        
        this.lastFactIndex = factIndex;
        const fact = this.spaceFacts[factIndex];
        
        // Невелика затримка для плавності
        setTimeout(() => {
            this.showTip(fact, 10000); // 10 секунд для фактів про космос
            this.wave();
        }, 200);
    }
    
    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.id = 'robot-speech';
        this.speechBubble.innerHTML = `
            <div class="speech-content"></div>
            <div class="speech-arrow"></div>
        `;
        document.body.appendChild(this.speechBubble);
    }
    
    updatePosition() {
        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;
        
        // Оновлюємо позицію бульбашки тільки якщо вона видима
        // Інакше вона залишається на місці і зникає плавно
        if (!this.speechBubble.classList.contains('visible')) {
            // Не оновлюємо позицію поки бульбашка зникає
        } else {
            this.updateSpeechPosition();
        }
    }
    
    updateSpeechPosition() {
        const robotWidth = 60;
        const bubbleWidth = 200;
        const screenWidth = window.innerWidth;
        
        // Визначаємо чи робот ближче до правого краю
        const isNearRightEdge = this.currentX > screenWidth / 2;
        
        let bubbleX, bubbleY;
        
        if (isNearRightEdge) {
            // Показуємо тултіп ЗЛІВА від робота
            bubbleX = this.currentX - bubbleWidth - 20;
            this.speechBubble.classList.add('left-side');
            this.speechBubble.classList.remove('right-side');
        } else {
            // Показуємо тултіп СПРАВА від робота
            bubbleX = this.currentX + robotWidth + 20;
            this.speechBubble.classList.add('right-side');
            this.speechBubble.classList.remove('left-side');
        }
        
        bubbleY = this.currentY - 10;
        
        // Перевіряємо межі екрану
        bubbleX = Math.max(10, Math.min(bubbleX, screenWidth - bubbleWidth - 10));
        bubbleY = Math.max(10, bubbleY);
        
        this.speechBubble.style.left = `${bubbleX}px`;
        this.speechBubble.style.top = `${bubbleY}px`;
    }
    
    startFloating() {
        // Додаткова плаваюча анімація через CSS
    }
    
    // Отримати позицію біля карточки
    getCardPosition(cardSelector) {
        const card = document.querySelector(cardSelector);
        if (!card) return null;
        
        const rect = card.getBoundingClientRect();
        
        // Позиція зліва від карточки
        return {
            x: rect.left - 80,
            y: rect.top + rect.height / 2 - 40
        };
    }
    
    // Отримати випадкову позицію для загальних порад
    getRandomPosition() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const positions = [
            { x: w * 0.05, y: h * 0.15 },
            { x: w * 0.85, y: h * 0.12 },
            { x: w * 0.05, y: h * 0.75 },
            { x: w * 0.88, y: h * 0.78 },
        ];
        
        return positions[Math.floor(Math.random() * positions.length)];
    }
    
    // Спочатку летить, потім показує пораду
    flyAndShowTip() {
        // Якщо робот вже летить - ігноруємо
        if (this.isMoving) return;
        
        // Блокуємо повторні виклики
        this.isMoving = true;
        
        // Ховаємо попередню підказку одразу
        this.speechBubble.classList.remove('visible');
        
        let tipText;
        let targetPos;
        
        // Перше повідомлення — привітання
        if (!this.hasIntroduced) {
            tipText = this.introMessage;
            targetPos = { x: window.innerWidth * 0.4, y: window.innerHeight * 0.35 };
            this.hasIntroduced = true;
        } else {
            // Вибираємо випадкову пораду
            const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
            tipText = tip.text;
            
            // Визначаємо позицію
            if (tip.card) {
                targetPos = this.getCardPosition(tip.card);
            }
            
            // Якщо карточку не знайдено або порада загальна - випадкова позиція
            if (!targetPos) {
                targetPos = this.getRandomPosition();
            }
        }
        
        // Летимо до позиції
        this.currentX = targetPos.x;
        this.currentY = targetPos.y;
        this.updatePosition();
        
        // Показуємо пораду ПІСЛЯ прильоту (2.2 секунди - після анімації польоту 2с)
        setTimeout(() => {
            this.showTip(tipText);
            this.wave();
            this.isMoving = false; // Розблоковуємо
        }, 2200);
    }
    
    showTip(text, duration = 8000) {
        const content = this.speechBubble.querySelector('.speech-content');
        content.textContent = text;
        
        // Оновлюємо позицію бульбашки
        this.updateSpeechPosition();
        this.speechBubble.classList.add('visible');
        
        // Ховаємо через вказаний час
        setTimeout(() => {
            this.speechBubble.classList.remove('visible');
        }, duration);
    }
    
    wave() {
        this.element.classList.add('waving');
        setTimeout(() => {
            this.element.classList.remove('waving');
        }, 1500);
    }
}

// Ініціалізація після завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
    // Затримка щоб інші елементи завантажились
    setTimeout(() => {
        window.robotGuide = new RobotGuide();
    }, 1000);
});


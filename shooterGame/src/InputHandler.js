export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.mouseFollow = true;
        
        this.init();
    }
    
    init() {
        // Ігрові клавіші - блокуємо системні звуки
        const gameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ',
            'KeyP', 'Escape'
        ];
        
        // Клавіатура
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Блокуємо системні дії та звуки для ігрових клавіш
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Пауза
            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.game.isPaused = !this.game.isPaused;
            }

            // Перемикач керування мишею
            if (e.code === 'KeyM') {
                this.mouseFollow = !this.mouseFollow;
            }
        }, { passive: false });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // Блокуємо і для keyup
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Мобільні контроли
        this.setupMobileControls();
        
        // Миша для прицілювання (опціонально)
        this.setupMouseControls();
    }
    
    setupMobileControls() {
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="d-pad">
                <button class="control-btn" data-key="ArrowLeft">◀</button>
                <button class="control-btn" data-key="ArrowRight">▶</button>
            </div>
            <div class="action-btns">
                <button class="control-btn" data-key="ArrowUp">▲</button>
                <button class="control-btn fire-btn" data-key="Space">🔥</button>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(mobileControls);
        
        const buttons = mobileControls.querySelectorAll('.control-btn');
        
        buttons.forEach(btn => {
            const key = btn.dataset.key;
            
            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
            
            // Mouse events (для тестування)
            btn.addEventListener('mousedown', () => {
                this.keys[key] = true;
            });
            
            btn.addEventListener('mouseup', () => {
                this.keys[key] = false;
            });
            
            btn.addEventListener('mouseleave', () => {
                this.keys[key] = false;
            });
        });
    }
    
    setupMouseControls() {
        const canvas = this.game.app?.canvas;
        if (!canvas) return;
        
        // Стрільба та рух при утриманні миші
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.keys['MouseLeft'] = true;
            }
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.keys['MouseLeft'] = false;
            }
        });
        
        // Скидаємо стан миші якщо курсор виходить за межі canvas
        canvas.addEventListener('mouseleave', () => {
            this.keys['MouseLeft'] = false;
        });
        
        // Глобальний mouseup для випадків коли мишу відпускають за межами canvas
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.keys['MouseLeft'] = false;
            }
        });
        
        // Рух мишею
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    isKeyDown(code) {
        return this.keys[code] === true;
    }
    
    isKeyUp(code) {
        return this.keys[code] !== true;
    }
}


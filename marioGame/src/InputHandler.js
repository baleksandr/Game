export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        // Клавіатура
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Запобігаємо скролу сторінки
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            
            // Пауза
            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.game.isPaused = !this.game.isPaused;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Мобільні контроли (тач)
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // Створюємо мобільні кнопки
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="d-pad">
                <button class="control-btn" data-key="ArrowLeft">◀</button>
                <button class="control-btn" data-key="ArrowRight">▶</button>
            </div>
            <div class="action-btns">
                <button class="control-btn jump-btn" data-key="Space">⬆</button>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(mobileControls);
        
        // Обробка тачів
        const buttons = mobileControls.querySelectorAll('.control-btn');
        
        buttons.forEach(btn => {
            const key = btn.dataset.key;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
            
            // Також для миші (для тестування)
            btn.addEventListener('mousedown', (e) => {
                this.keys[key] = true;
            });
            
            btn.addEventListener('mouseup', (e) => {
                this.keys[key] = false;
            });
            
            btn.addEventListener('mouseleave', (e) => {
                this.keys[key] = false;
            });
        });
    }
    
    isKeyDown(code) {
        return this.keys[code] === true;
    }
    
    isKeyUp(code) {
        return this.keys[code] !== true;
    }
}


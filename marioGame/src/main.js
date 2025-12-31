import { Game } from './Game.js';

// Головна точка входу
async function startGame() {
    console.log('🍄 Starting Mario Platformer...');
    
    const game = new Game();
    await game.init();
    
    // Зберігаємо посилання на гру в глобальній області (для дебагу)
    window.game = game;
}

// Запускаємо гру коли DOM готовий
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}


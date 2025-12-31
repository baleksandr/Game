import { Game } from './Game.js';

/**
 * 🚀 Space Shooter
 * 
 * Космічний шутер на PixiJS з підтримкою Spine анімацій
 * 
 * Керування:
 * - ← → (A/D) - рух
 * - ↑ ↓ (W/S) - вертикальний рух  
 * - Space (Z) - стрільба
 * - P/Esc - пауза
 */

async function startGame() {
    console.log('🚀 Starting Space Shooter...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎮 Controls:');
    console.log('   ← → / A D  - Move');
    console.log('   ↑ ↓ / W S  - Vertical movement');
    console.log('   Space / Z  - Shoot');
    console.log('   P / Esc    - Pause');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const game = new Game();
    await game.init();
    
    // Для дебагу
    window.game = game;
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}


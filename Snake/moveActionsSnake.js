let currentDirection = 'ArrowRight'; // Початковий напрямок
let moveInterval;
const BASE_SPEED = 500; // Початкова швидкість
const MIN_SPEED = 100;  // Мінімальний інтервал (максимальна швидкість)
let currentSpeed = BASE_SPEED;
let foodEatenCount = 0; // Лічильник з'їденої їжі
let currentScore = 0;   // Поточний рахунок
let currentLevel = 1;   // Поточний рівень
let highScore = localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0; // Найкращий результат
const BONUS_CHANCE = 0.2;
const BONUS_DURATION = 8000;
let scoreMultiplier = 1;
let multiplierTimer = null;

// Ініціалізація панелі скора
function initScorePanel() {
    updateScoreDisplay();
    document.getElementById('high-score').textContent = highScore;
    updateSpeedBar();
}

// Оновлення відображення скора
function updateScoreDisplay() {
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('current-level').textContent = currentLevel;
    const lengthEl = document.getElementById('current-length');
    if (lengthEl) {
        lengthEl.textContent = snake?.length || 1;
    }
    
    // Оновлюємо найкращий результат
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('snakeHighScore', String(highScore));
        document.getElementById('high-score').textContent = highScore;
    }
}

// Оновлення індикатора швидкості
function updateSpeedBar() {
    const speedPercent = ((BASE_SPEED - currentSpeed) / (BASE_SPEED - MIN_SPEED)) * 100;
    const fill = document.getElementById('speed-fill');
    if (fill) {
        const clamped = Math.min(100, Math.max(0, speedPercent));
        fill.style.width = clamped + '%';
    }
}

// Виклик ініціалізації при завантаженні (працює і якщо DOM уже готовий)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScorePanel);
} else {
    initScorePanel();
}

function startSnakeMovement() {
    moveInterval = setInterval(() => {
        moveSnake(currentDirection); // Move the snake in the current direction
    }, currentSpeed); // Динамічна швидкість
}

// Оновлення напрямку за допомогою клавіш
function moveActionsSnake(e) {
    // if (isPausedGame) {
        switch (e) {
            case 'ArrowUp':
                if (currentDirection !== 'ArrowDown') currentDirection = 'ArrowUp';
                break;
            case 'ArrowDown':
                if (currentDirection !== 'ArrowUp') currentDirection = 'ArrowDown';
                break;
            case 'ArrowLeft':
                if (currentDirection !== 'ArrowRight') currentDirection = 'ArrowLeft';
                break;
            case 'ArrowRight':
                if (currentDirection !== 'ArrowLeft') currentDirection = 'ArrowRight';
                break;
            case ' ':
                scapePause()
                break;
            case 'r':
            case 'R':
                restartSnake.click();
                break;
        // }
    }
}

// Зупинка гри
function stopGame() {
    clearInterval(moveInterval); // Зупиняємо автоматичний рух
}

// // Виклик функції для старту гри
// startSnakeMovement();

function scapePause(){
    if (isPausedGame) {
        isPausedGame = false;
        pauseGame.style.display = 'none';
        startSnakeMovement();
    } else {
        isPausedGame = true;
        pauseGame.style.display = 'flex';
        stopGame();
    }
}

document.addEventListener('keydown', onKeyDownPress)


function onKeyDownPress(e) {
    moveActionsSnake(e.key);
}

function moveSnake(direction) {
    // Отримуємо поточну позицію голови
    const head = snake[0];

    const rowOffset = direction === 'ArrowDown' ? 1 : direction === 'ArrowUp' ? -1 : 0;
    const columnOffset = direction === 'ArrowRight' ? 1 : direction === 'ArrowLeft' ? -1 : 0;

    // Рух із «проходом крізь стіни» — вихід за межі переносить на протилежний бік
    const wrappedRow = head.row + rowOffset < 0
        ? PLAYFIELD_ROWS - 1
        : head.row + rowOffset >= PLAYFIELD_ROWS
            ? 0
            : head.row + rowOffset;

    const wrappedColumn = head.column + columnOffset < 0
        ? PLAYFIELD_COLUMNS - 1
        : head.column + columnOffset >= PLAYFIELD_COLUMNS
            ? 0
            : head.column + columnOffset;

    const newHead = {
        row: wrappedRow,
        column: wrappedColumn
    };

    const willGrow = food && newHead.row === food.row && newHead.column === food.column;

    if (isObstacleCell(newHead)) {
        playSnake("game_over", 1);
        gameOverSnake.style.display = 'flex';
        stopGame();
        return;
    }

    if (snakeCollidesWithItself(newHead, willGrow)) {
        playSnake("game_over", 1);
        gameOverSnake.style.display = 'flex';
        stopGame()
        return;
    }
     // Check if the snake collides with itself
    snakeUpdate(newHead);

}

function snakeUpdate(newHead) {
    // Add the new head
    snake.unshift(newHead);

    // Check if the new head is on the food
    const foodIndex = convertPositionToIndexOnABord(food.row, food.column);
    const newHeadIndex = convertPositionToIndexOnABord(newHead.row, newHead.column);
    const hitBonus = bonus && newHead.row === bonus.row && newHead.column === bonus.column;

    if (newHeadIndex === foodIndex) {
        playSnake("eat", 1);
        
        // Збільшуємо лічильник з'їденої їжі та скор
        foodEatenCount++;
        currentScore += (10 * currentLevel) * scoreMultiplier; // Більше очок на вищих рівнях
        updateScoreDisplay();
        
        // Перевіряємо чи потрібно збільшити швидкість (кожні 7 з'їдених яблук)
        if (foodEatenCount > 0 && foodEatenCount % 7 === 0 && currentSpeed > MIN_SPEED) {
            currentSpeed -= 50; // Збільшуємо швидкість на 50мс
            currentLevel++;     // Збільшуємо рівень
            
            updateScoreDisplay();
            updateSpeedBar();
            
            // Перезапускаємо інтервал з новою швидкістю
            clearInterval(moveInterval);
            moveInterval = setInterval(() => {
                moveSnake(currentDirection);
            }, currentSpeed);
        }
        
        spawnBonusWithChance();
        
        // Generate new food position
        do {
            food = {row: randomRow(), column: randomColumn()};
        } while (snake.some(segment => segment.row === food.row && segment.column === food.column) || isObstacleCell(food));
    } else {
        // Remove the tail if food is not eaten
        const tail = snake.pop();
        snakePlayField[tail.row][tail.column] = 0;
    }
    
    if (hitBonus) {
        applyBonus(bonus.type);
        if (typeof clearBonus === 'function') {
            clearBonus();
        } else {
            bonus = null;
        }
    }

    // Update the playfield
    snakePlayField[newHead.row][newHead.column] = 1;

    // Redraw the playfield
    generateSnakePlayField();

}

function playSnake(soundName, volume) {
    playSoundSnake.src = `sound/${soundName}.mp3`;
    playSoundSnake.volume = volume;
    playSoundSnake.play();
}

function snakeCollidesWithItself(newHead, willGrow = false) {
    return snake.some((segment, index) => {
        // Дозволяємо рух у клітинку хвоста, якщо він зараз зсунеться (коли немає їжі)
        const isTail = index === snake.length - 1;
        if (isTail && !willGrow) return false;
        return index > 0 && segment.row === newHead.row && segment.column === newHead.column;
    });
}

function isObstacleCell(target) {
    if (!target) return false;
    const row = typeof target === 'object' ? target.row : target;
    const column = typeof target === 'object' ? target.column : arguments[1];
    return obstacles?.some(ob => ob.row === row && ob.column === column);
}

function spawnBonusWithChance() {
    if (bonus || Math.random() > BONUS_CHANCE) return;
    
    let candidate;
    do {
        candidate = { row: randomRow(), column: randomColumn() };
    } while (
        snake.some(segment => segment.row === candidate.row && segment.column === candidate.column) ||
        isObstacleCell(candidate) ||
        (food && candidate.row === food.row && candidate.column === food.column)
    );
    
    const type = Math.random() > 0.5 ? 'double' : 'slow';
    bonus = { ...candidate, type };
    
    if (typeof bonusTimer !== 'undefined') {
        if (bonusTimer) clearTimeout(bonusTimer);
        bonusTimer = setTimeout(() => {
            if (typeof clearBonus === 'function') {
                clearBonus();
            } else {
                bonus = null;
            }
            generateSnakePlayField();
        }, BONUS_DURATION);
    }
    
    generateSnakePlayField();
}

function applyBonus(type) {
    if (type === 'double') {
        scoreMultiplier = 2;
        
        // Показуємо індикатор бонусу
        const bonusIndicator = document.getElementById('bonus-indicator');
        const bonusActive = document.getElementById('bonus-active');
        if (bonusIndicator && bonusActive) {
            bonusActive.textContent = '2x SCORE';
            bonusActive.style.color = '#ffd700';
            bonusIndicator.style.display = 'block';
        }
        
        if (multiplierTimer) clearTimeout(multiplierTimer);
        multiplierTimer = setTimeout(() => {
            scoreMultiplier = 1;
            multiplierTimer = null;
            
            // Ховаємо індикатор
            if (bonusIndicator) {
                bonusIndicator.style.display = 'none';
            }
        }, BONUS_DURATION);
    } else if (type === 'slow') {
        currentSpeed = Math.min(BASE_SPEED, currentSpeed + 120);
        clearInterval(moveInterval);
        moveInterval = setInterval(() => moveSnake(currentDirection), currentSpeed);
        updateSpeedBar();
        
        // Показуємо індикатор slowdown
        const bonusIndicator = document.getElementById('bonus-indicator');
        const bonusActive = document.getElementById('bonus-active');
        if (bonusIndicator && bonusActive) {
            bonusActive.textContent = 'SLOWDOWN';
            bonusActive.style.color = '#00ffff';
            bonusIndicator.style.display = 'block';
            
            // Ховаємо через 2 секунди (для slowdown це просто повідомлення)
            setTimeout(() => {
                if (bonusIndicator) {
                    bonusIndicator.style.display = 'none';
                }
            }, 2000);
        }
    }
}

restartSnake.addEventListener("click", () => {
    // Скидаємо швидкість та лічильники на початкові
    currentSpeed = BASE_SPEED;
    currentDirection = 'ArrowRight';
    foodEatenCount = 0; // Скидаємо лічильник з'їденої їжі
    currentScore = 0;   // Скидаємо скор
    currentLevel = 1;   // Скидаємо рівень
    scoreMultiplier = 1;
    if (multiplierTimer) {
        clearTimeout(multiplierTimer);
        multiplierTimer = null;
    }
    
    // Ховаємо індикатор бонусу
    const bonusIndicator = document.getElementById('bonus-indicator');
    if (bonusIndicator) {
        bonusIndicator.style.display = 'none';
    }
    
    if (typeof clearBonus === 'function') {
        clearBonus();
    } else {
        bonus = null;
    }
    
    updateScoreDisplay();
    updateSpeedBar();
    
    pauseGame.style.display = 'flex';
    gameOverSnake.style.display = 'none';
    placeSnakeAndFood();
    stopGame();
})
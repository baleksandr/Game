let currentDirection = 'ArrowRight'; // Початковий напрямок
let moveInterval;
const BASE_SPEED = 500; // Початкова швидкість
const MIN_SPEED = 100;  // Мінімальний інтервал (максимальна швидкість)
let currentSpeed = BASE_SPEED;
let foodEatenCount = 0; // Лічильник з'їденої їжі

function startSnakeMovement() {
    const head = snake[0];
    if (head.row === 0 && currentDirection === 'ArrowUp') {
        currentDirection = 'ArrowDown';
    } else if (head.row === PLAYFIELD_ROWS - 1 && currentDirection === 'ArrowDown') {
        currentDirection = 'ArrowUp';
    } else if (head.column === 0 && currentDirection === 'ArrowLeft') {
        currentDirection = 'ArrowRight';
    } else if (head.column === PLAYFIELD_COLUMNS - 1 && currentDirection === 'ArrowRight') {
        currentDirection = 'ArrowLeft';
    }

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
    console.log(isPausedGame)
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
    console.log(e.key);
    moveActionsSnake(e.key);
}

function moveSnake(direction) {
    // Отримуємо поточну позицію голови
    const head = snake[0];

    const rowOffset = direction === 'ArrowDown' ? 1 : direction === 'ArrowUp' ? -1 : 0;
    const columnOffset = direction === 'ArrowRight' ? 1 : direction === 'ArrowLeft' ? -1 : 0;


    const newHead = {
        row: head.row + rowOffset,
        column: head.column + columnOffset
    };

    // Перевірка на вихід за межі поля
    if (
        newHead.row < 0 ||
        newHead.row >= PLAYFIELD_ROWS ||
        newHead.column < 0 ||
        newHead.column >= PLAYFIELD_COLUMNS ||
        snakePlayField[newHead.row][newHead.column] === 1
    ) {
        isPausedGame = true;
        // pauseGame.style.display = 'flex';
        playSnake("game_over", 1);
        console.log("Гра закінчена");
        gameOverSnake.style.display = 'flex';
        stopGame() // Stop the game loop
        return;
    }
    if (snakeCollidesWithItself(newHead)) {
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
    const snakeIndex = convertPositionToIndexOnABord(food.row, food.column);
    const newHeadIndex = convertPositionToIndexOnABord(newHead.row, newHead.column);

    if (newHeadIndex === foodIndex) {
        console.log("Food eaten!");

        playSnake("eat", 1);
        
        // Збільшуємо лічильник з'їденої їжі
        foodEatenCount++;
        
        // Перевіряємо чи потрібно збільшити швидкість (кожні 7 з'їдених яблук)
        if (foodEatenCount > 0 && foodEatenCount % 7 === 0 && currentSpeed > MIN_SPEED) {
            currentSpeed -= 50; // Збільшуємо швидкість на 50мс
            console.log(`Рівень ${foodEatenCount / 7}! Нова швидкість: ${currentSpeed}мс`);
            
            // Перезапускаємо інтервал з новою швидкістю
            clearInterval(moveInterval);
            moveInterval = setInterval(() => {
                moveSnake(currentDirection);
            }, currentSpeed);
        }
        
        // Generate new food position
        do {
            food = {row: randomPosition(), column: randomPosition()};
        } while (snake.some(segment => segment.row === food.row && segment.column === food.column));
    } else {
        // Remove the tail if food is not eaten
        const tail = snake.pop();
        snakePlayField[tail.row][tail.column] = 0;
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

function snakeCollidesWithItself(newHead) {
    if (snake.some((segment, index) => index > 0 && segment.row === newHead.row && segment.column === newHead.column)) {
        // console.log("Game over: Snake collided with itself");
        return true;
    }
}

restartSnake.addEventListener("click", () => {
    // Скидаємо швидкість та лічильники на початкові
    currentSpeed = BASE_SPEED;
    currentDirection = 'ArrowRight';
    foodEatenCount = 0; // Скидаємо лічильник з'їденої їжі
    
    pauseGame.style.display = 'flex';
    gameOverSnake.style.display = 'none';
    placeSnakeAndFood();
    stopGame();
})
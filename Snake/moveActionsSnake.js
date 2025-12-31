let currentDirection = 'ArrowRight'; // Початковий напрямок
let moveInterval;

// Функція для автоматичного руху змії
// function startSnakeMovement() {
//     // if (!isPausedGame) {
//         moveInterval = setInterval(() => {
//             moveSnake(currentDirection); // Move the snake in the current direction
//         }, 500); // Movement interval (200 ms)
//     // }
// }

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
    }, 500); // Movement interval (200 ms)
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



// Запуск гри
document.addEventListener('keydown', (e) => {
    moveActionsSnake(e.key);
});

// Зупинка гри
function stopGame() {

    clearInterval(moveInterval); // Зупиняємо автоматичний рух
    document.removeEventListener('keydown', onKeyDownPress); // Видаляємо слухач
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



// function moveActionsSnake(e) {
//     // if (e === 'Escape') {
//     //     togglePauseGame();
//     // }
//
//     if (!isPausedGame) {
//         switch (e) {
//             // case ' ':
//             case 'ArrowUp':
//                 // moveSnakeUp();
//                 moveSnake("ArrowUp")
//                 break;
//             case 'ArrowDown':
//                 // moveSnakeDown();
//                 moveSnake("ArrowDown")
//                 break;
//             case 'ArrowLeft':
//                 // moveSnakeLeft();
//                 moveSnake("ArrowLeft")
//                 break;
//             case 'ArrowRight':
//                 // moveSnakeRight();
//                 moveSnake("ArrowRight")
//                 break;
//         }
//         // draw();
//     }
// }

document.addEventListener('keydown', onKeyDownPress)


function onKeyDownPress(e) {
    console.log(e.key);
    moveActionsSnake(e.key);
}

// function moveSnakeUp() {
//     // Отримуємо поточну позицію голови
//     const head = snake[0];
//     const newHead = { row: head.row - 1, column: head.column };
//     console.log(snake);
//     console.log(newHead);
//
//     // Перевірка на вихід за межі поля
//     if (newHead.row < 0 || snakePlayField[newHead.row][newHead.column] === 1) {
//         console.log("Гра закінчена");
//         return;
//     }
//
//     snakeUpdate(newHead);
// }
//
// function moveSnakeDown() {
//     // Отримуємо поточну позицію голови
//     const head = snake[0];
//     const newHead = { row: head.row + 1, column: head.column };
//
//     // Перевірка на вихід за межі поля
//     if (newHead.row >= PLAYFIELD_ROWS || snakePlayField[newHead.row][newHead.column] === 1) {
//         console.log("Гра закінчена");
//         return;
//     }
//     snakeUpdate(newHead);
// }

function moveSnake(direction) {
    // Отримуємо поточну позицію голови
    const head = snake[0];
    // head.className = 'head';
    // console.log("head", head);
    // console.log("snake",document.querySelectorAll('.grid div')[convertPositionToIndexOnABord(head.row, head.column)] ) ;


    const rowOffset = direction === 'ArrowDown' ? 1 : direction === 'ArrowUp' ? -1 : 0;
    const columnOffset = direction === 'ArrowRight' ? 1 : direction === 'ArrowLeft' ? -1 : 0;


    const newHead = {
        row: head.row + rowOffset,
        column: head.column + columnOffset
    };

    // snake.forEach((newHead, index) => {
    //     const snakeIndex = convertPositionToIndexOnABord(newHead.row, newHead.column);
    //     const cell = document.querySelectorAll('.grid div')[snakeIndex];
    //     console.log(cell);
    //
    //     if (cell.className == "snake" && snake.length > 1) {
    //         cell.classList.add('snake-tail'); // Add the tail class to the last segment
    //     } else {
    //         cell.classList.add('snake'); // Add the snake class to other segments
    //     }
    // });


    // snake.forEach(segment => {
    //     const snakeIndex = convertPositionToIndexOnABord(segment.row, segment.column);
    //     document.querySelectorAll('.grid div')[snakeIndex].classList.add('snake');
    // });
    // console.log( "snake", snake);
    // console.log( "newHead", newHead);

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

// function snakeUpdate(newHead) {
//     // Додаємо нову голову
//     snake.unshift(newHead);
//
//     // Видаляємо хвіст, якщо їжа не була з'їдена
//     const tail = snake.pop();
//     snakePlayField[tail.row][tail.column] = 0;
//
//     // Оновлюємо поле
//     snakePlayField[newHead.row][newHead.column] = 1;
//
//     // Перемальовуємо поле
//     generateSnakePlayField();
// }
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
        // Generate new food position
        do {
            food = {row: randomPosition(), column: randomPosition()};
        } while (snake.some(segment => segment.row === food.row && segment.column === food.column));
    } else {
        // Remove the tail if food is not eaten
        const tail = snake.pop();
        snakePlayField[tail.row][tail.column] = 0;
    }
// If the snake collides with itself, the game is over
//     if (snake.some((segment, index) => index !== 0 && segment.row === newHead.row && segment.column === newHead.column)) {
//         console.log("Game over: Snake collided with itself");
//         return;
//     }


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
    // stopLoop();
    // isPausedGame = false;
    pauseGame.style.display = 'flex';
    gameOverSnake.style.display= 'none';
    placeSnakeAndFood();
    stopGame()
    // soundId = setTimeout(() => genericClick("generic_click", 0.25), 100);
})
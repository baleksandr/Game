const grid = document.querySelector('.grid');
const pauseGame = document.querySelector('.loaderPause');
const restartSnake = document.querySelector('.restartSnake');
const gameOverSnake = document.querySelector('.gameOver');
const playSoundSnake = new Audio();
// const playSound = document.createElement('audio');
const PLAYFIELD_COLUMNS = 20;
const PLAYFIELD_ROWS = 22
let snakePlayField;
let snake


let food
// let snake = [{ row: randomPosition(), column: randomPosition() }]; // Initial position of the snake
// let food = { row: randomPosition(), column: randomPosition() }; // Initial position of the food
console.log("snake", snake);
console.log("food", food);
let isPausedGame = true;
pauseGame.style.display = 'none';
gameOverSnake.style.display= 'none';

if (isPausedGame) pauseGame.style.display = 'flex';
placeSnakeAndFood();

function placeSnakeAndFood() {
    // Generate random position for the snake
    snake = [{ row: randomPosition(), column: randomPosition() }];

    console.log("snake", snake);
    // Generate random position for the food, ensuring it doesn't overlap with the snake
    do {
        food = { row: randomPosition(), column: randomPosition() };
    } while (snake.some(segment => segment.row === food.row && segment.column === food.column));

    // Update the playfield
    generateSnakePlayField();
    // startSnakeMovement();
}



function randomPosition() {
    return Math.floor(Math.random() * PLAYFIELD_COLUMNS);
}

function generateSnakePlayField() {
    // Clear the grid container
    grid.innerHTML = '';

    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.grid').append(div);
        // document.querySelector('.grid').removeAttribute(".div");
    }

    // Clear the grid
    document.querySelectorAll('.grid div').forEach(cell => {
        cell.className = ''; // Remove all classes
    });

    // Place the snake
    // snake.forEach(segment => {
    //     const snakeIndex = convertPositionToIndexOnABord(segment.row, segment.column);
    //     document.querySelectorAll('.grid div')[snakeIndex].classList.add('snake');
    //     // console.log("snakeIndex", snakeIndex);
    // });
    snake.forEach((segment, index) => {
        const snakeIndex = convertPositionToIndexOnABord(segment.row, segment.column);
        const cell = document.querySelectorAll('.grid div')[snakeIndex];

        if (index === 0) {
            cell.classList.add('snake-head'); // Add the head class to the first segment
        } else if (index === snake.length - 1) {
            cell.classList.add('snake-tail'); // Add the tail class to the last segment
        } else {
            cell.classList.add('snake'); // Add the snake class to other segments
        }
    });

    // Place the food
    const foodIndex = convertPositionToIndexOnABord(food.row, food.column);
    document.querySelectorAll('.grid div')[foodIndex].classList.add('food');



    snakePlayField = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function convertPositionToIndexOnABord(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

// function drawPlayField() {
//     for (let row = 0; row < PLAYFIELD_ROWS; row++) {
//         for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
//             if (playField[row][column] === 0) continue;
//
//             const name = playField[row][column];
//             const cellIndex = convertPositionToIndex(row, column);
//
//             cells[cellIndex].classList.add(name)
//             // cells[cellIndex].style.backgroundColor = color;
//         }
//     }
// }

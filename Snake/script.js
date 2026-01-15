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
let obstacles = [];
let bonus = null;
let bonusTimer = null;
// let snake = [{ row: randomPosition(), column: randomPosition() }]; // Initial position of the snake
// let food = { row: randomPosition(), column: randomPosition() }; // Initial position of the food
let isPausedGame = true;
pauseGame.style.display = 'none';
gameOverSnake.style.display= 'none';

if (isPausedGame) pauseGame.style.display = 'flex';
placeSnakeAndFood();

function placeSnakeAndFood() {
    clearBonus();
    obstacles = [];
    
    // Generate random position for the snake
    snake = [{ row: randomRow(), column: randomColumn() }];
    
    generateObstacles();
    
    // Generate random position for the food, ensuring it doesn't overlap with the snake or obstacles
    do {
        food = { row: randomRow(), column: randomColumn() };
    } while (!isCellFree(food.row, food.column));

    // Update the playfield
    generateSnakePlayField();
    // startSnakeMovement();
}



function randomColumn() {
    return Math.floor(Math.random() * PLAYFIELD_COLUMNS);
}

function randomRow() {
    return Math.floor(Math.random() * PLAYFIELD_ROWS);
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

    // Place obstacles
    obstacles.forEach(ob => {
        const obstacleIndex = convertPositionToIndexOnABord(ob.row, ob.column);
        document.querySelectorAll('.grid div')[obstacleIndex].classList.add('obstacle');
    });
    
    // Place bonus item if present
    if (bonus) {
        const bonusIndex = convertPositionToIndexOnABord(bonus.row, bonus.column);
        const cell = document.querySelectorAll('.grid div')[bonusIndex];
        cell.classList.add(bonus.type === 'double' ? 'bonus-double' : 'bonus-slow');
    }
    
    // Build playfield map (0 empty, 1 snake, 2 obstacle)
    snakePlayField = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
    snake.forEach(segment => {
        snakePlayField[segment.row][segment.column] = 1;
    });
    obstacles.forEach(ob => {
        snakePlayField[ob.row][ob.column] = 2;
    });
}

function convertPositionToIndexOnABord(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function isCellFree(row, column) {
    const overlapsSnake = snake?.some(segment => segment.row === row && segment.column === column);
    const overlapsObstacle = obstacles?.some(ob => ob.row === row && ob.column === column);
    return !overlapsSnake && !overlapsObstacle;
}

function generateObstacles() {
    const levelValue = typeof currentLevel === 'undefined' ? 1 : currentLevel;
    const obstacleCount = Math.min(4 + levelValue * 2, 18);
    
    while (obstacles.length < obstacleCount) {
        const candidate = { row: randomRow(), column: randomColumn() };
        if (isCellFree(candidate.row, candidate.column)) {
            obstacles.push(candidate);
        }
    }
}

function clearBonus() {
    if (bonusTimer) {
        clearTimeout(bonusTimer);
        bonusTimer = null;
    }
    bonus = null;
}

// Touch / mobile controls
document.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => moveActionsSnake(btn.dataset.dir));
});

const pauseBtn = document.querySelector('.touch-btn.pause');
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => scapePause());
}

// Info modal
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const infoClose = document.getElementById('info-close');

if (infoBtn && infoModal) {
    const closeInfo = () => infoModal.classList.remove('active');
    infoBtn.addEventListener('click', () => infoModal.classList.add('active'));
    if (infoClose) infoClose.addEventListener('click', closeInfo);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) closeInfo();
    });
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

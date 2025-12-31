const playGameButton = document.querySelector('.playGame')
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const playSoundInfo = new Audio();
const SCORE_DIVISOR = 200;
const SPEED_INCREASE_FACTOR = 0.05;
const BASE_SPEED = 700;
const MIN_SPEED = 100;

const NEW_PLAYFIELD_COLUMNS = 4;
const NEW_PLAYFIELD_ROWS = 4;
const TETROMONO_NAMES = ['O', 'I', 'S', 'Z', 'L', 'J', 'T']

const TETROMINOES = {
    'O': [[1, 1], [1, 1]],
    'I': [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    'S': [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    'Z': [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    'L': [[0, 0, 0], [0, 0, 1], [1, 1, 1]],
    'J': [[0, 0, 0], [1, 0, 0], [1, 1, 1]],
    'T': [[0, 0, 0], [1, 1, 1], [0, 1, 0]]
}

let localtime = document.querySelector('.localtime');
// let settings = document.querySelector('.settings');
let settings = document.querySelector('.loader');
let scoreTetris = document.querySelector('.score');
let bestScoreTetris = document.querySelector('.bestScore');
let speedLvl = document.querySelector('.speed');
let collectedLines = document.querySelector('.collected');
// let timeToPlay = document.querySelector('.timeToPlay');
let nextElement = document.querySelector('.nextElement');
let newImage = 0;
let imageBack;``
let settingKey = false;

// Timer files
const hourElement = document.querySelector('.hour');
const minuteElement = document.querySelector('.minutes');
const secondElement = document.querySelector('.seconds');
const milisecondsElement = document.querySelector('.miliseconds');
const overlay = document.querySelector('.overlay');
const btnRestartGameOver = document.querySelector('.rest');
const restart = document.querySelector('.restart');
const info = document.querySelector('#info');
const clearResults = document.querySelector('.clear_results');


const topBtn = document.querySelector('.strelka-top-1');
const leftBtn = document.querySelector('.strelka-left-1');
const bottomBtn = document.querySelector('.strelka-bottom-1');
const rightBtn = document.querySelector('.strelka-right-1');
const dropDownBtn = document.querySelector('.dropDownBtn');
const overlayAlert = document.querySelector('.overlayAlert');
const alertYes = document.querySelector('.alertYes');
const alertNo = document.querySelector('.alertNo');

const buttonOne = document.querySelector('#one');
const modalContainer = document.querySelector('#modal-container');
const body = document.querySelector('body');
const modal_settings = document.querySelector(".modal_settings");
const change_backButton = document.querySelector(".change_back");
const change_background = document.querySelector(".change_background");
const change_block_color = document.querySelector("#change_block_color");


//Variables
let hour = 0,
    minute = 0,
    second = 0,
    miliseconds = 0,
    timeInterval,
    soundId,
    volume,
    // resultStorage = {},
    speedIncrease;


let updatedSpeed = 700;
let speedValue = 1;
let playField;
let newPlayField;
let tetromono;
let newTetromono;
let score = 0;
let bestScore = 0;
let tetroTimerId;
let speed = 0;
let isGameOver = false
let counter = 1;
let cells;
let cellsNew;
let tetrominoElement = [];
init();

function clearFields() {
    hour = 0
    minute = 0
    second = 0
    miliseconds = 0
    score = 0
    speed = 0
    speedValue = 1
    updatedSpeed = 700
    collectedLinesAmount = 0
    hourElement.textContent = "00 :"
    minuteElement.textContent = "00 :"
    secondElement.textContent = "00 :"
    milisecondsElement.textContent = "00"
    scoreTetris.innerText = score
    speedLvl.innerHTML = `${speedValue}`
    collectedLines.innerHTML = `${collectedLinesAmount}`
}

function init() {
    isGameOver = false;
    generateNewPlayField();
    generateNeWTetromino();
    generatePlayField();
    generateTetromino(tetrominoElement);
    cells = document.querySelectorAll('.grid div');
    cellsNew = document.querySelectorAll('.nextElement div');
    randomElement();
}

btnRestartGameOver.addEventListener("click", () => {
    soundId = setTimeout(() => genericClick("generic_click", 0.25), 100);
    const results = document.querySelector('.results');
    const block = document.createElement("div");
    block.className = "blockResults";
    block.innerText = `${counter}. Score: ${score}, Best Score: ${bestScore}, Speed Value: ${speedValue}, Collected Lines: ${collectedLinesAmount}`;
    counter++;
    results.append(block);
    bestScoreTetris.innerText = bestScore;

    restartGame();
});

restart.addEventListener("click", () => {
    stopLoop();
    isPaused = true;
    overlayAlert.style.display = 'flex';
    soundId = setTimeout(() => genericClick("generic_click", 0.25), 100);
})

alertYes.addEventListener('click', () => {
    overlayAlert.style.display = 'none';
    restartGame();
    bestScore = 0;
    bestScoreTetris.innerText = bestScore;
    clearAllResults();
    soundId = setTimeout(() => genericClick("generic_click", 0.25), 100);
    // resultStorage.clear();
    // generateNeWTetromino();
    // randomElement();
});

alertNo.addEventListener('click', () => {
    overlayAlert.style.display = 'none';
    playGameButton.className = 'playGame';
    soundId = setTimeout(() => genericClick("generic_click", 0.25), 100);
});

function restartGame() {
    document.querySelector('.grid').innerHTML = ''
    document.querySelector('.nextElement').innerHTML = ''
    overlay.style.display = 'none';
    init();
    playGameButton.className = 'playGame';
    clearInterval(timeInterval);
    clearFields();

}

// const scoreDefOutText = scoreTetris.innerText;
function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function convertNewPositionToIndex(row, column) {
    return row * NEW_PLAYFIELD_COLUMNS + column;
}

function generateNewPlayField() {
    for (let i = 0; i < NEW_PLAYFIELD_ROWS * NEW_PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.nextElement').append(div);
        // document.querySelector('.grid').removeAttribute(".div");
    }

    newPlayField = new Array(NEW_PLAYFIELD_ROWS).fill().map(() => new Array(NEW_PLAYFIELD_COLUMNS).fill(0));
}


function generatePlayField() {
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.grid').append(div);
        // document.querySelector('.grid').removeAttribute(".div");
    }

    playField = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function randomTetrominoElement(array) {
    // случайное число от min до (max+1)
    return array[Math.floor(Math.random() * array.length)];
}

function setColor() {
    let hex = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        let index = Math.floor(Math.random() * 16)
        color += hex[index];
    }

    return color;
}

//
let color = setColor();

// console.log("setColor()", color)

function randomElement() {
    // console.log("TETROMONO_NAMES", TETROMONO_NAMES)
    // tetrominoElement = randomTetrominoElement(TETROMONO_NAMES);
    // console.log("randomElement tetrominoElement", tetrominoElement)
    return randomTetrominoElement(TETROMONO_NAMES)
}

// randomElement();


function generateNeWTetromino() {
    // const name = randomElement();
    // tetrominoElement.length = 2;
    //     tetrominoElement.splice(1,2,randomElement());
    tetrominoElement.unshift(randomElement());
    if (tetrominoElement.length > 2) {
        tetrominoElement.pop();
    }

    // newTetroGenerate = true;

    const matrix = TETROMINOES[tetrominoElement[0]];
    // tetrominoElement = name;

    // console.log("generateNeWTetromino tetrominoElement", tetrominoElement)
    const columnTetromino = NEW_PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const rowTetro = 0;

    newTetromono = {
        name: tetrominoElement[0],
        matrix,
        row: rowTetro,
        column: columnTetromino,
    }
    // console.log("tetromono.row", newTetromono.row)
}


function generateTetromino(tetroRandom) {
    // const name = randomElement();
    // console.log("generateTetromino tetroRandom", tetroRandom[0])
    // console.log("generateTetromino tetrominoElement", tetroRandom)
    const matrix = TETROMINOES[tetroRandom[0]];
    const columnTetromino = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const rowTetro = -3;


    tetromono = {
        name: tetroRandom[0],
        matrix,
        row: rowTetro,
        column: columnTetromino,
    }
    // generateNeWTetromino();
    // randomElement();
}

function placeTetromino(tetElement) {
    const matrixSize = tetromono.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (tetromono.matrix[row][column]) {

                if (isOutsideOfTopGameBoard(row)) {
                    isGameOver = true;
                    return;
                }
                playField[tetromono.row + row][tetromono.column + column] = tetElement
            }
        }
    }
    // generateTetromino(tetElement);
    // drawPlayField();
}

// function placeNewTetromino() {
//     const matrixSize = newTetromono.matrix.length;
//     for (let row = 0; row < matrixSize; row++) {
//         for (let column = 0; column < matrixSize; column++) {
//             if (newTetromono.matrix[row][column]) {
//                 newPlayField[row][column] = newTetromono.name
//                 newPlayField[newTetromono.row + row][newTetromono.column + column] = newTetromono.name
//                 // playField[tetromono.row + row][tetromono.column + column] = tetromono.name
//             }
//         }
//     }
//     generateNeWTetromino();
// }


// function drawNewPlayField() {
//     for (let row = 0; row < NEW_PLAYFIELD_ROWS; row++) {
//         for (let column = 0; column < NEW_PLAYFIELD_COLUMNS; column++) {
//             if (newPlayField[row][column] === 0) continue;
//
//             const name = newPlayField[row][column];
//             console.log("drawNewPlayField name", name)
//             const cellIndex = convertNewPositionToIndex(row, column);
//             cellsNew[cellIndex].classList.add(name)
//             // console.log(cellsNew[cellIndex].classList.add(name))
//             // cells[cellIndex].style.backgroundColor = color;
//         }
//     }
// }

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playField[row][column] === 0) continue;

            const name = playField[row][column];
            const cellIndex = convertPositionToIndex(row, column);

            cells[cellIndex].classList.add(name)
            // cells[cellIndex].style.backgroundColor = color;
        }
    }
}

function drawNewTetromino() {
    // let color = setColor();
    const name = newTetromono.name;
    const tetrominoMatrixSizeNew = newTetromono.matrix.length;

    for (let row = 0; row < tetrominoMatrixSizeNew; row++) {
        for (let column = 0; column < tetrominoMatrixSizeNew; column++) {

            // if (isOutsideOfTopGameBoard(row)) continue;
            if (!newTetromono.matrix[row][column]) continue;

            const cellIndex = convertNewPositionToIndex(newTetromono.row + row, newTetromono.column + column);

            cellsNew[cellIndex].classList.add(name);
            // cellsNew[cellIndex].style.backgroundColor = color;
        }
    }
}

function drawTetromino() {
    const name = tetromono.name;
    const tetrominoMatrixSize = tetromono.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {

            if (isOutsideOfTopGameBoard(row)) continue;
            if (!tetromono.matrix[row][column]) continue;

            const cellIndex = convertPositionToIndex(tetromono.row + row, tetromono.column + column);


            // cells[cellIndex].innerHTML = showRotated[row][column]
            // cells[cellIndex].style.backgroundColor = color;

            // if (newTetroGenerate === false) {
            //     cells[cellIndex].classList.add(name);
            // }
            cells[cellIndex].classList.add(name);
            // cells[cellIndex].classList.add(tetrominoElement[0]);
        }
    }
}

function draw() {
    cellsNew.forEach(cell => cell.removeAttribute('class'));
    cells.forEach(cell => cell.removeAttribute('class'));
    // cells.forEach(cell => cell.style.backgroundColor = null);

    drawNewTetromino();
    drawPlayField();
    // drawNewPlayField();
    drawTetromino();
}

let showRotated = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

function rotateTetramino() {
    const oldMatrix = tetromono.matrix;
    // showRotated = rotateMatrix(showRotated)
    tetromono.matrix = rotateMatrix((tetromono.matrix))

    if (!isValid()) {
        tetromono.matrix = oldMatrix;
    }
}

draw();

function rotate() {
    rotateTetramino();
    draw();
}

document.addEventListener('keydown', onKeyDown)
let isPaused = true;

function onKeyDown(e) {
    moveActionsItems(e.key);
}

function dropTetraminoDown() {
    while (isValid()) {
        tetromono.row++;
    }
    tetromono.row--;
}

function moveDown() {
    // newTetroGenerate = false;
    removeFullRows();
    moveTetraminoDown();
    draw();

    if (isGameOver) {
        gameOver();
    }
}

function togglePauseGame() {
    if (isPaused === false) {
        stopLoop();
        playGameButton.className = 'playGame'
    } else {
        startLoop();
        playGameButton.className = 'playGame active'
    }
    isPaused = !isPaused
}

function gameAction() {
    clearInterval(timeInterval)
    playGameButton.addEventListener('click', function (e) {
        if (e.target.parentNode.classList[1] === 'active') {
            startLoop();
            isPaused = false
            e.target.parentNode.classList[1] = 'inactive'
            soundId = setTimeout(() => genericClick("generic_click", 0.32), 100);
        } else {
            stopLoop();
            isPaused = true
            e.target.parentNode.classList[1] = 'active'
            soundId = setTimeout(() => genericClick("generic_click", 0.32), 100);
        }
        // moveArrow(isPaused);
    });
}

function gameOver() {
    stopLoop();
    overlay.style.display = 'flex'
    soundId = setTimeout(() => genericClick("page_complete", 0.32), 100);
}

// gameOver();

function stopLoop() {
    setTimeout(() => {
        clearInterval(tetroTimerId);
        clearInterval(timeInterval);
    }, 1);
}

function startLoop() {
    tetroTimerId = setInterval(() => moveDown(), speed);
    timeInterval = setInterval(() => startTimer(), 10);
}

gameAction();

function rotateMatrix(matrixTetramino) {
    const N = matrixTetramino.length;
    const rotateMatrix = [];
    for (let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetramino[N - j - 1][i]
        }
    }
    return rotateMatrix
}

setInterval(() => showWithDelay(), 1000)

function showWithDelay() {
    localtime.innerText = new Date().toLocaleString();
}

function isValid() {
    const matrixSize = tetromono.matrix.length
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            // if(tetromono.matrix[row][column]) continue;
            if (isOutSideOfGameBoard(row, column)) {
                return false;
            }
            if (hasCollisions(row, column)) {
                return false;
            }
        }
    }
    return true;
}

function isOutSideOfGameBoard(row, column) {
    return tetromono.matrix[row][column] && (tetromono.column + column < 0 || tetromono.column + column >= PLAYFIELD_COLUMNS || tetromono.row + row >= playField.length);
}

function hasCollisions(row, column) {
    return tetromono.matrix[row][column] && playField[tetromono.row + row]?.[tetromono.column + column]
}

let collectedLinesAmount = 0

function removeFullRows() {
    let rowCleared = 0;

    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        if (playField[row].every(cell => cell !== 0)) {
            playField.splice(row, 1);
            playField.unshift(new Array(PLAYFIELD_COLUMNS).fill(0));
            rowCleared++;
            // console.log("rowCleared", rowCleared)
        }
    }
    collectedLinesAmount += rowCleared
    collectedLines.innerHTML = `${collectedLinesAmount}`;
    scoreValue(rowCleared);
}

function isOutsideOfTopGameBoard(row) {
    // console.log(tetromono.row + row < 0)
    return tetromono.row + row < 0;
}

function scoreValue(amount) {
    switch (amount) {
        case 1:
            score += 30;
            break;
        case 2:
            score += 50;
            break;
        case 3:
            score += 80;
            break;
        case 4:
            score += 110;
            break;
    }
    scoreTetris.innerText = score;

    if (bestScore <= score) {
        bestScore = score;
    }

    updateSpeed();
}

// function updateSpeed() {
//     speedIncrease = Math.floor(score / SCORE_DIVISOR) * SPEED_INCREASE_FACTOR;
//     const newSpeed = BASE_SPEED * (1 - speedIncrease);
//
//     if (updatedSpeed > newSpeed) {
//         updatedSpeed = newSpeed
//         speedLvl.innerHTML = `${++speedValue}`
//     }
//     speed = Math.max(MIN_SPEED, newSpeed);
//     clearInterval(timerId);
//     timerId = setInterval(() => moveDown(), speed);
// }

// let test = document.querySelectorAll('.blockResults'); // обращаю внимание на точку

clearResults.addEventListener('click', () => {
    clearAllResults();
    soundId = setTimeout(() => genericClick("generic_click", 0.32), 100);
    counter = 1;
});

function clearAllResults() {
    let clearResultsBlocks = document.querySelectorAll('.blockResults');

    if (clearResultsBlocks.length > 0) {
        soundId = setTimeout(() => genericClick("clearAllResults", 0.32), 300);
    }
    clearResultsBlocks.forEach(function (elem) {
        elem.parentNode.removeChild(elem);
    });
}


function genericClick(sound, volume) {
    switch (sound) {
        case "generic_click":
            playSoundInfo.src = "sound/luckyfin_generic_click.mp3";
            break;
        case "pick_chest_opens":
            playSoundInfo.src = "sound/luckyfin_pick_chest_opens.mp3";
            break;
        case "clearAllResults":
            playSoundInfo.src = "sound/clearAllResults.mp3";
            break;
        case "page_complete":
            playSoundInfo.src = "sound/luckyfin_page_complete.mp3";
            break;
        case 5:
            playSoundInfo.src = "sound/luckyfin_pick_game_music_loop.mp3";
            break;
    }
    playSoundInfo.volume = volume;
    playSoundInfo.play();
}


buttonOne.addEventListener('click', () => {
    modalContainer.removeAttribute('class')
    modalContainer.classList.add('one')
    body.classList.add('modal-active');
    setTimeout(() => genericClick("generic_click", 0.2), 100);
    setTimeout(() => genericClick("pick_chest_opens", 0.2), 500);
    setTimeout(() => genericClick(5, 0.2), 500);
    isPaused = true
    stopLoop();
    playGameButton.className = 'playGame'
    pauseSoundState();
})

modalContainer.addEventListener('click', () => {
    modalContainer.classList.add('out')
    body.classList.remove('modal-active');
    setTimeout(() => genericClick("pick_chest_opens", 0.32), 100);
    pauseSoundState();
})

function pauseSoundState() {
    playButton.src = PLAY_IMAGE;
    localStorage.audioLastTime = playSound.currentTime % playSound.duration;
    playSound.pause();
    outSound.innerText = defOutText;
    playButtonState = true;
}

function playSoundState() {

    random = +(localStorage.getItem("numberTrack"));
    playButton.src = STOP_IMAGE;
    playButtonState = false
    outSound.innerText = soundMap[random];
    playSound.src = `sound/${soundMap[random]}.mp3`;
    playSound.currentTime = "audioLastTime" in localStorage ? localStorage.audioLastTime : 0
    // console.log("random", random)
    playSound.play();

    if (rightSoundMenu.childNodes.length) {
        document.querySelectorAll('.rightSoundMenu .activeSoundTrack').forEach(n => n.classList.remove('activeSoundTrack'));
        rightSoundMenu.children[random].className = "activeSoundTrack";
    }
}

settings.addEventListener('click', () => {
    soundId = setTimeout(() => genericClick("generic_click", 0.1), 100);
    if (settingKey) {
        settingKey = false;
        modal_settings.style.display = 'none'
        modal_settings.style.animation = '5s ease hide'
    } else {
        settingKey = true;
        modal_settings.style.display = 'flex'
        modal_settings.style.animation = '2s ease show'
    }
});

change_backButton.addEventListener('click', () => {
    changeImageBack();
    soundId = setTimeout(() => genericClick("generic_click", 0.1), 100);
});

imageBack = setInterval(() => changeImageBack(), 60000);

function changeImageBack() {
    newImage++;
    if (newImage > 58) newImage = 0;

    const imageUrlJpg = `img_back/background_image_${newImage}.jpg`;
    const imageUrlPng = `img_back/background_image_${newImage}.png`;

    fetch(imageUrlJpg)
        .then(response => {
            setBackgroundImage(response.status === 200 ? imageUrlJpg : imageUrlPng);
        })
        .catch(() => {
            setBackgroundImage(imageUrlPng);
        });
}

function setBackgroundImage(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}

let elm = document.querySelectorAll(".grid");
const classNames = ["O", "I", "S", "Z", "L", "J", "T"];

change_block_color.addEventListener("change", (e) => {
    let color = e.target.value;

    elm.forEach(cell => {
        if (!classNames.includes(cell.className)) {
            cell.style.backgroundColor = color;
            cell.style.opacity = 0.68;
        }
    });
});

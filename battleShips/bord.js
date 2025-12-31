// JavaScript

const playerBoard = document.getElementById("player-board"); // Отримуємо елемент борди гравця
const botBoard = document.getElementById("bot-board"); // Отримуємо елемент борди бота
const toggleBotShipsButton = document.querySelector(".toggle-bot-ships"); // Отримуємо кнопку для перемикання видимості кораблів бота
const startGame = document.querySelector(".start-game"); // start-game
const winAlert = document.querySelector(".winAlert"); // start-game
const nameWin = document.querySelector(".nameWin"); // start-game
const congratulation = document.querySelector(".congratulation"); // start-game
const youWin = document.querySelector(".youWin"); // start-game
const botWin = document.querySelector(".botWin"); // start-game
const restart = document.querySelector(".restart"); // start-game
let backgroundButton = document.querySelector(".background");
let backgroundContainer = document.querySelector("#background-container");
const playSoundButton = document.querySelector('.playSound');
const playerAvatar = document.querySelector('.playerAvatar');
const botAvatar = document.querySelector('.botAvatar');
const avatarImg = document.querySelector('.avatarImg');
const hitShips = document.querySelector('.hitShips');
const playSound = new Audio();
const cannonballSound = new Audio();

let backSound
const playerShipField = document.getElementById("player-ship-field"); // Поле кораблів гравця
const botShipField = document.getElementById("bot-ship-field"); // Поле кораблів бота


const ships = [ // Масив з інформацією про кораблі
    {name: "carrier", size: 5},
    {name: "battleship", size: 4},
    {name: "cruiser_1", size: 3},
    {name: "submarine_2", size: 3},
    {name: "destroyer_1", size: 2},
    {name: "destroyer_2", size: 2},
    {name: "mine_1", size: 1, image: "mine.png"},
    {name: "mine_2", size: 1, image: "mine.png"},
];

let placedShips = []; // Масив для збереження розміщених кораблів гравця
let botPlacedShips = []; // Масив для збереження розміщених кораблів бота
let botShipsVisible = false; // Прапорець для відстеження видимості кораблів бота
let botBoardState = new Array(100).fill(null); // Масив для збереження стану клітинок борди бота
// let backSound = setTimeout(() => playSounds("generic_click", 0.32), 100);


document.addEventListener("DOMContentLoaded", () => { // Виконується після завантаження DOM
    backgroundContainer.style.backgroundImage = `url('img/more_10.png')`;

    createBoard(playerBoard); // Створюємо борду гравця
    createBoard(botBoard); // Створюємо борду бота
    // toggleAvatarDimming(); // Перемикаємо затемнення аватарів

    function createBoard(board) { // Функція для створення борди
        for (let i = 0; i < 100; i++) { // Цикл для створення 100 клітинок
            const cell = document.createElement("div"); // Створюємо елемент клітинки
            cell.classList.add("cell"); // Додаємо клас "cell" до клітинки
            cell.dataset.index = i; // Встановлюємо індекс клітинки
            if (board === botBoard) { // Якщо це борда бота
                cell.addEventListener("click", () => handlePlayerMove(cell)); // Додаємо обробник кліку для ходу гравця
            }
            board.appendChild(cell); // Додаємо клітинку до борди
        }
    }

    startGame.addEventListener("click", () => { // Додаємо обробник кліку для кнопки початку гри
        restartGame(); // Перезапускаємо гру
        // setTimeout(() => playSounds("generic_click", 0.32), 100);
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);

    });

    function restartGame() {
        clearBoard(playerBoard); // Очищаємо борду гравця
        clearBoard(botBoard); // Очищаємо борду бота
        createBoard(playerBoard); // Створюємо борду гравця заново
        createBoard(botBoard); // Створюємо борду бота заново
        placedShips = []; // Очищаємо масив розміщених кораблів гравця
        botPlacedShips = []; // Очищаємо масив розміщених кораблів бота
        sunkShips = [];
        botBoardState = new Array(100).fill(null);
        // Очищаємо всі вражені кораблі і міни в полях гравця і бота, залишаючи картинку міни
        document.querySelectorAll('#player-ship-field .ship-cell.hit').forEach(cell => {
            cell.classList.remove('hit');
            if (cell.dataset.ship !== "mine_1" && cell.dataset.ship !== "mine_2") {
                cell.style.backgroundImage = '';
            } else {
                cell.style.backgroundImage = 'url(img/mine.png)';
                cell.style.backgroundSize = 'cover';
                cell.style.border = '';
                cell.style.borderRadius = '';
            }
        });
        document.querySelectorAll('#bot-ship-field .ship-cell.hit').forEach(cell => {
            cell.classList.remove('hit');
            if (cell.dataset.ship !== "mine_1" && cell.dataset.ship !== "mine_2") {
                cell.style.backgroundImage = '';
            } else {
                cell.style.backgroundImage = 'url(img/mine.png)';
                cell.style.backgroundSize = 'cover';
                cell.style.border = '';
                cell.style.borderRadius = '';
            }
        });

        // Очищаємо поточні позиції кораблів
        playerShipField.innerHTML = '';
        botShipField.innerHTML = '';

        placeShips(playerBoard, placedShips); // Розміщуємо нові кораблі на борді гравця
        placeShips(botBoard, botPlacedShips); // Розміщуємо нові кораблі на борді бота
        toggleBotShips(false); // Приховуємо кораблі бота
        createShipField(playerShipField, placedShips); // Створюємо поле кораблів гравця
        createShipField(botShipField, botPlacedShips); // Створюємо поле кораблів бота
    }

    function clearBoard(board) { // Function to clear the board
        while (board.firstChild) { // While there are child elements
            board.removeChild(board.firstChild); // Remove the first child element
        }
    }

    restart.addEventListener("click", () => { // Додаємо обробник кліку для кнопки початку гри
        winAlert.style.display = "none";
        // setTimeout(() => playSounds("generic_click", 0.32), 100);
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);

        restartGame(); // Перезапускаємо гру

    });

    placeShips(playerBoard, placedShips); // Розміщуємо кораблі на борді гравця
    placeShips(botBoard, botPlacedShips); // Розміщуємо кораблі на борді бота

    function placeShips(board, placedShipsArray) { // Функція для розміщення кораблів
        ships.forEach(ship => { // Проходимо по кожному кораблю
            let placed = false; // Прапорець для відстеження розміщення корабля
            let attempts = 0; // Лічильник спроб
            const maxAttempts = 2000; // Максимальна кількість спроб для розміщення корабля

            while (!placed && attempts < maxAttempts) { // Поки корабель не розміщено і кількість спроб не перевищує ліміт
                const direction = Math.random() < 0.5 ? "horizontal" : "vertical"; // Визначаємо напрямок корабля
                const start = Math.floor(Math.random() * 100); // Визначаємо стартову позицію корабля
                const shipCells = getShipCells(start, ship.size, direction); // Отримуємо клітинки для корабля

                if (shipCells.length > 0 && shipCells.every(index => isValidCell(index, board))) { // Перевіряємо, чи всі клітинки валідні
                    shipCells.forEach(index => { // Проходимо по кожній клітинці корабля
                        const cell = board.children[index]; // Отримуємо клітинку борди
                        cell.classList.add("ship"); // Додаємо клас "ship" до клітинки
                        cell.dataset.ship = ship.name; // Встановлюємо ім'я корабля в атрибут даних
                        if (ship.name === "mine_1" || ship.name === "mine_2") {
                            cell.style.backgroundImage = `url(img/${ship.image})`; // Встановлюємо зображення корабля
                            cell.style.backgroundSize = "cover";
                        }
                        if (board === botBoard) { // Якщо це борда бота
                            botBoardState[index] = "ship"; // Зберігаємо стан клітинки
                        }
                    });
                    placedShipsArray.push({...ship, cells: shipCells}); // Додаємо корабель до масиву розміщених кораблів
                    placed = true; // Встановлюємо прапорець, що корабель розміщено
                }
                attempts++; // Збільшуємо лічильник спроб
            }
            if (!placed) {
                console.error(`Не вдалося розмістити корабель: ${ship.name}`); // Виводимо помилку, якщо корабель не вдалося розмістити
            }
        });
    }

    function getShipCells(start, size, direction) { // Функція для отримання клітинок корабля
        const cells = []; // Масив для збереження клітинок
        for (let i = 0; i < size; i++) { // Цикл для додавання клітинок
            if (direction === "horizontal") { // Якщо напрямок горизонтальний
                const col = (start % 10) + i; // Визначаємо стовпець клітинки
                if (col >= 10) return []; // Якщо стовпець виходить за межі борди, повертаємо порожній масив
                cells.push(start + i); // Додаємо клітинку справа
            } else { // Якщо напрямок вертикальний
                const row = Math.floor(start / 10) + i; // Визначаємо рядок клітинки
                if (row >= 10) return []; // Якщо рядок виходить за межі борди, повертаємо порожній масив
                cells.push(start + i * 10); // Додаємо клітинку знизу
            }
        }
        return cells; // Повертаємо масив клітинок
    }

    function isValidCell(index, board) { // Функція для перевірки валідності клітинки
        if (index < 0 || index >= 100 || board.children[index].classList.contains("ship")) { // Якщо індекс не валідний або клітинка вже зайнята
            return false; // Повертаємо false
        }
        const adjacentIndices = getAdjacentIndices(index); // Отримуємо сусідні клітинки
        return adjacentIndices.every(adjIndex => // Перевіряємо, чи всі сусідні клітинки валідні
            adjIndex < 0 || adjIndex >= 100 || !board.children[adjIndex].classList.contains("ship")
        );
    }

    function getAdjacentIndices(index) { // Функція для отримання сусідніх клітинок
        const row = Math.floor(index / 10); // Визначаємо рядок клітинки
        const col = index % 10; // Визначаємо стовпець клітинки
        const adjacentIndices = [ // Масив сусідніх клітинок
            index - 21, index - 20, index - 19,
            index - 11, index - 10, index - 9,
            index - 1, index + 1,
            index + 9, index + 10, index + 11,
            index + 19, index + 20, index + 21
        ];
        return adjacentIndices.filter(adjIndex => { // Фільтруємо валідні сусідні клітинки
            const adjRow = Math.floor(adjIndex / 10); // Визначаємо рядок сусідньої клітинки
            const adjCol = adjIndex % 10; // Визначаємо стовпець сусідньої клітинки
            return Math.abs(adjRow - row) <= 2 && Math.abs(adjCol - col) <= 2; // Перевіряємо, чи сусідня клітинка знаходиться в межах 2 клітинок
        });
    }

    toggleBotShipsButton.addEventListener("click", () => { // Додаємо обробник кліку для кнопки перемикання видимості кораблів бота
        botShipsVisible = !botShipsVisible; // Змінюємо прапорець видимості кораблів бота
        toggleBotShips(botShipsVisible); // Викликаємо функцію перемикання видимості кораблів бота
        // setTimeout(() => playSounds("generic_click", 0.32), 100);
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);

    });

    toggleBotShips(false);

    function toggleBotShips(visible) { // Функція для перемикання видимості кораблів бота
        botBoardState.forEach((state, index) => { // Проходимо по кожній клітинці борди бота
            const cell = botBoard.children[index]; // Отримуємо клітинку борди бота
            if (visible) { // Якщо кораблі бота мають бути видимі
                if (state === "ship") cell.classList.add("ship"); // Додаємо клас "ship" до клітинки
                if (state === "hit") cell.classList.add("hit"); // Додаємо клас "hit" до клітинки

                if (cell.dataset.ship === "mine_1" || cell.dataset.ship === "mine_2") {
                    cell.style.backgroundImage = `url(img/mine.png)`; // Встановлюємо зображення корабля
                    cell.style.backgroundSize = "cover";
                }
            } else { // Якщо кораблі бота мають бути приховані
                cell.classList.remove("ship"); // Видаляємо клас "ship" з клітинки
                cell.style.backgroundImage = ""; // Видаляємо зображення корабля

                if (state === "hit") {
                    cell.classList.add("hit"); // Додаємо клас "hit" до клітинки
                    if (cell.dataset.ship === "mine_1" || cell.dataset.ship === "mine_2") {
                        cell.style.backgroundImage = `url(img/mine.png)`; // Встановлюємо зображення корабля
                        cell.style.backgroundSize = "cover";
                    }
                } else if (state === "miss") {
                    cell.classList.add("miss"); // Додаємо клас "miss" до клітинки
                }
            }
        });
    }

    backgroundButton.addEventListener("click", () => {
        changeBack();
        // setTimeout(() => playSounds("generic_click", 0.32), 100);
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);

    });

    function changeBack() {
        backgroundContainer.classList.toggle("hidden");
        setTimeout(() => {
            document.body.style.backgroundImage = `url('img/more_${random(1, 10)}.png')`;
            backgroundContainer.classList.toggle("hidden");

        }, 800);
    }

    function createShipField(shipField, ships) { // Функція для створення поля кораблів
        ships.forEach(ship => {
            const shipElement = document.createElement("div");
            shipElement.classList.add("ship");
            ship.cells.forEach(index => {
                const cell = document.createElement("div");
                cell.classList.add("ship-cell");
                cell.dataset.index = index;
                // console.log("cell.dataset.index", cell.dataset.index);
                if (ship.size === 1) { // Якщо розмір корабля один, встановлюємо зображення міни
                    cell.style.backgroundImage = `url(img/mine.png)`; // Встановлюємо зображення корабля
                    cell.style.backgroundSize = "cover";
                }
                shipElement.appendChild(cell);
            });
            shipField.appendChild(shipElement);
        });
    }

    createShipField(playerShipField, placedShips); // Створюємо поле кораблів гравця
    createShipField(botShipField, botPlacedShips); // Створюємо поле кораблів бота

    // // backSound = setInterval(() => playSounds('base_game_music_advanced',0.32), 5000);
    // setTimeout  (() => playSounds("base_game_music_advanced", 0.32), 1000);
    // playSound.play();
    // playBack("base_game_music_advanced", 0.32);
    // vol ? playBack("base_game_music_advanced", 0.32) : playSoundBack.pause();

});


// playBack("base_game_music_advanced", 0.32);



function highlightShipPart(shipField, index, mine, isBot) {
    const cell = shipField.querySelector(`.ship-cell[data-index='${index}']`);
    if (cell) {
        cell.classList.add("hit");
        if (mine === "mine_1" || mine === "mine_2") {
            cell.style.backgroundImage = `url(img/mine.png)`;
            cell.style.backgroundSize = "cover";
            cell.style.border = "2px solid red";
            cell.style.borderRadius = "15px";
            checkSurroundingCells(index, isBot);
        } else {
            cell.style.backgroundColor = "red";
        }
    }
}

function checkSurroundingCells(index, bot) {
    const row = Math.floor(index / 10);
    const col = index % 10;
    const surroundingIndices = [
        index - 20, index - 10, index + 10, index + 20, // Вертикально
        index - 2, index - 1, index + 1, index + 2 // Горизонтально
    ];

    const board = bot ? playerBoard : botBoard;
    const shipField = bot ? playerShipField : botShipField;

    surroundingIndices.forEach(adjIndex => {
        const adjRow = Math.floor(adjIndex / 10);
        
        // Перевіряємо валідність індексу
        if (adjIndex < 0 || adjIndex >= 100) return;
        
        // Перевіряємо що не вийшли за межі рядка (для горизонтальних зсувів)
        if (Math.abs(adjIndex - index) <= 2) { // Горизонтальний зсув
            if (adjRow !== row) return;
        }
        
        const adjCell = board.children[adjIndex];
        if (!adjCell) return;
        
        // Якщо клітинка вже влучена - пропускаємо (miss можна перефарбувати!)
        if (adjCell.classList.contains("hit")) return;
        
        const adjShipCell = shipField.querySelector(`.ship-cell[data-index='${adjIndex}']`);
        
        // Перевіряємо чи є корабель (клас ship АБО data-ship)
        const hasShip = adjCell.classList.contains("ship") || adjCell.dataset.ship;
        
        if (hasShip) {
            // Є корабель - додаємо ТІЛЬКИ hit!
            adjCell.classList.add("hit");
            adjCell.classList.remove("miss"); // Видаляємо miss якщо є
            adjCell.style.backgroundColor = "red";
            
            if (adjShipCell) {
                adjShipCell.classList.add("hit");
                adjShipCell.classList.remove("miss");
            }
            
            if (adjCell.dataset.ship === "mine_1" || adjCell.dataset.ship === "mine_2") {
                adjCell.style.backgroundImage = `url(img/mine.png)`;
                adjCell.style.backgroundSize = "cover";
                adjCell.style.border = "2px solid red";
                adjCell.style.borderRadius = "15px";
                
                if (adjShipCell) {
                    adjShipCell.style.backgroundImage = `url(img/mine.png)`;
                    adjShipCell.style.backgroundSize = "cover";
                    adjShipCell.style.border = "2px solid red";
                    adjShipCell.style.borderRadius = "15px";
                }
                
                // Рекурсивний вибух міни
                checkSurroundingCells(adjIndex, bot);
            } else if (adjShipCell) {
                adjShipCell.style.backgroundColor = "red";
            }
            
            console.log(`💥 Вибух влучив у корабель на позиції ${adjIndex}!`);
        } else {
            // Порожня клітинка - жовта трасіровка (клас explosion замість miss!)
            adjCell.classList.remove("miss"); // Видаляємо miss!
            adjCell.classList.add("explosion");
            adjCell.style.backgroundColor = "yellow";
        }
    });
}

/**
 * Перевірка вибуху міни - перевіряє клітинки на відстані +1 та +2 в усіх напрямках
 * Якщо знаходить корабель - додає класи "cell ship hit"
 * @param {number} index - індекс міни
 * @param {HTMLElement} board - борда (playerBoard або botBoard)
 * @param {HTMLElement} shipField - поле кораблів
 * @param {boolean} isPlayerBoard - чи це борда гравця (true = бот стріляє по гравцю)
 */
function checkMineExplosion(index, board, shipField, isPlayerBoard) {
    const row = Math.floor(index / 10);
    const col = index % 10;
    
    // Клітинки на відстані +1 та +2 в усіх напрямках (горизонтально та вертикально)
    const explosionOffsets = [
        -2, -1, 1, 2,      // Горизонтально: -2, -1, +1, +2
        -20, -10, 10, 20   // Вертикально: -2 ряди, -1 ряд, +1 ряд, +2 ряди
    ];
    
    explosionOffsets.forEach(offset => {
        const targetIndex = index + offset;
        const targetRow = Math.floor(targetIndex / 10);
        
        // Перевіряємо валідність індексу
        if (targetIndex < 0 || targetIndex >= 100) return;
        
        // Перевіряємо що не вийшли за межі рядка (для горизонтальних зсувів)
        if (Math.abs(offset) <= 2) { // Горизонтальний зсув
            if (targetRow !== row) return; // Вийшли за межі рядка
        }
        
        const targetCell = board.children[targetIndex];
        if (!targetCell) return;
        
        // Якщо клітинка вже влучена - пропускаємо (miss можна перефарбувати!)
        if (targetCell.classList.contains("hit")) return;
        
        // Перевіряємо чи є корабель (клас ship АБО data-ship атрибут)
        const hasShip = targetCell.classList.contains("ship") || targetCell.dataset.ship;
        
        if (hasShip) {
            // Є корабель! Додаємо ТІЛЬКИ клас hit (не miss!)
            targetCell.classList.add("hit");
            // Видаляємо miss якщо випадково додався
            targetCell.classList.remove("miss");
            targetCell.style.backgroundColor = "red";
            
            // Оновлюємо поле кораблів збоку
            const shipCellInField = shipField.querySelector(`.ship-cell[data-index='${targetIndex}']`);
            if (shipCellInField) {
                shipCellInField.classList.add("hit");
                shipCellInField.classList.remove("miss");
                
                // Якщо це міна - особливе оформлення
                if (targetCell.dataset.ship === "mine_1" || targetCell.dataset.ship === "mine_2") {
                    targetCell.style.backgroundImage = `url(img/mine.png)`;
                    targetCell.style.backgroundSize = "cover";
                    targetCell.style.border = "2px solid red";
                    targetCell.style.borderRadius = "15px";
                    
                    shipCellInField.style.backgroundImage = `url(img/mine.png)`;
                    shipCellInField.style.backgroundSize = "cover";
                    shipCellInField.style.border = "2px solid red";
                    shipCellInField.style.borderRadius = "15px";
                    
                    // Рекурсивний вибух міни!
                    checkMineExplosion(targetIndex, board, shipField, isPlayerBoard);
                } else {
                    shipCellInField.style.backgroundColor = "red";
                }
            }
            
            // Перевіряємо умови перемоги
            if (isPlayerBoard) {
                checkWinCondition(playerBoard, placedShips);
            } else {
                checkWinCondition(botBoard, botPlacedShips);
            }
            
            console.log(`💥 Вибух міни влучив у корабель на позиції ${targetIndex}!`);
        } else {
            // Порожня клітинка - жовта трасіровка (клас explosion замість miss!)
            targetCell.classList.remove("miss"); // Видаляємо miss!
            targetCell.classList.add("explosion");
            targetCell.style.backgroundColor = "yellow";
        }
    });
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playSounds(sound, volume) {
    switch (sound) {
        case "background_sound":
            playSound.src = "sound/pirati_karibskogo_morja.mp3";
            break;
        // case "generic_click":
        //     playSound.src = "sound/luckyfin_generic_click.mp3";
        //     break;
        // case "cannonball_falling":
        //     playSound.src = "sound/cannonball_falling.mp3";
        //     break;
        // case "cannonball_lands":
        //     playSound.src = "sound/cannonball_lands.mp3";
        //     break;
        // case "base_game_music_advanced":
        //     playSound.src = "sound/base_game_music_advanced.mp3";
        //     break;
        // default:
        //     playSound.src = "sound/base_game_music_advanced.mp3";
    }
    playSound.volume = volume;
    playSound.play();
}

function playCannonballSounds(sound, volume) {
    cannonballSound.src = `sound/${sound}.mp3`;
    cannonballSound.volume = volume;
    cannonballSound.play();
}

// function playSounds(sound, volume) {
//     if (!playSound.paused) {
//         playSound.pause();
//         playSound.currentTime = 0;
//     }
//     switch (sound) {
//         case "background_sound":
//             playSound.src = "sound/pirati_karibskogo_morja.mp3";
//             break;
//         case "generic_click":
//             playSound.src = "sound/luckyfin_generic_click.mp3";
//             break;
//         case "cannonball_falling":
//             playSound.src = "sound/cannonball_falling.mp3";
//             break;
//         case "cannonball_lands":
//             playSound.src = "sound/cannonball_lands.mp3";
//             break;
//         // default:
//         //     playSound.src = "sound/base_game_music_advanced.mp3";
//     }
//     playSound.volume = volume;
//     playSound.play();
// }
function avatars() {
    playerAvatar.style.backgroundImage = `url('img/pirate_${random(1, 12)}.png')`;
    botAvatar.style.backgroundImage = `url('img/pirate_${random(1, 12)}.png')`;
}

avatars();

function avatarImages() {
    for (let i = 1; i <= 12; i++) {
        const avatar = document.createElement("div");
        avatar.classList.add(`pirate_${i}`);
        avatar.style.backgroundImage = `url('img/pirate_${i}.png')`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.style.backgroundRepeat = "no-repeat";
        avatarImg.appendChild(avatar);
    }
}   // avatarMenu();

avatarImages();

let selectedAvatar = null;

avatarImg.addEventListener("click", (e) => {
    if (e.target === avatarImg) return; // If the click is on the avatar menu, return
    if (selectedAvatar) {
        selectedAvatar.style.border = ""; // Remove border from previously selected avatar
    }
    // setTimeout(() => playSounds("generic_click", 0.2), 100);
    setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);


    selectedAvatar = e.target; // Update the selected avatar
    selectedAvatar.style.border = "2px solid red"; // Add border to the newly selected avatar
    playerAvatar.style.backgroundImage = `url('img/${selectedAvatar.className}.png')`;
});

let isPlayerTurn = true;

function toggleAvatarDimming() {
    if (isPlayerTurn) {
        playerAvatar.classList.remove('dimmed');
        botAvatar.classList.add('dimmed');
    } else {
        playerAvatar.classList.add('dimmed');
        botAvatar.classList.remove('dimmed');
    }
}

// function adjustMargin() {
//     // const object = document.querySelector('.object');
//     const screenHeight = window.innerHeight;
//     console.log("screenHeight", screenHeight)
//     const objectHeight = hitShips.offsetHeight;
//     console.log("objectHeight", objectHeight)
//
//
//     if (objectHeight + 20 > screenHeight) {
//
//         hitShips.style.marginTop = '20px';
//     } else {
//         hitShips.style.marginTop = '0';
//     }
// }
//
// window.addEventListener('resize', adjustMargin);
// window.addEventListener('load', adjustMargin);



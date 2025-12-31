function handlePlayerMove(cell) { // Функція для обробки ходу гравця

    const index = parseInt(cell.dataset.index); // Отримуємо індекс клітинки
    if (botBoardState[index] === "hit" || botBoardState[index] === "miss") return; // Якщо клітинка вже влучена або промахнута, виходимо
    console.log("cell.dataset.index", cell.dataset.index)
    let hit = false; // Прапорець для відстеження влучання
    if (botBoardState[index] === "ship") { // Якщо клітинка містить корабель
        cell.classList.add("hit"); // Додаємо клас "hit" до клітинки
        if (cell.dataset.ship === "mine_1" || cell.dataset.ship === "mine_2") { // Якщо влучили в міну
            setTimeout(() => playCannonballSounds("cannonball_falling", 0.32), 100);
            setTimeout(() => playCannonballSounds("cannonball_lands", 0.32), 1000);
            cell.style.backgroundImage = `url(img/mine.png)`; // Встановлюємо зображення міни
            cell.style.backgroundSize = "cover"; // Встановлюємо розмір зображення
            cell.style.border = "2px solid red"; // Встановлюємо рамку
            cell.style.borderRadius = "15px";
            console.log("data-ships", cell.dataset.ship);
            
            // Перевіряємо клітинки на відстані +2 в усі сторони
            checkMineExplosion(index, botBoard, botShipField, false);
        }
        botBoardState[index] = "hit"; // Зберігаємо стан клітинки

        const ship = botPlacedShips.find(ship => ship.cells.includes(index));
        if (ship) {
            highlightShipPart(botShipField, index, cell.dataset.ship, false);
        }

        checkWinCondition(botBoard, botPlacedShips); // Перевіряємо умови перемоги
        hit = true; // Встановлюємо прапорець, що влучили
    } else { // Якщо клітинка не містить корабель
        cell.classList.add("miss"); // Додаємо клас "miss" до клітинки
        botBoardState[index] = "miss"; // Зберігаємо стан клітинки
    }

    if (!hit) { // Якщо не влучили, виконуємо хід бота
        isPlayerTurn = !isPlayerTurn;
        toggleAvatarDimming();
        setTimeout(() => botMove(), 1000)
    }
}
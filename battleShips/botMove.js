let lastHitIndex = null; // Відстежуємо останню влучену позицію
let potentialTargets = []; // Відстежуємо потенційні цілі навколо останньої влученої позиції

//
function botMove() { // Функція для ходу бота
    let moveMade = false; // Прапорець для відстеження виконання ходу

    while (!moveMade) { // Поки хід не виконано
        let index;

        if (potentialTargets.length > 0) { // Якщо є потенційні цілі
            index = potentialTargets.pop(); // Отримуємо наступну потенційну ціль
        } else {
            index = Math.floor(Math.random() * 100); // Випадковий хід, якщо немає потенційних цілей
        }
        const cell = playerBoard.children[index]; // Отримуємо клітинку борди гравця

        if (!cell.classList.contains("hit") && !cell.classList.contains("miss")) { // Якщо клітинка не влучена і не промахнута
            let hit = false; // Прапорець для відстеження влучання

            if (cell.classList.contains("ship")) { // Якщо клітинка містить корабель
                cell.classList.add("hit"); // Додаємо клас "hit" до клітинки
                // cell.style.backgroundColor = "red"; // Позначаємо влучання червоним кольором

                lastHitIndex = index; // Зберігаємо індекс останньої влученої позиції
                if (cell.dataset.ship === "mine_1" || cell.dataset.ship === "mine_2") { // Якщо влучили в міну
                    setTimeout(() => playCannonballSounds("cannonball_falling", 0.32), 100);
                    setTimeout(() => playCannonballSounds("cannonball_lands", 0.32), 1000);
                    cell.style.backgroundImage = `url(img/mine.png)`; // Встановлюємо зображення міни
                    cell.style.backgroundSize = "cover"; // Встановлюємо розмір зображення
                    cell.style.border = "2px solid red"; // Встановлюємо рамку
                    cell.style.borderRadius = "15px";
                    
                    // Перевіряємо клітинки на відстані +2 в усі сторони
                    checkMineExplosion(index, playerBoard, playerShipField, true);
                }
                addPotentialTargets(index); // Додаємо сусідні клітинки до потенційних цілей

                const shipUser = placedShips.find(ship => ship.cells.includes(index));
                console.log("shipUser", shipUser);
                if (shipUser) {
                    highlightShipPart(playerShipField, index, cell.dataset.ship, true);
                }

                checkWinCondition(playerBoard, placedShips); // Перевіряємо умови перемоги
                hit = true; // Встановлюємо прапорець, що влучили
            } else { // Якщо клітинка не містить корабель
                cell.classList.add("miss"); // Додаємо клас "miss" до клітинки
                lastHitIndex = null; // Скидаємо індекс останньої влученої позиції
                potentialTargets = []; // Очищаємо потенційні цілі при промаху

            }
            moveMade = !hit; // Якщо влучили, виконуємо ще один хід бота
        }
    }
    isPlayerTurn = !isPlayerTurn;
    toggleAvatarDimming();

}

//
function addPotentialTargets(index) { // Функція для додавання потенційних цілей
    const row = Math.floor(index / 10); // Визначаємо рядок клітинки
    const col = index % 10; // Визначаємо стовпець клітинки

    const adjacentIndices = [ // Масив індексів сусідніх клітинок
        index - 10, // Зверху
        index + 10, // Знизу
        index - 1,  // Зліва
        index + 1   // Справа
    ];

    adjacentIndices.forEach(adjIndex => { // Проходимо по кожному індексу сусідньої клітинки
        const adjRow = Math.floor(adjIndex / 10); // Визначаємо рядок сусідньої клітинки
        const adjCol = adjIndex % 10; // Визначаємо стовпець сусідньої клітинки

        if (adjIndex >= 0 && adjIndex < 100 && Math.abs(adjRow - row) <= 1 && Math.abs(adjCol - col) <= 1) { // Перевіряємо, чи індекс валідний
            if (!playerBoard.children[adjIndex].classList.contains("hit") && !playerBoard.children[adjIndex].classList.contains("miss")) { // Якщо клітинка не влучена і не промахнута
                potentialTargets.push(adjIndex); // Додаємо індекс до потенційних цілей
            }
        }
    });
}
//


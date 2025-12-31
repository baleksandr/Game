let sunkShips = [];

const voSound = new Audio();
function checkWinCondition(board, placedShipsArray) { // Функція для перевірки умов перемоги
    const allShipsSunk = placedShipsArray.every(ship => // Перевіряємо, чи всі кораблі потоплені
        ship.cells.every(index => board.children[index].classList.contains("hit"))
    );
    if (allShipsSunk) { // Якщо всі кораблі потоплені

        winPopup(board === playerBoard);

        // alert(board === playerBoard ? "Bot wins!" : "You win!"); // Виводимо повідомлення про перемогу
    } else { // Якщо не всі кораблі потоплені
        for (const element of board.children) { // Проходимо по кожній клітинці борди
            const cell = element; // Отримуємо клітинку борди
            if (cell.classList.contains("hit")) { // Якщо клітинка влучена
                cell.classList.add("hit"); // Додаємо клас "hit" до клітинки
            } else if (cell.classList.contains("miss")) { // Якщо клітинка промахнута
                cell.classList.add("miss"); // Додаємо клас "miss" до клітинки
            } else if (cell.classList.contains("ship")) { // Якщо клітинка містить корабель
                cell.classList.add("ship"); // Додаємо клас "ship" до клітинки
            }
        }
    }
    placedShipsArray.forEach(ship => { // Проходимо по кожному кораблю
        const isSunk = ship.cells.every(index => board.children[index].classList.contains("hit")); // Перевіряємо, чи корабель потоплений
        if (isSunk && !sunkShips.includes(ship.name)) {
            sunkShips.push(ship.name);
            console.log(`The ${ship.name} has been sunk!`); // Виводимо повідомлення про потоплення корабля
            setTimeout(() => playVoSounds(`vo_${random(1, 4)}`, 0.5), 1600);
        }
    });
}
// botAvatar.style.backgroundImage = `url('img/pirate_${random(1, 12)}.png')`;
// function random(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

function winPopup(state) {
    winAlert.style.display = "flex";
    congratulation.InnerHTML = "Congratulation";
    if (state) {
        botWin.innerHTML = "Bot wins!";
        youWin.style.display = "none";
    } else {
        youWin.innerHTML = `You win!`;
    }
}

function playVoSounds(sound, volume) {
    switch (sound) {
        case "vo_1":
            voSound.src = "sound/vo_1.mp3";
            break;
        case "vo_2":
            voSound.src = "sound/vo_2.mp3";
            break;
        case "vo_3":
            voSound.src = "sound/vo_3.mp3";
            break;
        case "vo_4":
            voSound.src = "sound/vo_4.mp3";
            break;
    }
    voSound.volume = volume;
    voSound.play();
    console.log("voSound", voSound);
}
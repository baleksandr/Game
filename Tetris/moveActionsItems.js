function moveActionsItems(e) {
    if (e === 'Escape') {
        togglePauseGame();
    }

    if (!isPaused) {
        switch (e) {
            case ' ':
            case 'drop':
                dropTetraminoDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
            case 'ArrowDown':
                moveTetraminoDown();
                break;
            case 'ArrowLeft':
                moveTetraminoLeft();
                break;
            case 'ArrowRight':
                moveTetraminoRight();
                break;
        }
        draw();
    }
}

function moveTetraminoDown() {
    tetromono.row += 1;
    if (!isValid()) {
        tetromono.row -= 1;
        placeTetromino(tetrominoElement[1]);
        generateTetromino(tetrominoElement)
    }
    if (tetromono.row === -2) generateNeWTetromino();
}


function moveTetraminoLeft() {
    tetromono.column -= 1;
    if (!isValid()) {
        tetromono.column += 1;
    }
}

function moveTetraminoRight() {
    tetromono.column += 1;
    if (!isValid()) {
        tetromono.column -= 1;
    }
}
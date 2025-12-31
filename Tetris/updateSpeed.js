function calculateSpeed(score) {
    const speedIncrease = Math.floor(score / SCORE_DIVISOR) * SPEED_INCREASE_FACTOR;
    return BASE_SPEED * (1 - speedIncrease);
}

function resetTimer(speed) {
    clearInterval(tetroTimerId);
    tetroTimerId = setInterval(() => moveDown(), speed);
}

function updateSpeed() {
    const calculatedSpeed = calculateSpeed(score);
    if (updatedSpeed > calculatedSpeed) {
        updatedSpeed = calculatedSpeed;
        speedLvl.innerHTML = `${++speedValue}`;
    }
    speed = Math.max(MIN_SPEED, calculatedSpeed);
    resetTimer(speed);
}
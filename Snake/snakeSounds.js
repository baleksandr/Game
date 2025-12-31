const volumeMute = document.querySelector('#hidcheck');
const playSoundBack = new Audio();
let vol = true;
let volumeDown = document.querySelector('#volumeDown');
const volumeSlider = document.getElementById('volumeSlider');
const UNMUTE_IMAGE = "img/volume_ON.png";
const MUTE_IMAGE = "img/volume_OFF.png";
// playSoundButton.addEventListener('click', function () {
//     if (playSoundButton.innerHTML === "Play Sound") {
//         playSoundButton.innerHTML = "Stop Sound";
//         setTimeout(() => playSounds("background_sound", 0.5), 100);
//         playSoundBack.pause();
//         volumeMute.content = "on";
//
//     } else {
//         playSoundButton.innerHTML = "Play Sound";
//         playSound.pause();
//         playSoundBack.pause();
//         volumeMute.content = "off";
//
//     }
// });

volumeMute.addEventListener('click', function () {
    if (vol) {
        // playSound.pause();
        // playSoundButton.innerHTML = "Play Sound";
        playBack("african-background", 0.20);
        vol = false;
        volumeDown.src = UNMUTE_IMAGE;
    } else {
        // playSound.pause();
        playSoundBack.pause();
        // playSoundButton.innerHTML = "Stop Sound";
        vol = true;
        volumeDown.src = MUTE_IMAGE;
    }
});

playSoundBack.addEventListener("ended", () => {
    playBack("african-background", 0.20);
});


function playBack(soundName, volume) {
    playSoundBack.src = `sound/${soundName}.mp3`;
    playSoundBack.volume = volume;
    playSoundBack.play();
}

volumeSlider.addEventListener('input', function () {
    playSoundBack.volume = volumeSlider.value;
    // playSound.volume = volumeSlider.value;
});

// Example function to play sound
// function playSound() {
//     playSoundBack.src = 'sound/background_sound.mp3';
//     playSoundBack.play();
// }
//
// // Call playSound to test the volume control
// playSound();
// const playSound = new Audio();
const playSound = document.createElement('audio');
const playButton = document.querySelector('#play')
const mixingButton = document.querySelector('#mixing')
const STOP_IMAGE = "img/icons8-stop_2.png";
const PLAY_IMAGE = "img/icons8-play_2.png";
const UNMUTE_IMAGE = "img/mute_2.png";
const MUTE_IMAGE = "img/mute.png";
const MIX_IMAGE = "img/mixing.png";
const ROUND_IMAGE = "img/around.png";
let nextButton = document.querySelector('#next');
let previousButton = document.querySelector('#previous');
let volumeDown = document.querySelector('#volumeDown');
let volumeMute = document.querySelector('#volumeMute');
let volumeUp = document.querySelector('#volumeUp');
let outSound = document.querySelector('span');
const defOutText = outSound.innerText;
let soundVolume = document.querySelector(".sound");
const btnWrap = document.querySelector('.btn-wrap');
const rightSoundMenu = document.querySelector('.rightSoundMenu');
let allSoundTrack = document.querySelectorAll('p');
let clickedTrack = document.querySelector('.clickedTrack');
let result = document.querySelector('#result');
let inputTrack = document.querySelector('input');
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let seek_slider = document.querySelector(".seek_slider");
// track.min = 0;
let updateTimer;
let timerId;


let random,
    soundLength,
    roundState = true,
    playButtonState = true,
    soundMap = {
        0: '1. Mauve - Travel',
        1: '2. Jane Good The One Ft Samuel Miller',
        2: '3. Aallar feat. Tropical Tide & Lauralee - I See Fire',
        3: '4. Dt James Midnight Train To Nowhere',
        4: '5. Loafers feat. One Trick Pony - Where Are You Now',
        5: '6. Felix Jaehn Ray Dalton - Call it love',
        6: '7. YVE 48 - Summertime Sadness',
        7: '8. Lady GaGa and Bradley Cooper - always remember us this way',
        8: '9. Micky - this is the life',
        9: '10. Linkin park - in the end',
        10: '11. Linkin park - numb',
        11: '12. Hurts – Beautiful Ones',
        12: '13. R.I.O. – Headlong',
        13: '14. Тайни Темпа Ft. Eric Turner - Written in the Stars',
        14: '15. Antitla - lyudi yak korabl',
        15: '16. kalush - tipok-tipok',
        16: '17. KALUSH - Зорi',
        17: '18. Calum Scott - Where Are You Now',
        18: '19. Janieck Devy - Reality',
        19: '20. Mount Noize Generation - Around The World',
        20: '21. Shouse - Love Tonight (David Guetta Remix)',
        21: '22. The Script feat Will.I.Am — Hall Of Fame',
        22: '23. Unklfnkl - Oh My Darling',
        23: '24. puulse_maybealice - fever',
        24: '25. Fransii_RAZZ_Luna_Belle_-_Together_feat._Eirik_Naess',
        25: '26. The kelly family-fell in love with an alien'
    };

let time

function randomSound() {
    soundLength = Object.keys(soundMap).length;
    random = Math.floor(Math.random() * soundLength);
    localStorage.audioLastTime = 0
    localStorage.setItem("numberTrack", `${random}`);
    outSound.innerText = soundMap[random];
    playSound.src = `sound/${soundMap[random]}.mp3`;
    playSoundState();
}

resetValues();

function resetValues() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

// randomSound();
outSound.innerText = defOutText;
soundLength = Object.keys(soundMap).length;

function sound() {
    clearInterval(updateTimer);
    // clearInterval(timerId);
    let trackId;
    let value = 0.08;
    let volume;
    // let playButtonState = true;
    // playSound.volume = 0.02;

    volume = "tetrisSound" in localStorage ? localStorage.tetrisSound : 0.56
    localStorage.setItem("tetrisSound", `${volume}`);
    playSound.volume = volume
    soundVolume.innerHTML = `${playSound.volume.toFixed(2)}%`;


    playSound.onloadedmetadata = function () {
        // clearTimeout(timerId);
        // timerId = setInterval(roundState ? nextSound : randomSound, playSound.duration * 1000);

        // console.log(+(playSound.duration * 1000).toFixed(0))
    }

    playSound.ontimeupdate = function (e) {
        if (playSound.currentTime === playSound.duration) {
            // clearTimeout(timerId);
            clearTimeout(updateTimer);
            updateTimer = setInterval(seekUpdateSound, 1000);
            // timerId = setInterval(roundState ? nextSound : randomSound, playSound.duration * 1000);

            roundState ? nextSound() : randomSound();
        }
    }


    playButton.addEventListener('click', function (e) {
            // clearTimeout(timerId);
            updateTimer = setInterval(seekUpdateSound, 1000);
            playButtonState ? playSoundState() : pauseSoundState();

        }
    );


    function handleButtonClick(increment) {
        clearTimeout(updateTimer);
        updateTimer = setInterval(seekUpdateSound, 1000);
        if (roundState) {
            random = increment ? random + 1 : random - 1;
            if (soundMap[random] === undefined) {
                random = increment ? 0 : soundLength - 1;
            }
            localStorage.setItem("numberTrack", `${random}`);
            localStorage.audioLastTime = 0;
        } else {
            randomSound();
        }

        playSoundState()
    }

    nextButton.addEventListener('click', function () {
        handleButtonClick(true);
    });

    previousButton.addEventListener('click', function () {
        handleButtonClick(false);
    });

    function nextSound() {
        random += 1
        if (soundMap[random] === undefined) {
            random = 0;
        }
        localStorage.setItem("numberTrack", `${random}`);
        localStorage.audioLastTime = 0;  // reset time
        playButtonState ? playSound.pause() : playSoundState();
    }

    // function playTrack() {
    //     // console.log("random", random);
    //     outSound.innerText = soundMap[random];
    //     playSound.src = `sound/${soundMap[random]}.mp3`;
    //     playButtonState = false
    //     playSound.play();
    //
    //     localStorage.setItem("numberTrack", `${random}`);
    //
    //     clearTimeout(timerId);
    //     playButton.src = STOP_IMAGE;
    //
    //     if (rightSoundMenu.childNodes.length) {
    //         document.querySelectorAll('.rightSoundMenu .activeSoundTrack').forEach(n => n.classList.remove('activeSoundTrack'));
    //         rightSoundMenu.children[random].className = "activeSoundTrack";
    //     }
    // }

    volumeUp.addEventListener('click', function () {
        volume = localStorage.getItem("tetrisSound");
        playSound.volume = volume
        playSound.volume = Math.min(1, playSound.volume + value);
        soundVolume.innerHTML = `${playSound.volume.toFixed(2)}%`
        localStorage.setItem("tetrisSound", `${playSound.volume}`);
        soundVolume.classList.value = "activeValue"
        volumeMute.src = UNMUTE_IMAGE;
    });

    volumeMute.addEventListener('click', function () {
        if (playSound.volume !== 0 && soundVolume.className === "activeValue") {
            localStorage.setItem("tetrisSound", `${playSound.volume}`);
            playSound.volume = 0;
            soundVolume.innerHTML = `${playSound.volume.toFixed(2)}%`
            soundVolume.className = "inActiveValue"
            volumeMute.src = MUTE_IMAGE;
        } else {
            volume = localStorage.getItem("tetrisSound");
            playSound.volume = volume
            soundVolume.innerHTML = `${playSound.volume.toFixed(2)}%`
            soundVolume.className = "activeValue"
            volumeMute.src = UNMUTE_IMAGE;
        }
    });

    volumeDown.addEventListener('click', function () {
        volume = localStorage.getItem("tetrisSound");
        playSound.volume = volume
        playSound.volume = Math.max(0, playSound.volume - value);
        soundVolume.innerHTML = `${playSound.volume.toFixed(2)}%`
        localStorage.setItem("tetrisSound", `${playSound.volume}`);

        if (playSound.volume <= 0) {
            volumeMute.src = MUTE_IMAGE;
            soundVolume.classList.value = "inActiveValue"
        } else {
            soundVolume.classList.value = "activeValue"
            volumeMute.src = UNMUTE_IMAGE;
        }
    });

    mixingButton.addEventListener('click', function () {
        if (roundState) {
            mixingButton.src = MIX_IMAGE;
            roundState = false;
        } else {
            mixingButton.src = ROUND_IMAGE;
            roundState = true;
        }
    });

    btnWrap.addEventListener('click', function (e) {
        if (e.target.className === "active fas fa-chevron-right") {
            setTimeout(() => genericClick("generic_click", 0.2), 100);
            e.target.className = "active fas fa-chevron-left"
            createAndAppendRightMenu();
            rightSoundMenu.style = "display: flex";
            if (rightSoundMenu.children.length === 0) {
                rightSoundMenu.style = "display: none";
            }
            if (rightSoundMenu.childNodes.length) {
                document.querySelectorAll('.rightSoundMenu .activeSoundTrack').forEach(n => n.classList.remove('activeSoundTrack'));
                random = +(localStorage.getItem("numberTrack"));
                console.log("random", random)
                rightSoundMenu.children[random].className = "activeSoundTrack";
                console.log("rightSoundMenu.children[random]", rightSoundMenu.children[random])
                // if (rightSoundMenu.children[random].className === undefined ) {
                //     rightSoundMenu.children[0].className = "activeSoundTrack";
                // } else {
                //     rightSoundMenu.children[random].className = "activeSoundTrack";
                // }
            }
        } else if (e.target.className === "active fas fa-chevron-left") {
            setTimeout(() => genericClick("generic_click", 0.32), 100);
            e.target.className = "active fas fa-chevron-right"
            rightSoundMenu.style = "display: none";

            let element = rightSoundMenu;
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    });

    function createAndAppendRightMenu() {
        let menu = document.createElement("menu");
        // console.log("soundLength", soundLength)
        for (let i = 0; i < soundLength; i++) {
            let p = document.createElement("p");
            p.innerText = soundMap[i];
            rightSoundMenu.append(p);
        }
    }

    rightSoundMenu.addEventListener('dblclick', function (e) {
        if (e.target.tagName === "DIV") return;
        setTimeout(() => genericClick(1, 0.20), 100);
        document.querySelectorAll('.rightSoundMenu .activeSoundTrack').forEach(n => n.classList.remove('activeSoundTrack'));

        e.target.className = "activeSoundTrack";
        let target = e.target.innerText;
        random = Object.values(soundMap).indexOf(target);
        playButtonState = false
        localStorage.setItem("numberTrack", `${random}`);
        // clearTimeout(timerId);
        localStorage.audioLastTime = 0;
        clearTimeout(updateTimer);
        updateTimer = setInterval(seekUpdateSound, 1000);
        playSoundState()
    });

    rightSoundMenu.addEventListener('click', function (e) {
        if (e.target.tagName === "DIV") return;
        if (e.target.className === "activeSoundTrack") return;
        if (e.target.className === "clickedTrack") {
            e.target.className = "";
        } else {
            document.querySelectorAll('.rightSoundMenu .clickedTrack').forEach(n => n.classList.remove('clickedTrack'));
            e.target.className = "clickedTrack";
        }
    });
}

function seekTimeTo() {
// Calculate the seek position by the
// percentage of the seek slider
// and get the relative duration to the track
    seekto = playSound.duration * (seek_slider.value / 100);

// Set the current track position to the calculated seek position
    playSound.currentTime = seekto;
}

function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return minutes + ":" + seconds;
}

function seekUpdateSound() {
    let seekPosition = 0;

    if (!isNaN(playSound.duration)) {
        seekPosition = playSound.currentTime * (100 / playSound.duration);
        seek_slider.value = seekPosition;

        // Calculate the time left and the total duration
        let currentMinutes = Math.floor(playSound.currentTime / 60);
        let currentSeconds = Math.floor(playSound.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(playSound.duration / 60);
        let durationSeconds = Math.floor(playSound.duration - durationMinutes * 60);

        // Display the updated duration
        curr_time.textContent = formatTime(currentMinutes * 60 + currentSeconds);
        total_duration.textContent = formatTime(durationMinutes * 60 + durationSeconds);
    }
}

sound();

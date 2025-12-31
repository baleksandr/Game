const btnWrap = document.querySelector('.btn-wrap');
// const btnWrap = document.querySelector('.btn');
const topPanel = document.querySelector('.topPanel');
const avatarMenu = document.querySelector('.avatarMenu');
// const avatarImg = document.querySelector('.avatarImg');
// const settingsMenu = document.querySelector('.settingsMenu');
const menuButtonSound = new Audio();

btnWrap.addEventListener('click', function (e) {
    if (e.target.className === "active fas fa-chevron-up") {
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
        e.target.className = "active fas fa-chevron-down";
        topPanel.style.display = "block";

    } else if (e.target.className === "active fas fa-chevron-down") {
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
        e.target.className = "active fas fa-chevron-up";
        topPanel.style.display = "none";
    }
});

avatarMenu.addEventListener('click', function (e) {
    if (e.target.className === "active fas fa-chevron-right") {
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
        e.target.className = "active fas fa-chevron-left";
        avatarImg.style.display = "flex";

    } else if (e.target.className === "active fas fa-chevron-left") {
        // setTimeout(() => playSounds("generic_click", 0.32), 100);
        setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);

        e.target.className = "active fas fa-chevron-right";
        avatarImg.style.display = "none";
    }
});

function clickSound(soundName, volume) {
    menuButtonSound.src = `sound/${soundName}.mp3`;
    menuButtonSound.volume = volume;
    menuButtonSound.play();
}
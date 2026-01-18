const topPanel = document.querySelector('.topPanel');
const avatarMenu = document.querySelector('.avatarMenu');
// avatarImg вже оголошена в bord.js
const menuButtonSound = new Audio();

// Перевірка чи мобільна горизонтальна орієнтація
function isMobileLandscape() {
    return window.matchMedia('(max-width: 926px) and (max-height: 500px) and (orientation: landscape)').matches;
}

// Обробник для Settings кнопки
const settingsBtn = document.querySelector('.settingsMenu');
if (settingsBtn) {
    settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const icon = this.querySelector('i');
        
        // Закрити avatarImg якщо відкрита
        if (avatarImg.classList.contains('show')) {
            avatarImg.classList.remove('show');
            avatarImg.style.display = "none";
            const avatarIcon = avatarMenu.querySelector('i');
            if (avatarIcon) {
                avatarIcon.classList.remove('fa-chevron-left');
                avatarIcon.classList.add('fa-chevron-right');
            }
        }
        
        if (icon.classList.contains('fa-chevron-up')) {
            setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            
            topPanel.classList.add('show');
            topPanel.style.display = "flex";

        } else if (icon.classList.contains('fa-chevron-down')) {
            setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            
            topPanel.classList.remove('show');
            topPanel.style.display = "none";
        }
    });
}

// Обробник для Avatars кнопки
if (avatarMenu) {
    avatarMenu.addEventListener('click', function (e) {
        e.stopPropagation();
        const icon = this.querySelector('i');
        
        // Закрити topPanel якщо відкрита
        if (topPanel.classList.contains('show')) {
            topPanel.classList.remove('show');
            topPanel.style.display = "none";
            const settingsIcon = settingsBtn.querySelector('i');
            if (settingsIcon) {
                settingsIcon.classList.remove('fa-chevron-down');
                settingsIcon.classList.add('fa-chevron-up');
            }
        }
        
        if (icon.classList.contains('fa-chevron-right')) {
            setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
            
            avatarImg.classList.add('show');
            avatarImg.style.display = "flex";

        } else if (icon.classList.contains('fa-chevron-left')) {
            setTimeout(() => clickSound("luckyfin_generic_click", 0.32), 100);
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
            
            avatarImg.classList.remove('show');
            avatarImg.style.display = "none";
        }
    });
}

function clickSound(soundName, volume) {
    menuButtonSound.src = `sound/${soundName}.mp3`;
    menuButtonSound.volume = volume;
    menuButtonSound.play();
}
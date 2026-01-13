const volumeInTheLobby = document.querySelector('#sound-btn');
let musicEnabled = true;
const bgMusic = document.createElement('audio');
const UNMUTE_IMAGE = "..img/soundOn.png";
const MUTE_IMAGE = "..img/soundOff.png";
const TOTAL_TRACKS = 8;  // Кількість треків в lobbySounds/

// Створення зірок
function createStars() {
    const starsContainer = document.getElementById('stars');
    const count = 150;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        starsContainer.appendChild(star);
    }
}

// Падаюча зірка 🌠
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Рандомна стартова позиція (верхня частина екрану)
    star.style.left = Math.random() * 60 + '%';  // 0-60% зліва
    star.style.top = Math.random() * 30 + '%';   // 0-30% зверху

    document.body.appendChild(star);

    // Видалити після анімації
    setTimeout(() => {
        star.remove();
    }, 1500);
}

// Запуск зорепаду кожні 10 секунд
function startShootingStars() {
    // Перша зірка через 3 секунди
    setTimeout(createShootingStar, 3000);

    // Далі кожні 10 секунд
    setInterval(createShootingStar, 10000);
}

// Вимкнути музику лоббі
function stopLobbyMusic() {
    bgMusic.pause();
    musicEnabled = false;
    volumeInTheLobby.classList.add('muted');
    volumeInTheLobby.style.backgroundImage = "url('img/soundOff.png')";
}

// Запуск гри
function launchGame(gameName) {
    // Вимикаємо музику перед запуском гри
    stopLobbyMusic();
    
    // Статичні URL для GitHub Pages (збілджені версії)
    const gameUrls = {
        'shooterGame': '../shooterGame/dist/index.html',
        'marioGame': '../marioGame/dist/index.html',
        'Tetris': '../Tetris/index.html',
        'Snake': '../Snake/main.html',
        'battleShips': '../battleShips/index.html'
    };

    const viteGames = {
        'shooterGame': {port: 5173, name: 'Space Shooter'},
        'marioGame': {port: 5174, name: 'Mario Platformer'}
    };

    // Перевіряємо чи ми на localhost (розробка) чи на GitHub Pages
    const isLocalDev = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';

    if (viteGames[gameName] && isLocalDev) {
        const {port, name} = viteGames[gameName];
        const viteUrl = `http://localhost:${port}`;

        // Спробуємо перевірити чи сервер запущений
        checkViteServer(viteUrl, gameName, name, port);
    } else {
        // Для GitHub Pages або звичайних HTML ігор - відкриваємо статичну версію
        window.location.href = gameUrls[gameName];
    }
}

// Перевірка чи Vite сервер запущений
async function checkViteServer(url, gameName, displayName, port) {
    showLoadingModal(displayName);

    try {
        // Спробуємо fetch з таймаутом
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(url, {
            mode: 'no-cors',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Якщо дійшли сюди - сервер працює!
        hideModal();
        window.open(url, '_blank');

    } catch (error) {
        // Сервер не запущений - показуємо інструкцію
        hideModal();
        showStartServerModal(gameName, displayName, port);
    }
}

// Модальне вікно завантаження
function showLoadingModal(gameName) {
    const modal = document.createElement('div');
    modal.id = 'game-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content loading">
                <div class="loader"></div>
                <h3>Підключення до ${gameName}...</h3>
                <p>Перевіряємо чи сервер запущений</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Модальне вікно для запуску сервера
function showStartServerModal(gameName, displayName, port) {
    const modal = document.createElement('div');
    modal.id = 'game-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>🚀 Запустіть ${displayName}</h2>
                <p class="modal-subtitle">Ця гра потребує Vite сервер</p>
                
                <div class="terminal-box">
                    <div class="terminal-header">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                        <span class="terminal-title">Terminal</span>
                    </div>
                    <div class="terminal-body">
                        <div class="command">
                            <span class="prompt">$</span>
                            <span class="cmd">cd ${gameName}</span>
                            <button class="copy-btn" onclick="copyCommand('cd ${gameName}')">📋</button>
                        </div>
                        <div class="command">
                            <span class="prompt">$</span>
                            <span class="cmd">npm run dev</span>
                            <button class="copy-btn" onclick="copyCommand('npm run dev')">📋</button>
                        </div>
                    </div>
                </div>
                
                <p class="modal-info">Після запуску сервера натисніть кнопку нижче:</p>
                
                <div class="modal-buttons">
                    <button class="btn-primary" onclick="stopLobbyMusic(); window.open('http://localhost:${port}', '_blank'); hideModal();">
                        ▶ Відкрити гру (порт ${port})
                    </button>
                    <button class="btn-secondary" onclick="hideModal()">
                        ✕ Закрити
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function hideModal() {
    const modal = document.getElementById('game-modal');
    if (modal) modal.remove();
}

function copyCommand(cmd) {
    navigator.clipboard.writeText(cmd);

    // Показуємо підказку
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '✓ Скопійовано!';
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}

// Ефект при наведенні мишки (3D tilt)
function initCardEffects() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// VOLUME CONTROL SYSTEM
// ============================================
let volumeSliderVisible = false;
let longPressTimer = null;
let isLongPress = false;
const LONG_PRESS_DURATION = 500; // 0.5 секунди

// Створюємо контейнер для слайдера гучності
function createVolumeSlider() {
    const container = document.createElement('div');
    container.className = 'volume-container';
    container.id = 'volume-container';
    container.innerHTML = `
        <span class="volume-icon">🔊</span>
        <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" value="10">
        <span class="volume-value" id="volume-value">10%</span>
    `;
    document.body.appendChild(container);
    
    // Слухач для слайдера
    const slider = document.getElementById('volume-slider');
    const valueDisplay = document.getElementById('volume-value');
    const volumeIcon = container.querySelector('.volume-icon');
    
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        bgMusic.volume = value / 100;
        valueDisplay.textContent = value + '%';
        
        // Оновлюємо іконку
        if (value == 0) {
            volumeIcon.textContent = '🔇';
        } else if (value < 30) {
            volumeIcon.textContent = '🔈';
        } else if (value < 70) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    });
    
    // Закриваємо при кліку поза слайдером
    document.addEventListener('click', (e) => {
        if (volumeSliderVisible && 
            !container.contains(e.target) && 
            e.target !== volumeInTheLobby) {
            hideVolumeSlider();
        }
    });
    
    return container;
}

// Створюємо тултіп
function createSoundTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'sound-tooltip';
    tooltip.id = 'sound-tooltip';
    tooltip.innerHTML = `
        <span class="tooltip-icon">👆</span>
        <span class="tooltip-text">Long-press for volume control!</span>
    `;
    document.body.appendChild(tooltip);
    return tooltip;
}

function showVolumeSlider() {
    const container = document.getElementById('volume-container');
    const slider = document.getElementById('volume-slider');
    const valueDisplay = document.getElementById('volume-value');
    
    // Синхронізуємо слайдер з поточною гучністю
    const currentVolume = Math.round(bgMusic.volume * 100);
    slider.value = currentVolume;
    valueDisplay.textContent = currentVolume + '%';
    
    container.classList.add('visible');
    volumeSliderVisible = true;
    
    // Ховаємо тултіп
    hideSoundTooltip();
}

function hideVolumeSlider() {
    const container = document.getElementById('volume-container');
    container.classList.remove('visible');
    volumeSliderVisible = false;
}

function showSoundTooltip() {
    const tooltip = document.getElementById('sound-tooltip');
    tooltip.classList.add('visible');
}

function hideSoundTooltip() {
    const tooltip = document.getElementById('sound-tooltip');
    tooltip.classList.remove('visible');
}

// Long press handlers
function handleMouseDown(e) {
    e.preventDefault();
    isLongPress = false;
    
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        showVolumeSlider();
    }, LONG_PRESS_DURATION);
}

function handleMouseUp(e) {
    clearTimeout(longPressTimer);
    
    // Якщо це був короткий клік (не long press) - перемикаємо музику
    if (!isLongPress) {
        // Плавна анімація натискання
        volumeInTheLobby.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            volumeInTheLobby.style.transform = '';
            
            if (musicEnabled) {
                stopLobbyMusic();
            } else {
                musicEnabled = true;
                volumeInTheLobby.classList.remove('muted');
                volumeInTheLobby.style.backgroundImage = "url('img/soundOn.png')";
                playRandomTrack();
            }
        }, 100);
    }
}

function handleMouseLeave() {
    clearTimeout(longPressTimer);
}

// Ініціалізація контролю гучності
function initVolumeControl() {
    createVolumeSlider();
    createSoundTooltip();
    
    // Обробники для кнопки звуку
    volumeInTheLobby.addEventListener('mousedown', handleMouseDown);
    volumeInTheLobby.addEventListener('mouseup', handleMouseUp);
    volumeInTheLobby.addEventListener('mouseleave', handleMouseLeave);
    
    // Touch events для мобільних
    volumeInTheLobby.addEventListener('touchstart', handleMouseDown, { passive: false });
    volumeInTheLobby.addEventListener('touchend', handleMouseUp);
    
    // Показуємо тултіп при наведенні (тільки якщо слайдер прихований)
    volumeInTheLobby.addEventListener('mouseenter', () => {
        if (!volumeSliderVisible) {
            showSoundTooltip();
        }
    });
    
    volumeInTheLobby.addEventListener('mouseleave', () => {
        hideSoundTooltip();
    });
}

// Видаляємо старий click listener (замінений на mousedown/mouseup)

// Грати рандомний трек
function playRandomTrack() {
    if (!musicEnabled) return;
    
    const trackNumber = Math.floor(Math.random() * TOTAL_TRACKS) + 1;
    
    bgMusic.src = `lobbySounds/${trackNumber}.mp3`;
    bgMusic.volume = 0.2;
    bgMusic.load();
    
    bgMusic.oncanplaythrough = () => {
        bgMusic.play().catch(e => {
            console.log('Audio autoplay blocked. Click anywhere to enable.');
        });
    };
}

// Коли трек закінчився - грати наступний
bgMusic.addEventListener('ended', () => {
    playRandomTrack();
});

// Запуск музики при першому кліку (для браузерів що блокують autoplay)
function startMusicOnInteraction() {
    if (musicEnabled && bgMusic.paused) {
        playRandomTrack();
    }
    document.removeEventListener('click', startMusicOnInteraction);
}

// ============================================
// COMET CURSOR
// ============================================
function initCometCursor() {
    // Створюємо елемент курсора
    const cursor = document.createElement('div');
    cursor.id = 'comet-cursor';
    document.body.appendChild(cursor);
    
    let lastTrailTime = 0;
    const trailInterval = 30; // Інтервал між частинками хвоста (мс)
    
    // Слідуємо за мишкою
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Створюємо хвіст
        const now = Date.now();
        if (now - lastTrailTime > trailInterval) {
            createTrailParticle(e.clientX, e.clientY);
            lastTrailTime = now;
        }
    });
    
    // Ховаємо курсор коли миша виходить з вікна
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
    
    // Зміна кольору на ультрамарин при наведенні на планети, карточки та робота
    // Використовуємо делегування подій для динамічних елементів
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.game-card') || e.target.closest('.planet') || e.target.closest('#robot-guide')) {
            cursor.classList.add('ultramarine');
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.game-card') || e.target.closest('.planet') || e.target.closest('#robot-guide')) {
            // Перевіряємо, чи не переходимо на інший інтерактивний елемент
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || 
                (!relatedTarget.closest('.game-card') && !relatedTarget.closest('.planet') && !relatedTarget.closest('#robot-guide'))) {
                cursor.classList.remove('ultramarine');
            }
        }
    });
}

// Створюємо частинку хвоста комети
function createTrailParticle(x, y) {
    const trail = document.createElement('div');
    trail.className = 'comet-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    
    // Випадковий розмір для різноманіття
    const size = 4 + Math.random() * 6;
    trail.style.width = size + 'px';
    trail.style.height = size + 'px';
    
    document.body.appendChild(trail);
    
    // Видаляємо після анімації
    setTimeout(() => {
        trail.remove();
    }, 500);
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    initCardEffects();
    startShootingStars();
    initCometCursor();
    initVolumeControl();
    
    // Спроба автоматичного запуску музики
    playRandomTrack();
    
    // Якщо браузер заблокував - запустити при першому кліку
    document.addEventListener('click', startMusicOnInteraction);
});

# 🎮 Games Collection

Колекція браузерних ігор, створених з використанням JavaScript, HTML5 Canvas та PixiJS.

![Games](https://img.shields.io/badge/Games-5-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![PixiJS](https://img.shields.io/badge/PixiJS-v8-ff69b4)

---

## 🕹️ Ігри

### ⚓ BattleShips (Морський бій)

Класична гра "Морський бій" з піратською тематикою та унікальними механіками.

**Особливості:**
- 🎯 Гра проти AI бота з розумною стратегією
- 💣 Система мін з радіусом вибуху
- 🚢 Різні типи кораблів (1-4 клітинки)
- 🎨 Піратська стилізація з анімаціями
- 🔊 Звукові ефекти та фонова музика
- ⚙️ Налаштування гри

**Технології:** Vanilla JavaScript, CSS Grid, Web Audio API

---

### 🐍 Snake (Змійка)

Класична змійка з сучасним оформленням та кастомізацією.

**Особливості:**
- 🎨 7 різних фонів на вибір
- 🍳 Збирання яєць для росту
- 📈 Система очок
- 🔊 Звукові ефекти
- 📱 Адаптивний дизайн

**Технології:** Vanilla JavaScript, HTML5 Canvas

---

### 🧱 Tetris (Тетріс)

Повноцінний тетріс з музичним плеєром та налаштуваннями.

**Особливості:**
- 🎵 Вбудований музичний плеєр з 26 треками
- 🖼️ 58 фонових зображень
- ⏱️ Таймер гри
- 📊 Система рівнів та швидкості
- 🎮 Підтримка клавіатури
- 💾 Збереження прогресу

**Управління:**
| Клавіша | Дія |
|---------|-----|
| ← → | Рух вліво/вправо |
| ↓ | Прискорення |
| ↑ / Space | Поворот |

**Технології:** Vanilla JavaScript, HTML5 Canvas

---

### 🍄 Mario Platformer

2D платформер у стилі Super Mario Bros, створений на PixiJS.

**Особливості:**
- 🏃 Фізика руху та стрибків
- 🧱 Руйнівні цегляні блоки (кожен окремо)
- ❓ Блоки з питанням - випадають гриби
- 🍄 Грибочки дають +500 очок та +1 життя
- 🐢 Вороги (гумби та купи)
- 🪙 Збір монет
- 🌍 Прокручуваний світ
- ❤️ Система життів

**Управління:**
| Клавіша | Дія |
|---------|-----|
| ← → | Рух |
| Space / ↑ | Стрибок |

**Технології:** PixiJS v8, Vite, ES6 Modules

**Запуск:**
```bash
cd marioGame
npm install
npm run dev
```

---

### 🚀 Space Shooter

Космічний шутер з апгрейдами та системою хвиль.

**Особливості:**
- 🛸 Детальний корабель гравця з анімацією двигунів
- 👾 Різні типи ворогів (звичайні та важкі)
- 🎁 Система апгрейдів:
  - 🛡️ Щит - блокує 1 удар
  - 🔫 Подвійний постріл
  - 🔱 Потрійний постріл
  - ⚡ Прискорення
  - ❤️ Відновлення здоров'я
- 🌊 Система хвиль з наростаючою складністю
- 💥 Ефектні вибухи з частинками
- 🎵 Синтезована космічна музика
- 🔊 Звукові ефекти (постріли, вибухи, збір апгрейдів)
- ⭐ Паралакс фон із зірками

**Управління:**
| Клавіша | Дія |
|---------|-----|
| ← → | Рух |
| Space | Стрільба |
| M | Вкл/Викл музику |
| S | Вкл/Викл звуки |

**Технології:** PixiJS v8, Vite, Web Audio API, ES6 Modules

**Запуск:**
```bash
cd shooterGame
npm install
npm run dev
```

---

## 🎮 Game Lobby

Головне меню для запуску всіх ігор з космічним дизайном та 3D ефектами карток.

**Запуск:**
1. Для BattleShips, Snake, Tetris - відкрийте `index.html`
2. Для Mario та Shooter - потрібен Vite dev server (інструкції в лоббі)

---

## 📁 Структура проекту

```
Games/
├── index.html          # Game Lobby
├── README.md
├── .gitignore
│
├── battleShips/        # Морський бій
│   ├── index.html
│   ├── bord.js
│   ├── botMove.js
│   ├── userMove.js
│   ├── img/
│   ├── sound/
│   └── styles/
│
├── Snake/              # Змійка
│   ├── main.html
│   ├── script.js
│   ├── img/
│   ├── sound/
│   └── style/
│
├── Tetris/             # Тетріс
│   ├── index.html
│   ├── script.js
│   ├── img/
│   ├── img_back/
│   ├── sound/
│   └── style/
│
├── marioGame/          # Mario Platformer (PixiJS)
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── main.js
│   │   ├── Game.js
│   │   ├── Player.js
│   │   ├── Platform.js
│   │   ├── Enemy.js
│   │   ├── Coin.js
│   │   ├── Mushroom.js
│   │   └── ...
│   └── img/
│
└── shooterGame/        # Space Shooter (PixiJS)
    ├── index.html
    ├── package.json
    ├── src/
    │   ├── main.js
    │   ├── Game.js
    │   ├── Player.js
    │   ├── Enemy.js
    │   ├── PowerUp.js
    │   ├── SoundManager.js
    │   └── ...
    └── styles/
```

---

## 🛠️ Технології

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Game Engine:** PixiJS v8
- **Build Tool:** Vite
- **Audio:** Web Audio API (синтезований звук)
- **Graphics:** HTML5 Canvas, PixiJS Graphics

---

## 🚀 Швидкий старт

### Прості ігри (без збірки):
```bash
# Відкрийте у браузері:
# - index.html (лоббі)
# - battleShips/index.html
# - Snake/main.html
# - Tetris/index.html
```

### PixiJS ігри:
```bash
# Mario Platformer
cd marioGame
npm install
npm run dev

# Space Shooter
cd shooterGame
npm install
npm run dev
```

---

## 📝 Ліцензія

MIT License - вільне використання для навчання та розваг.

---

## 👨‍💻 Автор

Створено з ❤️ для вивчення JavaScript та розробки ігор.

---

*Приємної гри! 🎮*


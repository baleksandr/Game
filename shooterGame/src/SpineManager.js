/**
 * SpineManager - Менеджер для роботи з Spine анімаціями
 * 
 * Spine-Pixi дозволяє використовувати скелетні анімації.
 * Зараз працює в режимі fallback (без Spine файлів).
 * 
 * Щоб увімкнути Spine:
 * 1. Додайте свої Spine файли в assets/spine/
 * 2. Розкоментуйте код завантаження
 */

export class SpineManager {
    constructor(game) {
        this.game = game;
        this.spineObjects = new Map();
        this.isSpineAvailable = false;
        this.Spine = null;
        this.assetsLoaded = false;
    }
    
    async init() {
        // Spine вимкнено за замовчуванням для стабільності
        // Щоб увімкнути - встановіть enableSpine = true
        const enableSpine = false;
        
        if (!enableSpine) {
            console.log('ℹ️ Spine disabled, using fallback graphics');
            console.log('   To enable: set enableSpine = true in SpineManager.init()');
            return;
        }
        
        try {
            const spineModule = await import('@esotericsoftware/spine-pixi-v8');
            
            if (spineModule && spineModule.Spine) {
                this.Spine = spineModule.Spine;
                this.isSpineAvailable = true;
                console.log('✨ Spine-Pixi loaded!');
            }
        } catch (error) {
            console.log('ℹ️ Spine not loaded:', error.message);
            this.isSpineAvailable = false;
        }
    }
    
    /**
     * Перевірка чи Spine готовий до використання
     */
    isReady() {
        return this.isSpineAvailable && this.assetsLoaded;
    }
    
    /**
     * Завантаження локальних Spine ресурсів
     * Використовуйте цей метод коли маєте свої Spine файли
     */
    async loadLocalAssets(name, jsonPath, atlasPath) {
        if (!this.isSpineAvailable) return false;
        
        try {
            const { Assets } = await import('pixi.js');
            
            await Assets.load([
                { alias: `${name}Data`, src: jsonPath },
                { alias: `${name}Atlas`, src: atlasPath },
            ]);
            
            this.assetsLoaded = true;
            console.log(`🎭 Spine asset "${name}" loaded!`);
            return true;
            
        } catch (error) {
            console.error(`Failed to load Spine asset "${name}":`, error);
            return false;
        }
    }
    
    /**
     * Створення Spine об'єкта
     */
    createSpineObject(name, animationName = 'idle') {
        if (!this.isReady() || !this.Spine) {
            return null;
        }
        
        try {
            const spineObject = this.Spine.from({
                skeleton: `${name}Data`,
                atlas: `${name}Atlas`,
            });
            
            if (spineObject.state) {
                spineObject.state.setAnimation(0, animationName, true);
            }
            
            this.spineObjects.set(name, spineObject);
            return spineObject;
            
        } catch (error) {
            console.error(`Failed to create Spine object '${name}':`, error);
            return null;
        }
    }
    
    setAnimation(name, animationName, loop = true, track = 0) {
        const spineObject = this.spineObjects.get(name);
        if (spineObject && spineObject.state) {
            spineObject.state.setAnimation(track, animationName, loop);
        }
    }
    
    addAnimation(name, animationName, loop = true, delay = 0, track = 0) {
        const spineObject = this.spineObjects.get(name);
        if (spineObject && spineObject.state) {
            spineObject.state.addAnimation(track, animationName, loop, delay);
        }
    }
    
    getSpineObject(name) {
        return this.spineObjects.get(name);
    }
    
    getStatus() {
        return {
            available: this.isSpineAvailable,
            assetsLoaded: this.assetsLoaded,
            objectsCount: this.spineObjects.size,
        };
    }
}

/*
 * ═══════════════════════════════════════════════════════════
 * 📚 ЯК ВИКОРИСТОВУВАТИ SPINE АНІМАЦІЇ
 * ═══════════════════════════════════════════════════════════
 * 
 * 1. ПІДГОТОВКА ФАЙЛІВ:
 *    - Створіть анімації в Spine Editor (https://esotericsoftware.com)
 *    - Експортуйте: JSON + Atlas + PNG
 *    - Покладіть в: public/assets/spine/hero/
 *      ├── hero.json
 *      ├── hero.atlas  
 *      └── hero.png
 * 
 * 2. УВІМКНЕННЯ SPINE:
 *    В методі init() змініть:
 *    const enableSpine = true;
 * 
 * 3. ЗАВАНТАЖЕННЯ:
 *    await spineManager.loadLocalAssets(
 *        'hero',
 *        '/assets/spine/hero/hero.json',
 *        '/assets/spine/hero/hero.atlas'
 *    );
 * 
 * 4. ВИКОРИСТАННЯ:
 *    const hero = spineManager.createSpineObject('hero', 'idle');
 *    container.addChild(hero);
 *    
 *    // Зміна анімації:
 *    spineManager.setAnimation('hero', 'run', true);
 *    spineManager.setAnimation('hero', 'attack', false);
 *    spineManager.addAnimation('hero', 'idle', true);
 * 
 * 5. ТИПОВІ АНІМАЦІЇ:
 *    - idle     - спокій
 *    - run      - біг
 *    - walk     - ходьба
 *    - jump     - стрибок
 *    - attack   - атака
 *    - shoot    - стрільба
 *    - hit      - отримання удару
 *    - death    - смерть
 * ═══════════════════════════════════════════════════════════
 */

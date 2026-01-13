/**
 * SoundManager - Система звуків на Web Audio API
 * Підтримує MP3 фонову музику та синтетичні звукові ефекти!
 */

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = null;
        this.enabled = true;
        this.volume = 0.3;
        this.musicVolume = 0.25;
        
        // Фонова музика (MP3)
        this.bgMusic = null;
        this.bgMusicSource = null;
        this.isMusicPlaying = false;
        this.musicPending = false; // Музика очікує завантаження
        this.musicLoaded = false;
        this.musicLoadFailed = false; // Прапорець провалу завантаження
        this.musicRetryCount = 0; // Лічильник спроб
        this.maxMusicRetries = 10; // Максимум 10 спроб (5 секунд)
        
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Майстер гучність
            this.masterVolume = this.audioContext.createGain();
            this.masterVolume.gain.value = this.volume;
            this.masterVolume.connect(this.audioContext.destination);
            
            // Окремий канал для музики
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.audioContext.destination);
            
            // Завантажуємо MP3 музику
            this.loadBackgroundMusic();
            
            console.log('🔊 Sound system initialized!');
        } catch (error) {
            console.log('⚠️ Web Audio API not available');
            this.enabled = false;
        }
    }
    
    /**
     * Завантаження MP3 файлу фонової музики
     */
    async loadBackgroundMusic() {
        try {
            const response = await fetch('sounds/melodiya_kosmosa meloboom.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.bgMusic = await this.audioContext.decodeAudioData(arrayBuffer);
            this.musicLoaded = true;
            this.musicLoadFailed = false;
            console.log('🎵 Background music loaded!');
        } catch (error) {
            console.log('⚠️ Could not load background music:', error);
            this.musicLoaded = false;
            this.musicLoadFailed = true; // Позначаємо що завантаження провалилось
        }
    }
    
    // Розблокування аудіо (потрібно після взаємодії користувача)
    unlock() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterVolume) {
            this.masterVolume.gain.value = this.volume;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // ==================== ЗВУКОВІ ЕФЕКТИ ====================
    
    /**
     * Лазерний постріл гравця
     */
    playShoot() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * Ворожий постріл (більш низький)
     */
    playEnemyShoot() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * Вибух (при знищенні ворога)
     */
    playExplosion() {
        if (!this.enabled || !this.audioContext) return;
        
        // Шум для вибуху
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.3);
        
        // Додатковий низький удар
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.2);
        
        oscGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Попадання (по гравцю або ворогу)
     */
    playHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }
    
    /**
     * Збір апгрейду
     */
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        
        // Арпеджіо вгору
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + i * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }
    
    /**
     * Втрата апгрейду / удар
     */
    playDamage() {
        if (!this.enabled || !this.audioContext) return;
        
        // Низхідний звук
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        // Додаємо вібрато
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 20;
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        lfo.start();
        osc.start();
        lfo.stop(this.audioContext.currentTime + 0.3);
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Нова хвиля
     */
    playWaveStart() {
        if (!this.enabled || !this.audioContext) return;
        
        // Епічний звук нової хвилі
        const notes = [261, 329, 392, 523]; // C4, E4, G4, C5
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
            gain.gain.setValueAtTime(0.12, startTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    }
    
    /**
     * Game Over
     */
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;
        
        // Сумний низхідний звук
        const notes = [523, 466, 392, 261]; // C5, Bb4, G4, C4
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + i * 0.25;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.setValueAtTime(0.15, startTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }
    
    /**
     * Щит блокує удар
     */
    playShieldBlock() {
        if (!this.enabled || !this.audioContext) return;
        
        // Металевий дзвін
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 1200;
        
        osc2.type = 'sine';
        osc2.frequency.value = 1500;
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterVolume);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.3);
        osc2.stop(this.audioContext.currentTime + 0.3);
    }
    
    // ==================== ФОНОВА КОСМІЧНА МУЗИКА (MP3) ====================
    
    /**
     * Запуск космічної музики з MP3 файлу
     */
    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext || this.isMusicPlaying) return;
        
        if (!this.musicLoaded || !this.bgMusic) {
            // Якщо завантаження вже провалилось - не повторюємо
            if (this.musicLoadFailed) {
                console.log('⚠️ Music failed to load, not retrying');
                this.musicPending = false;
                return;
            }
            
            // Перевіряємо ліміт спроб
            if (this.musicRetryCount >= this.maxMusicRetries) {
                console.log('⚠️ Max music retry attempts reached, giving up');
                this.musicLoadFailed = true;
                this.musicPending = false;
                return;
            }
            
            // Позначаємо що музика очікує завантаження
            this.musicPending = true;
            this.musicRetryCount++;
            console.log(`⚠️ Music not loaded yet, retrying... (${this.musicRetryCount}/${this.maxMusicRetries})`);
            setTimeout(() => this.startBackgroundMusic(), 500);
            return;
        }
        
        // Скидаємо лічильники при успішному запуску
        this.musicRetryCount = 0;
        this.musicPending = false;
        
        try {
            // Створюємо новий source для відтворення
            this.bgMusicSource = this.audioContext.createBufferSource();
            this.bgMusicSource.buffer = this.bgMusic;
            this.bgMusicSource.loop = true; // Зациклюємо музику
            
            // Підключаємо до каналу музики
            this.bgMusicSource.connect(this.musicGain);
            
            // Запускаємо!
            this.bgMusicSource.start(0);
            this.isMusicPlaying = true;
            
            console.log('🎵 Playing cosmic background music!');
        } catch (error) {
            console.log('⚠️ Error playing music:', error);
            this.musicPending = false;
        }
    }
    
    /**
     * Зупинка музики
     */
    stopBackgroundMusic() {
        if (this.bgMusicSource) {
            try {
                this.bgMusicSource.stop();
                this.bgMusicSource.disconnect();
            } catch (e) {
                // Ігноруємо помилки при зупинці
            }
            this.bgMusicSource = null;
        }
        
        this.isMusicPlaying = false;
        this.musicPending = false; // Скасовуємо очікування
        this.musicRetryCount = 0; // Скидаємо лічильник спроб
        console.log('🎵 Music stopped');
    }
    
    /**
     * Переключення музики
     */
    toggleMusic() {
        // Якщо грає або очікує - зупиняємо
        if (this.isMusicPlaying || this.musicPending) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
        // Повертаємо true якщо грає АБО очікує завантаження
        return this.isMusicPlaying || this.musicPending;
    }
    
    /**
     * Встановлення гучності музики
     */
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
}




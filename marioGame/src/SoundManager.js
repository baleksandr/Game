/**
 * SoundManager для Mario - керує звуками гри
 */

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        
        // Аудіо буфери
        this.sounds = {
            background: null,
            levelComplete: null,
            gameOver: null,
            jump: null,
            coin: null,
            powerUp: null
        };
        
        // Поточне джерело музики
        this.bgMusicSource = null;
        this.isMusicPlaying = false;
        
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Майстер гучність для музики
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.audioContext.destination);
            
            // Майстер гучність для ефектів
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.audioContext.destination);
            
            // Завантажуємо всі звуки
            this.loadAllSounds();
            
            console.log('🔊 Mario Sound system initialized!');
        } catch (error) {
            console.log('⚠️ Web Audio API not available');
            this.enabled = false;
        }
    }
    
    async loadAllSounds() {
        try {
            // Фонова музика
            this.sounds.background = await this.loadSound('sounds/super-mario-tone meloboom.mp3');
            console.log('🎵 Background music loaded');
            
            // Завершення рівня
            this.sounds.levelComplete = await this.loadSound('sounds/mario-level-complete meloboom.mp3');
            console.log('🎵 Level complete sound loaded');
            
            // Game Over
            this.sounds.gameOver = await this.loadSound('sounds/game-over-mario.mp3');
            console.log('🎵 Game over sound loaded');
            
            // Стрибок
            this.sounds.jump = await this.loadSound('sounds/mario-jump-sms meloboom.mp3');
            console.log('🎵 Jump sound loaded');
            
            // Монета
            this.sounds.coin = await this.loadSound('sounds/moneta-v-mario.mp3');
            console.log('🎵 Coin sound loaded');
            
            // Power Up (гриб - збільшення)
            this.sounds.powerUp = await this.loadSound('sounds/uvelichen-mar.mp3');
            console.log('🎵 Power up sound loaded');
            
        } catch (error) {
            console.log('⚠️ Error loading sounds:', error);
        }
    }
    
    async loadSound(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.log(`⚠️ Could not load sound: ${url}`);
            return null;
        }
    }
    
    // Розблокування аудіо (потрібно після взаємодії користувача)
    unlock() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Запуск фонової музики
     */
    startBackgroundMusic() {
        if (!this.enabled || !this.sounds.background || this.isMusicPlaying) return;
        
        try {
            this.bgMusicSource = this.audioContext.createBufferSource();
            this.bgMusicSource.buffer = this.sounds.background;
            this.bgMusicSource.loop = true;
            this.bgMusicSource.connect(this.musicGain);
            this.bgMusicSource.start(0);
            this.isMusicPlaying = true;
            console.log('🎵 Mario background music started!');
        } catch (error) {
            console.log('⚠️ Error starting music:', error);
        }
    }
    
    /**
     * Зупинка фонової музики
     */
    stopBackgroundMusic() {
        if (this.bgMusicSource) {
            try {
                this.bgMusicSource.stop();
                this.bgMusicSource.disconnect();
            } catch (e) {}
            this.bgMusicSource = null;
        }
        this.isMusicPlaying = false;
    }
    
    /**
     * Звук завершення рівня
     */
    playLevelComplete() {
        if (!this.enabled || !this.sounds.levelComplete) return;
        
        // Зупиняємо фонову музику
        this.stopBackgroundMusic();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.levelComplete;
        source.connect(this.sfxGain);
        source.start(0);
    }
    
    /**
     * Звук програшу
     */
    playGameOver() {
        if (!this.enabled || !this.sounds.gameOver) return;
        
        // Зупиняємо фонову музику
        this.stopBackgroundMusic();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.gameOver;
        source.connect(this.sfxGain);
        source.start(0);
    }
    
    /**
     * Звук стрибка (MP3)
     */
    playJump() {
        if (!this.enabled || !this.sounds.jump) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.jump;
        source.connect(this.sfxGain);
        source.start(0);
    }
    
    /**
     * Звук збору монети (MP3)
     */
    playCoin() {
        if (!this.enabled || !this.sounds.coin) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.coin;
        source.connect(this.sfxGain);
        source.start(0);
    }
    
    /**
     * Звук збору гриба / збільшення (MP3)
     */
    playPowerUp() {
        if (!this.enabled || !this.sounds.powerUp) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.powerUp;
        source.connect(this.sfxGain);
        source.start(0);
    }
    
    /**
     * Звук розбиття блоку
     */
    playBreakBlock() {
        if (!this.enabled || !this.audioContext) return;
        
        // Шум для розбиття
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start();
    }
    
    /**
     * Звук удару об блок знизу
     */
    playBump() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }
    
    /**
     * Звук стрибка на ворога
     */
    playStompEnemy() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * Звук втрати життя
     */
    playHurt() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Переключення звуку
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
        
        return this.enabled;
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


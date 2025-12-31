/**
 * SoundManager - Система звуків на Web Audio API
 * Генерує синтетичні космічні звуки без файлів!
 */

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = null;
        this.enabled = true;
        this.volume = 0.3;
        this.musicVolume = 0.12;
        
        // Фонова музика
        this.bgMusicNodes = [];
        this.isMusicPlaying = false;
        
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
            
            console.log('🔊 Sound system initialized!');
        } catch (error) {
            console.log('⚠️ Web Audio API not available');
            this.enabled = false;
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
    
    // ==================== ФОНОВА КОСМІЧНА МУЗИКА ====================
    
    /**
     * Запуск космічної музики (без гудіння!)
     */
    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext || this.isMusicPlaying) return;
        
        this.isMusicPlaying = true;
        console.log('🎵 Starting space music...');
        
        // Тільки мелодійні елементи - без постійних дронів!
        this.startMelody();
        this.startBassLine();
        this.startPads();
    }
    
    /**
     * Зупинка музики
     */
    stopBackgroundMusic() {
        this.isMusicPlaying = false;
        
        // Очищаємо всі інтервали
        if (this.melodyInterval) clearInterval(this.melodyInterval);
        if (this.bassInterval) clearInterval(this.bassInterval);
        if (this.padInterval) clearInterval(this.padInterval);
        if (this.cosmicInterval) clearInterval(this.cosmicInterval);
        
        this.bgMusicNodes = [];
        console.log('🎵 Music stopped');
    }
    
    /**
     * Основна мелодія - космічна тема
     */
    startMelody() {
        // Космічна мелодія в A minor
        const melody = [
            { note: 440, duration: 0.4 },   // A4
            { note: 523, duration: 0.4 },   // C5
            { note: 659, duration: 0.6 },   // E5
            { note: 587, duration: 0.3 },   // D5
            { note: 523, duration: 0.5 },   // C5
            { note: 440, duration: 0.8 },   // A4
            { note: 0, duration: 0.5 },     // пауза
            { note: 392, duration: 0.4 },   // G4
            { note: 440, duration: 0.4 },   // A4
            { note: 523, duration: 0.6 },   // C5
            { note: 440, duration: 0.8 },   // A4
            { note: 0, duration: 1.0 },     // пауза
        ];
        
        let noteIndex = 0;
        
        const playNextNote = () => {
            if (!this.isMusicPlaying || !this.enabled) return;
            
            const { note, duration } = melody[noteIndex];
            
            if (note > 0) {
                this.playMelodyNote(note, duration);
            }
            
            noteIndex = (noteIndex + 1) % melody.length;
            
            // Наступна нота
            this.melodyInterval = setTimeout(playNextNote, duration * 1000 + 100);
        };
        
        playNextNote();
    }
    
    /**
     * Грає одну ноту мелодії
     */
    playMelodyNote(frequency, duration) {
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // М'який синтезаторний звук
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        // Легке вібрато
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.value = 5;
        vibratoGain.gain.value = 3;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.05, now + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.3);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(now);
        vibrato.start(now);
        osc.stop(now + duration + 0.4);
        vibrato.stop(now + duration + 0.4);
    }
    
    /**
     * Бас-лінія
     */
    startBassLine() {
        const bassNotes = [
            { note: 110, duration: 1.5 },  // A2
            { note: 110, duration: 1.5 },  // A2
            { note: 130.8, duration: 1.5 },// C3
            { note: 146.8, duration: 1.5 },// D3
            { note: 110, duration: 1.5 },  // A2
            { note: 98, duration: 1.5 },   // G2
            { note: 110, duration: 2.0 },  // A2
        ];
        
        let noteIndex = 0;
        
        const playBass = () => {
            if (!this.isMusicPlaying || !this.enabled) return;
            
            const { note, duration } = bassNotes[noteIndex];
            this.playBassNote(note, duration);
            
            noteIndex = (noteIndex + 1) % bassNotes.length;
            this.bassInterval = setTimeout(playBass, duration * 1000);
        };
        
        // Починаємо бас з затримкою
        setTimeout(playBass, 500);
    }
    
    /**
     * Грає басову ноту
     */
    playBassNote(frequency, duration) {
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        
        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }
    
    /**
     * Пади (акорди на фоні)
     */
    startPads() {
        const chords = [
            [220, 261.6, 329.6],  // Am
            [196, 246.9, 293.7],  // G
            [174.6, 220, 261.6],  // F
            [164.8, 207.7, 261.6],// Em
        ];
        
        let chordIndex = 0;
        
        const playPad = () => {
            if (!this.isMusicPlaying || !this.enabled) return;
            
            this.playChord(chords[chordIndex], 4);
            
            chordIndex = (chordIndex + 1) % chords.length;
            this.padInterval = setTimeout(playPad, 4500);
        };
        
        // Починаємо пади з затримкою
        setTimeout(playPad, 1000);
    }
    
    /**
     * Грає акорд
     */
    playChord(notes, duration) {
        if (!this.audioContext) return;
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            const now = this.audioContext.currentTime;
            const delay = i * 0.05; // Легке арпеджіо
            
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.025, now + delay + 0.5);
            gain.gain.linearRampToValueAtTime(0.02, now + delay + duration - 1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now + delay);
            osc.stop(now + delay + duration);
        });
    }
    
    /**
     * Переключення музики
     */
    toggleMusic() {
        if (this.isMusicPlaying) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
        return this.isMusicPlaying;
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


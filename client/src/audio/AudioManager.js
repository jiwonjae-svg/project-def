/**
 * Audio Manager - Sound effects and music management
 */

import Phaser from 'phaser';

class AudioManager {
  constructor() {
    this.scene = null;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.currentMusic = null;
    this.sounds = new Map();
    this.enabled = true;
    this.musicEnabled = true;
  }

  init(scene) {
    this.scene = scene;
    this.loadSettings();
  }

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('projectd_settings') || '{}');
      this.musicVolume = (settings.musicVolume || 70) / 100;
      this.sfxVolume = (settings.sfxVolume || 80) / 100;
      this.enabled = settings.sfxEnabled !== false;
      this.musicEnabled = settings.musicEnabled !== false;
    } catch (e) {
      console.warn('Failed to load audio settings');
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.currentMusic) {
      this.currentMusic.setVolume(volume);
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
  }

  toggleMusic(enabled) {
    this.musicEnabled = enabled;
    if (this.currentMusic) {
      if (enabled) {
        this.currentMusic.resume();
      } else {
        this.currentMusic.pause();
      }
    }
  }

  toggleSfx(enabled) {
    this.enabled = enabled;
  }

  playMusic(key, config = {}) {
    if (!this.scene || !this.musicEnabled) return;

    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    // Check if sound exists
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`Music not found: ${key}`);
      return;
    }

    this.currentMusic = this.scene.sound.add(key, {
      volume: this.musicVolume,
      loop: config.loop !== false,
      ...config
    });

    this.currentMusic.play();
    return this.currentMusic;
  }

  stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    if (fadeOut && this.scene) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: 500,
        onComplete: () => {
          this.currentMusic.stop();
          this.currentMusic = null;
        }
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  resumeMusic() {
    if (this.currentMusic && this.musicEnabled) {
      this.currentMusic.resume();
    }
  }

  play(key, config = {}) {
    if (!this.scene || !this.enabled) return;

    // Check if sound exists
    if (!this.scene.cache.audio.exists(key)) {
      // Generate procedural sound if not exists
      this.playProceduralSound(key);
      return;
    }

    const sound = this.scene.sound.add(key, {
      volume: this.sfxVolume * (config.volume || 1),
      ...config
    });

    sound.play();
    return sound;
  }

  playProceduralSound(type) {
    // Generate sounds procedurally using Web Audio API
    if (!this.scene || !this.enabled) return;

    const audioContext = this.scene.sound.context;
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const volume = this.sfxVolume * 0.3;

    switch (type) {
      case 'click':
        this.generateClick(audioContext, now, volume);
        break;
      case 'hover':
        this.generateHover(audioContext, now, volume);
        break;
      case 'place':
        this.generatePlace(audioContext, now, volume);
        break;
      case 'hit':
        this.generateHit(audioContext, now, volume);
        break;
      case 'coin':
        this.generateCoin(audioContext, now, volume);
        break;
      case 'powerup':
        this.generatePowerup(audioContext, now, volume);
        break;
      case 'error':
        this.generateError(audioContext, now, volume);
        break;
      case 'success':
        this.generateSuccess(audioContext, now, volume);
        break;
      case 'explosion':
        this.generateExplosion(audioContext, now, volume);
        break;
      case 'card':
        this.generateCardSound(audioContext, now, volume);
        break;
    }
  }

  generateClick(ctx, time, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(600, time + 0.1);
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }

  generateHover(ctx, time, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, time);
    
    gain.gain.setValueAtTime(volume * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  generatePlace(ctx, time, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.15);
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.start(time);
    osc.stop(time + 0.15);
  }

  generateHit(ctx, time, volume) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(time);
  }

  generateCoin(ctx, time, volume) {
    const notes = [1046.5, 1318.5, 1568]; // C6, E6, G6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + i * 0.05);
      
      gain.gain.setValueAtTime(volume, time + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.05 + 0.15);
      
      osc.start(time + i * 0.05);
      osc.stop(time + i * 0.05 + 0.15);
    });
  }

  generatePowerup(ctx, time, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + 0.2);
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    
    osc.start(time);
    osc.stop(time + 0.25);
  }

  generateError(ctx, time, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.setValueAtTime(150, time + 0.1);
    
    gain.gain.setValueAtTime(volume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  generateSuccess(ctx, time, volume) {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + i * 0.08);
      
      gain.gain.setValueAtTime(volume, time + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.08 + 0.2);
      
      osc.start(time + i * 0.08);
      osc.stop(time + i * 0.08 + 0.2);
    });
  }

  generateExplosion(ctx, time, volume) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(time);
  }

  generateCardSound(ctx, time, volume) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, time);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.5, time);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(time);
  }

  // Vibration support for mobile
  vibrate(pattern = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Cleanup
  destroy() {
    this.stopMusic(false);
    this.sounds.forEach(sound => sound.destroy());
    this.sounds.clear();
  }
}

// Singleton instance
export const audioManager = new AudioManager();
export default audioManager;

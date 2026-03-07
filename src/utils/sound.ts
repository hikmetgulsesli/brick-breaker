/**
 * Web Audio API Sound Manager for Retro Brick Breaker
 * Generates synthesized sounds without external audio files
 */

export type SoundType = 
  | 'paddleHit' 
  | 'brickHit' 
  | 'powerUpCollect' 
  | 'lifeLost' 
  | 'gameOver' 
  | 'victory'
  | 'buttonClick';

export interface SoundManager {
  play: (type: SoundType, options?: { pitch?: number; volume?: number }) => void;
  toggleMute: () => boolean;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
}

class WebAudioSoundManager implements SoundManager {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private volume = 0.5;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization - create context on first user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext(): void {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    } catch {
      // AudioContext not supported
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.initAudioContext();
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      void this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Play a synthesized sound effect
   */
  play(type: SoundType, options: { pitch?: number; volume?: number } = {}): void {
    if (this.muted) return;
    
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'paddleHit':
        this.playPaddleHit(ctx, now, options);
        break;
      case 'brickHit':
        this.playBrickHit(ctx, now, options);
        break;
      case 'powerUpCollect':
        this.playPowerUpCollect(ctx, now, options);
        break;
      case 'lifeLost':
        this.playLifeLost(ctx, now, options);
        break;
      case 'gameOver':
        this.playGameOver(ctx, now, options);
        break;
      case 'victory':
        this.playVictory(ctx, now, options);
        break;
      case 'buttonClick':
        this.playButtonClick(ctx, now, options);
        break;
    }
  }

  /**
   * Paddle hit: Low thud at 80Hz
   */
  private playPaddleHit(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    const vol = (options.volume ?? 1) * this.volume;
    gain.gain.setValueAtTime(vol * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Brick hit: Pitch based on durability (200Hz, 400Hz, 600Hz)
   */
  private playBrickHit(ctx: AudioContext, now: number, options: { pitch?: number; volume?: number } = {}): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Pitch increases with durability: level 1=200Hz, level 2=400Hz, level 3=600Hz
    const baseFreq = options.pitch ?? 200;
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.08);
    
    // Add a touch of distortion for retro feel
    const vol = (options.volume ?? 1) * this.volume;
    gain.gain.setValueAtTime(vol * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Power-up collect: Ascending chime
   */
  private playPowerUpCollect(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (ascending major arpeggio)
    const vol = (options.volume ?? 1) * this.volume;
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      const noteStart = now + index * 0.05;
      osc.frequency.setValueAtTime(freq, noteStart);
      
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(vol * 0.3, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(noteStart);
      osc.stop(noteStart + 0.25);
    });
  }

  /**
   * Life lost: Descending tone
   */
  private playLifeLost(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
    
    const vol = (options.volume ?? 1) * this.volume;
    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.linearRampToValueAtTime(vol * 0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Game over: Dramatic sting
   */
  private playGameOver(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const vol = (options.volume ?? 1) * this.volume;
    
    // Dissonant chord with falling pitch
    const freqs = [440, 466.16, 300]; // A4, A#4 (dissonant), plus low drone
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = index === 2 ? 'sawtooth' : 'square';
      const startTime = now + index * 0.05;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, startTime + 0.8);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * (index === 2 ? 0.4 : 0.25), startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
    
    // Add noise burst for impact
    this.playNoiseBurst(ctx, now + 0.1, vol * 0.3, 0.3);
  }

  /**
   * Victory: Success fanfare
   */
  private playVictory(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const vol = (options.volume ?? 1) * this.volume;
    
    // Major chord fanfare: C - E - G - C
    const chord = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.05 }, // E5
      { freq: 783.99, time: 0.1 },  // G5
      { freq: 1046.50, time: 0.15 }, // C6
    ];
    
    chord.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      const noteTime = now + time;
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(vol * 0.4, noteTime + 0.1);
      gain.gain.setValueAtTime(vol * 0.4, noteTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 1.0);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(noteTime);
      osc.stop(noteTime + 1.1);
    });
    
    // Add a secondary flourish
    const flourish = [1318.51, 1567.98, 2093.00]; // E6, G6, C7
    flourish.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      const noteTime = now + 0.5 + index * 0.08;
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(vol * 0.2, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  /**
   * Button click: Short blip
   */
  private playButtonClick(ctx: AudioContext, now: number, options: { volume?: number } = {}): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    
    const vol = (options.volume ?? 1) * this.volume;
    gain.gain.setValueAtTime(vol * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Helper: White noise burst
   */
  private playNoiseBurst(ctx: AudioContext, now: number, volume: number, duration: number): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noise.connect(gain);
    gain.connect(this.masterGain!);
    
    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.audioContext?.currentTime ?? 0, 0.1);
    }
    return this.muted;
  }

  /**
   * Get current mute state
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext?.currentTime ?? 0, 0.1);
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

/**
 * Get the singleton sound manager instance
 */
export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new WebAudioSoundManager();
  }
  return soundManagerInstance;
}

/**
 * Reset the sound manager (useful for testing)
 */
export function resetSoundManager(): void {
  soundManagerInstance = null;
}

/**
 * Helper to get brick hit frequency based on durability level
 */
export function getBrickHitFrequency(durability: number): number {
  switch (durability) {
    case 1: return 200;
    case 2: return 400;
    case 3: return 600;
    default: return 300;
  }
}

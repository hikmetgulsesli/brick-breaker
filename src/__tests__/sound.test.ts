/**
 * Sound System Tests for Retro Brick Breaker
 * Tests for the Web Audio API sound manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getSoundManager, 
  resetSoundManager, 
  getBrickHitFrequency,
  type SoundType 
} from '../utils/sound';

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  state = 'running';
  
  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  
  createGain = vi.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }));
  
  createBuffer = vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(100)),
  }));
  
  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  
  resume = vi.fn().mockResolvedValue(undefined);
}

describe('Sound Manager', () => {
  let mockAudioContext: MockAudioContext;
  
  beforeEach(() => {
    resetSoundManager();
    mockAudioContext = new MockAudioContext();
    
    // Mock global AudioContext
    global.AudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;
    global.webkitAudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const manager1 = getSoundManager();
      const manager2 = getSoundManager();
      expect(manager1).toBe(manager2);
    });
    
    it('should create a new instance after reset', () => {
      const manager1 = getSoundManager();
      resetSoundManager();
      const manager2 = getSoundManager();
      expect(manager1).not.toBe(manager2);
    });
  });

  describe('Volume Control', () => {
    it('should set volume to specified value', () => {
      const manager = getSoundManager();
      manager.setVolume(0.75);
      expect(manager.getVolume()).toBe(0.75);
    });
    
    it('should clamp volume to 0-1 range', () => {
      const manager = getSoundManager();
      manager.setVolume(-0.5);
      expect(manager.getVolume()).toBe(0);
      
      manager.setVolume(1.5);
      expect(manager.getVolume()).toBe(1);
    });
  });

  describe('Mute Functionality', () => {
    it('should toggle mute state', () => {
      const manager = getSoundManager();
      expect(manager.isMuted()).toBe(false);
      
      const result = manager.toggleMute();
      expect(result).toBe(true);
      expect(manager.isMuted()).toBe(true);
      
      const result2 = manager.toggleMute();
      expect(result2).toBe(false);
      expect(manager.isMuted()).toBe(false);
    });
    
    it('should return correct mute state', () => {
      const manager = getSoundManager();
      expect(manager.isMuted()).toBe(false);
      manager.toggleMute();
      expect(manager.isMuted()).toBe(true);
    });
  });

  describe('Sound Playback', () => {
    it('should play paddle hit sound', () => {
      const manager = getSoundManager();
      manager.play('paddleHit');
      
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });
    
    it('should play brick hit sound with pitch option', () => {
      const manager = getSoundManager();
      manager.play('brickHit', { pitch: 400 });
      
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
    
    it('should play power-up collect sound', () => {
      const manager = getSoundManager();
      manager.play('powerUpCollect');
      
      // Power-up plays 4 notes
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
    
    it('should play life lost sound', () => {
      const manager = getSoundManager();
      manager.play('lifeLost');
      
      expect(global.AudioContext).toHaveBeenCalled();
    });
    
    it('should play game over sound', () => {
      const manager = getSoundManager();
      manager.play('gameOver');
      
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
    
    it('should play victory sound', () => {
      const manager = getSoundManager();
      manager.play('victory');
      
      expect(global.AudioContext).toHaveBeenCalled();
    });
    
    it('should play button click sound', () => {
      const manager = getSoundManager();
      manager.play('buttonClick');
      
      expect(global.AudioContext).toHaveBeenCalled();
    });
    
    it('should not play sounds when muted', () => {
      const manager = getSoundManager();
      manager.toggleMute();
      
      const createOscillatorCalls = mockAudioContext.createOscillator.mock.calls.length;
      
      manager.play('paddleHit');
      
      // Should not create new oscillators when muted
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(createOscillatorCalls);
    });
    
    it('should not play sounds when AudioContext is not available', () => {
      // Remove AudioContext
      global.AudioContext = undefined as unknown as typeof AudioContext;
      global.webkitAudioContext = undefined as unknown as typeof AudioContext;
      
      resetSoundManager();
      const manager = getSoundManager();
      
      // Should not throw
      expect(() => manager.play('paddleHit')).not.toThrow();
    });
  });

  describe('Brick Hit Frequencies', () => {
    it('should return 200Hz for durability 1', () => {
      expect(getBrickHitFrequency(1)).toBe(200);
    });
    
    it('should return 400Hz for durability 2', () => {
      expect(getBrickHitFrequency(2)).toBe(400);
    });
    
    it('should return 600Hz for durability 3', () => {
      expect(getBrickHitFrequency(3)).toBe(600);
    });
    
    it('should return 300Hz for unknown durability', () => {
      expect(getBrickHitFrequency(5)).toBe(300);
    });
  });

  describe('Volume Options', () => {
    it('should accept volume option for individual sounds', () => {
      const manager = getSoundManager();
      manager.play('paddleHit', { volume: 0.5 });
      
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });
  });
});

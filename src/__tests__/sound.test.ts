/**
 * Sound System Tests for Retro Brick Breaker
 * Tests for the Web Audio API sound manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getSoundManager, 
  resetSoundManager
} from '../utils/sound';

// Mock Web Audio API
const createMockAudioContext = () => {
  const mockOscillator = {
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  const mockGain = {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };

  const mockBuffer = {
    getChannelData: vi.fn(() => new Float32Array(100)),
  };

  const mockBufferSource = {
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  return {
    currentTime: 0,
    state: 'running',
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => ({ 
      ...mockGain,
      gain: { ...mockGain.gain }
    })),
    createBuffer: vi.fn(() => ({ ...mockBuffer })),
    createBufferSource: vi.fn(() => ({ ...mockBufferSource })),
    resume: vi.fn().mockResolvedValue(undefined),
  };
};

describe('Sound Manager', () => {
  beforeEach(() => {
    resetSoundManager();
    
    // Mock window object for Node.js test environment
    (global as unknown as { window: typeof window }).window = globalThis as unknown as typeof window;
    
    // Mock global AudioContext
    (global as unknown as { AudioContext: typeof AudioContext }).AudioContext = vi.fn(() => createMockAudioContext()) as unknown as typeof AudioContext;
    (global as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext = vi.fn(() => createMockAudioContext()) as unknown as typeof AudioContext;
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
    it('should not throw when playing sounds', () => {
      const manager = getSoundManager();
      
      // Should not throw
      expect(() => manager.play('paddleHit')).not.toThrow();
      expect(() => manager.play('brickHit', { pitch: 400 })).not.toThrow();
      expect(() => manager.play('powerUpCollect')).not.toThrow();
      expect(() => manager.play('lifeLost')).not.toThrow();
      expect(() => manager.play('gameOver')).not.toThrow();
      expect(() => manager.play('victory')).not.toThrow();
      expect(() => manager.play('buttonClick')).not.toThrow();
    });
    
    it('should not play sounds when muted', () => {
      const manager = getSoundManager();
      manager.toggleMute();
      
      // Should not throw when muted
      expect(() => manager.play('paddleHit')).not.toThrow();
    });
    
    it('should not play sounds when AudioContext is not available', () => {
      // Remove AudioContext
      (global as unknown as { AudioContext?: typeof AudioContext }).AudioContext = undefined;
      (global as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = undefined;
      
      resetSoundManager();
      const manager = getSoundManager();
      
      // Should not throw
      expect(() => manager.play('paddleHit')).not.toThrow();
    });
  });

  describe('Brick Hit Frequencies', () => {
    it('should return 200Hz for durability 1', async () => {
      const { getBrickHitFrequency } = await import('../utils/sound');
      expect(getBrickHitFrequency(1)).toBe(200);
    });
    
    it('should return 400Hz for durability 2', async () => {
      const { getBrickHitFrequency } = await import('../utils/sound');
      expect(getBrickHitFrequency(2)).toBe(400);
    });
    
    it('should return 600Hz for durability 3', async () => {
      const { getBrickHitFrequency } = await import('../utils/sound');
      expect(getBrickHitFrequency(3)).toBe(600);
    });
    
    it('should return 300Hz for unknown durability', async () => {
      const { getBrickHitFrequency } = await import('../utils/sound');
      expect(getBrickHitFrequency(5)).toBe(300);
    });
  });
});

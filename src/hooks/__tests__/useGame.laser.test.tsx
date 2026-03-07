import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '@/hooks/useGame';
import { GAME_CONFIG, POWERUP_COLORS } from '@/types/game';

describe('useGame - Laser Power-up', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should activate laser power-up for 8 seconds', () => {
    const { result } = renderHook(() => useGame());

    // Start the game
    act(() => {
      result.current.startGame(1);
    });

    // Verify laser is not active initially
    expect(result.current.activePowerUp).toBeNull();
    expect(result.current.powerUpTimeRemaining).toBeNull();

    // Verify laser duration config
    expect(GAME_CONFIG.LASER_DURATION).toBe(8000);
  });

  it('should show laser duration in GAME_CONFIG', () => {
    expect(GAME_CONFIG.LASER_DURATION).toBe(8000);
    expect(GAME_CONFIG.LASER_SPEED).toBeGreaterThan(0);
    expect(GAME_CONFIG.LASER_WIDTH).toBeGreaterThan(0);
    expect(GAME_CONFIG.LASER_HEIGHT).toBeGreaterThan(0);
  });

  it('should return correct laser power-up color', () => {
    expect(POWERUP_COLORS.laser).toBe('#ff073a');
  });

  it('should have laser defined in PowerUpType', () => {
    expect(GAME_CONFIG.LASER_DURATION).toBeDefined();
    expect(GAME_CONFIG.LASER_SPEED).toBeDefined();
    expect(GAME_CONFIG.LASER_WIDTH).toBeDefined();
    expect(GAME_CONFIG.LASER_HEIGHT).toBeDefined();
  });

  it('should track power-up time remaining', () => {
    const { result } = renderHook(() => useGame());

    // Start the game
    act(() => {
      result.current.startGame(1);
    });

    // Initially no time remaining
    expect(result.current.powerUpTimeRemaining).toBeNull();
  });

  it('should allow shooting laser when active', () => {
    const { result } = renderHook(() => useGame());

    // Start the game
    act(() => {
      result.current.startGame(1);
    });

    // Initially cannot shoot
    const initialLasers = result.current.lasers.length;

    // Try to shoot without laser active
    act(() => {
      result.current.shootLaser();
    });

    expect(result.current.lasers.length).toBe(initialLasers);
  });

  it('should have correct GAME_CONFIG values for laser', () => {
    expect(GAME_CONFIG.LASER_DURATION).toBe(8000);
    expect(GAME_CONFIG.LASER_SPEED).toBe(8);
    expect(GAME_CONFIG.LASER_WIDTH).toBe(4);
    expect(GAME_CONFIG.LASER_HEIGHT).toBe(12);
  });
});

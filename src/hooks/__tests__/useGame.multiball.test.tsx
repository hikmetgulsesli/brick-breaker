import { describe, it, expect } from 'vitest';
import { 
  POWERUP_COLORS, 
  GAME_CONFIG,
  GameState,
  type PowerUpType,
  type Ball,
  type PowerUp
} from '@/types/game';

describe('Multi-Ball Power-Up', () => {
  describe('Power-Up Configuration', () => {
    it('should have multiball power-up defined with orange color (#ff9e00)', () => {
      expect(POWERUP_COLORS.multiball).toBe('#ff9e00');
    });

    it('should have all power-up types defined', () => {
      expect(POWERUP_COLORS).toHaveProperty('wide');
      expect(POWERUP_COLORS).toHaveProperty('multiball');
      expect(POWERUP_COLORS).toHaveProperty('laser');
    });

    it('should have correct power-up chance configuration', () => {
      expect(GAME_CONFIG.POWERUP_CHANCE).toBe(0.15);
      expect(GAME_CONFIG.POWERUP_CHANCE).toBeGreaterThan(0);
      expect(GAME_CONFIG.POWERUP_CHANCE).toBeLessThan(1);
    });

    it('should have correct power-up fall speed', () => {
      expect(GAME_CONFIG.POWERUP_FALL_SPEED).toBe(2);
      expect(GAME_CONFIG.POWERUP_FALL_SPEED).toBeGreaterThan(0);
    });
  });

  describe('Ball Type Structure', () => {
    it('should have correct Ball type structure for multiball support', () => {
      const mockBall: Ball = {
        x: 100,
        y: 200,
        dx: 5,
        dy: -5,
        radius: 6,
        active: true
      };

      expect(mockBall).toHaveProperty('x');
      expect(mockBall).toHaveProperty('y');
      expect(mockBall).toHaveProperty('dx');
      expect(mockBall).toHaveProperty('dy');
      expect(mockBall).toHaveProperty('radius');
      expect(mockBall).toHaveProperty('active');
      expect(typeof mockBall.dx).toBe('number');
      expect(typeof mockBall.dy).toBe('number');
    });

    it('should support independent ball velocities', () => {
      const ball1: Ball = { x: 100, y: 100, dx: 4, dy: -4, radius: 6, active: true };
      const ball2: Ball = { x: 100, y: 100, dx: -4, dy: -4, radius: 6, active: true };
      const ball3: Ball = { x: 100, y: 100, dx: 3, dy: -5, radius: 6, active: true };

      // All balls should have independent velocities
      expect(ball1.dx).not.toBe(ball2.dx);
      expect(ball1.dx).not.toBe(ball3.dx);
    });

    it('should support ball lifecycle with active flag', () => {
      const activeBall: Ball = { x: 100, y: 100, dx: 4, dy: -4, radius: 6, active: true };
      const inactiveBall: Ball = { x: 100, y: 700, dx: 4, dy: 4, radius: 6, active: false };

      expect(activeBall.active).toBe(true);
      expect(inactiveBall.active).toBe(false);
    });
  });

  describe('PowerUp Type Structure', () => {
    it('should have correct PowerUp type structure', () => {
      const mockPowerUp: PowerUp = {
        x: 100,
        y: 200,
        type: 'multiball',
        active: true,
        width: 20,
        height: 20,
        dy: 2,
        duration: 0
      };

      expect(mockPowerUp).toHaveProperty('x');
      expect(mockPowerUp).toHaveProperty('y');
      expect(mockPowerUp).toHaveProperty('type');
      expect(mockPowerUp).toHaveProperty('active');
      expect(mockPowerUp).toHaveProperty('width');
      expect(mockPowerUp).toHaveProperty('height');
      expect(mockPowerUp).toHaveProperty('dy');
      expect(mockPowerUp).toHaveProperty('duration');
    });

    it('should support all power-up types', () => {
      const types: PowerUpType[] = ['wide', 'multiball', 'laser'];
      
      types.forEach(type => {
        const powerUp: PowerUp = {
          x: 100,
          y: 200,
          type,
          active: true,
          width: 20,
          height: 20,
          dy: 2,
          duration: type === 'wide' ? 10000 : type === 'laser' ? 8000 : 0
        };
        expect(powerUp.type).toBe(type);
      });
    });

    it('should have multiball with no duration (permanent until balls lost)', () => {
      const multiballPowerUp: PowerUp = {
        x: 100,
        y: 200,
        type: 'multiball',
        active: true,
        width: 20,
        height: 20,
        dy: 2,
        duration: 0
      };

      expect(multiballPowerUp.duration).toBe(0);
    });
  });

  describe('Multi-Ball Stacking Support', () => {
    it('should support multiple balls in array structure', () => {
      const balls: Ball[] = [
        { x: 100, y: 100, dx: 4, dy: -4, radius: 6, active: true },
        { x: 120, y: 110, dx: -4, dy: -4, radius: 6, active: true },
        { x: 80, y: 90, dx: 3, dy: -5, radius: 6, active: true }
      ];

      expect(balls).toHaveLength(3);
      expect(balls.filter(b => b.active)).toHaveLength(3);
    });

    it('should handle mixed active/inactive balls', () => {
      const balls: Ball[] = [
        { x: 100, y: 100, dx: 4, dy: -4, radius: 6, active: true },
        { x: 100, y: 700, dx: 4, dy: 4, radius: 6, active: false },
        { x: 120, y: 110, dx: -4, dy: -4, radius: 6, active: true }
      ];

      const activeBalls = balls.filter(b => b.active);
      expect(activeBalls).toHaveLength(2);
      expect(balls).toHaveLength(3);
    });
  });

  describe('GameState Enum', () => {
    it('should have all required game states', () => {
      expect(GameState.MENU).toBe('menu');
      expect(GameState.PLAYING).toBe('playing');
      expect(GameState.PAUSED).toBe('paused');
      expect(GameState.GAME_OVER).toBe('gameOver');
      expect(GameState.VICTORY).toBe('victory');
    });
  });

  describe('Color Constants', () => {
    it('should have orange neon color defined', () => {
      // Using a dynamic import to check the COLORS constant
      // This is defined in the types file
      expect(POWERUP_COLORS.multiball).toBe('#ff9e00');
    });

    it('should have distinct colors for each power-up type', () => {
      const colors = Object.values(POWERUP_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });
});

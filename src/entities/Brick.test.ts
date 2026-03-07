/**
 * Tests for Brick entity
 */

import Brick, { 
  BrickConfig,
  BRICK_COLORS,
  BRICK_SCORES,
  DEFAULT_BRICK_CONFIG 
} from './Brick';

describe('Brick Entity', () => {
  describe('Construction', () => {
    it('should create a brick with default durability 1', () => {
      const brick = new Brick(100, 50, 1);
      const state = brick.getState();
      
      expect(state.x).toBe(100);
      expect(state.y).toBe(50);
      expect(state.durability).toBe(1);
      expect(state.isActive).toBe(true);
      expect(state.scoreValue).toBe(10);
    });

    it('should create a brick with durability 2', () => {
      const brick = new Brick(100, 50, 2);
      const state = brick.getState();
      
      expect(state.durability).toBe(2);
      expect(state.scoreValue).toBe(20);
    });

    it('should create a brick with durability 3', () => {
      const brick = new Brick(100, 50, 3);
      const state = brick.getState();
      
      expect(state.durability).toBe(3);
      expect(state.scoreValue).toBe(30);
    });

    it('should accept custom config', () => {
      const customConfig: Partial<BrickConfig> = {
        width: 80,
        height: 30,
        glowBlur: 20,
      };
      
      const brick = new Brick(100, 50, 1, customConfig);
      const config = brick.getConfig();
      
      expect(config.width).toBe(80);
      expect(config.height).toBe(30);
      expect(config.glowBlur).toBe(20);
    });

    it('should merge custom config with defaults', () => {
      const customConfig: Partial<BrickConfig> = {
        width: 80,
      };
      
      const brick = new Brick(100, 50, 1, customConfig);
      const config = brick.getConfig();
      
      expect(config.width).toBe(80);
      expect(config.height).toBe(DEFAULT_BRICK_CONFIG.height);
      expect(config.padding).toBe(DEFAULT_BRICK_CONFIG.padding);
    });
  });

  describe('State Management', () => {
    it('should return immutable state copy', () => {
      const brick = new Brick(100, 50, 1);
      const state1 = brick.getState();
      const state2 = brick.getState();
      
      expect(state1).not.toBe(state2); // Different references
      expect(state1).toEqual(state2);  // Same values
    });

    it('should report active status correctly', () => {
      const brick = new Brick(100, 50, 1);
      
      expect(brick.isActive()).toBe(true);
      
      brick.hit();
      
      expect(brick.isActive()).toBe(false);
    });

    it('should get current durability', () => {
      const brick = new Brick(100, 50, 3);
      
      expect(brick.getDurability()).toBe(3);
      
      brick.hit();
      expect(brick.getDurability()).toBe(2);
      
      brick.hit();
      expect(brick.getDurability()).toBe(1);
    });

    it('should return initial durability', () => {
      const brick = new Brick(100, 50, 3);
      
      brick.hit();
      brick.hit();
      
      expect(brick.getDurability()).toBe(1);
      expect(brick.getInitialDurability()).toBe(3);
    });
  });

  describe('Color Coding', () => {
    it('should return correct colors for durability 1 (green)', () => {
      const brick = new Brick(100, 50, 1);
      const colors = brick.getColors();
      
      expect(colors.fill).toBe(BRICK_COLORS[1].fill);
      expect(colors.glow).toBe(BRICK_COLORS[1].glow);
      expect(colors.border).toBe(BRICK_COLORS[1].border);
    });

    it('should return correct colors for durability 2 (orange)', () => {
      const brick = new Brick(100, 50, 2);
      const colors = brick.getColors();
      
      expect(colors.fill).toBe(BRICK_COLORS[2].fill);
      expect(colors.glow).toBe(BRICK_COLORS[2].glow);
      expect(colors.border).toBe(BRICK_COLORS[2].border);
    });

    it('should return correct colors for durability 3 (red/pink)', () => {
      const brick = new Brick(100, 50, 3);
      const colors = brick.getColors();
      
      expect(colors.fill).toBe(BRICK_COLORS[3].fill);
      expect(colors.glow).toBe(BRICK_COLORS[3].glow);
      expect(colors.border).toBe(BRICK_COLORS[3].border);
    });

    it('should update colors after hit reduces durability', () => {
      const brick = new Brick(100, 50, 2);
      
      const colorsBefore = brick.getColors();
      expect(colorsBefore.fill).toBe(BRICK_COLORS[2].fill);
      
      brick.hit();
      
      const colorsAfter = brick.getColors();
      expect(colorsAfter.fill).toBe(BRICK_COLORS[1].fill);
    });
  });

  describe('Score Values', () => {
    it('should have correct score for durability 1', () => {
      const brick = new Brick(100, 50, 1);
      
      expect(brick.getScoreValue()).toBe(10);
      expect(BRICK_SCORES[1]).toBe(10);
    });

    it('should have correct score for durability 2', () => {
      const brick = new Brick(100, 50, 2);
      
      expect(brick.getScoreValue()).toBe(20);
      expect(BRICK_SCORES[2]).toBe(20);
    });

    it('should have correct score for durability 3', () => {
      const brick = new Brick(100, 50, 3);
      
      expect(brick.getScoreValue()).toBe(30);
      expect(BRICK_SCORES[3]).toBe(30);
    });
  });

  describe('Hit Mechanics', () => {
    it('should reduce durability on hit', () => {
      const brick = new Brick(100, 50, 2);
      
      expect(brick.getDurability()).toBe(2);
      
      const result = brick.hit();
      
      expect(brick.getDurability()).toBe(1);
      expect(result.destroyed).toBe(false);
      expect(result.remainingDurability).toBe(1);
    });

    it('should destroy brick when durability reaches 0', () => {
      const brick = new Brick(100, 50, 1);
      
      const result = brick.hit();
      
      expect(result.destroyed).toBe(true);
      expect(result.remainingDurability).toBe(0);
      expect(brick.isActive()).toBe(false);
    });

    it('should award points only when destroyed', () => {
      const brick = new Brick(100, 50, 2);
      
      const result1 = brick.hit();
      expect(result1.points).toBe(0); // Not destroyed yet
      
      const result2 = brick.hit();
      expect(result2.points).toBe(20); // Destroyed now
    });

    it('should not respond to hits when inactive', () => {
      const brick = new Brick(100, 50, 1);
      
      brick.hit(); // Destroy it
      
      const result = brick.hit(); // Hit again
      
      expect(result.destroyed).toBe(false);
      expect(result.points).toBe(0);
      expect(result.remainingDurability).toBe(0);
    });

    it('should handle multiple hits for durability 3', () => {
      const brick = new Brick(100, 50, 3);
      
      const hit1 = brick.hit();
      expect(hit1.destroyed).toBe(false);
      expect(hit1.remainingDurability).toBe(2);
      
      const hit2 = brick.hit();
      expect(hit2.destroyed).toBe(false);
      expect(hit2.remainingDurability).toBe(1);
      
      const hit3 = brick.hit();
      expect(hit3.destroyed).toBe(true);
      expect(hit3.remainingDurability).toBe(0);
      expect(hit3.points).toBe(30);
    });
  });

  describe('Reset', () => {
    it('should reset to initial durability', () => {
      const brick = new Brick(100, 50, 3);
      
      brick.hit();
      brick.hit();
      
      expect(brick.getDurability()).toBe(1);
      
      brick.reset();
      
      expect(brick.getDurability()).toBe(3);
      expect(brick.isActive()).toBe(true);
    });

    it('should reset destroyed brick', () => {
      const brick = new Brick(100, 50, 1);
      
      brick.hit();
      expect(brick.isActive()).toBe(false);
      
      brick.reset();
      
      expect(brick.isActive()).toBe(true);
      expect(brick.getDurability()).toBe(1);
    });
  });

  describe('Destroy', () => {
    it('should destroy brick immediately and return points', () => {
      const brick = new Brick(100, 50, 2);
      
      const points = brick.destroy();
      
      expect(points).toBe(20);
      expect(brick.isActive()).toBe(false);
      expect(brick.getDurability()).toBe(0);
    });

    it('should return 0 for already destroyed brick', () => {
      const brick = new Brick(100, 50, 1);
      
      brick.destroy();
      const points = brick.destroy();
      
      expect(points).toBe(0);
    });
  });

  describe('Collision Detection', () => {
    it('should return correct bounding box', () => {
      const brick = new Brick(100, 50, 1);
      const bbox = brick.getBoundingBox();
      
      expect(bbox.left).toBe(100);
      expect(bbox.top).toBe(50);
      expect(bbox.right).toBe(160); // 100 + 60 (default width)
      expect(bbox.bottom).toBe(70); // 50 + 20 (default height)
    });

    it('should detect point inside brick', () => {
      const brick = new Brick(100, 50, 1);
      
      expect(brick.containsPoint(120, 60)).toBe(true);
    });

    it('should not detect point outside brick', () => {
      const brick = new Brick(100, 50, 1);
      
      expect(brick.containsPoint(50, 60)).toBe(false);
      expect(brick.containsPoint(200, 60)).toBe(false);
      expect(brick.containsPoint(120, 30)).toBe(false);
      expect(brick.containsPoint(120, 100)).toBe(false);
    });

    it('should detect point on edge as inside', () => {
      const brick = new Brick(100, 50, 1);
      
      expect(brick.containsPoint(100, 60)).toBe(true); // Left edge
      expect(brick.containsPoint(160, 60)).toBe(true); // Right edge
      expect(brick.containsPoint(120, 50)).toBe(true); // Top edge
      expect(brick.containsPoint(120, 70)).toBe(true); // Bottom edge
    });
  });

  describe('Dimension Updates', () => {
    it('should update dimensions with scale factors', () => {
      const brick = new Brick(100, 50, 1);
      
      brick.updateDimensions(80, 25, 2, 1.5);
      
      const state = brick.getState();
      expect(state.x).toBe(200); // 100 * 2
      expect(state.y).toBe(75);  // 50 * 1.5
      expect(state.width).toBe(80);
      expect(state.height).toBe(25);
    });
  });

  describe('Color Constants', () => {
    it('should have distinct colors for each durability level', () => {
      const colors1 = BRICK_COLORS[1];
      const colors2 = BRICK_COLORS[2];
      const colors3 = BRICK_COLORS[3];
      
      expect(colors1.fill).not.toBe(colors2.fill);
      expect(colors2.fill).not.toBe(colors3.fill);
      expect(colors1.fill).not.toBe(colors3.fill);
    });

    it('should have correct color values for retro neon palette', () => {
      // Green for durability 1
      expect(BRICK_COLORS[1].fill).toMatch(/^#[0-9a-f]{6}$/i);
      // Orange for durability 2
      expect(BRICK_COLORS[2].fill).toMatch(/^#[0-9a-f]{6}$/i);
      // Red/Pink for durability 3
      expect(BRICK_COLORS[3].fill).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('Score Constants', () => {
    it('should have correct score progression', () => {
      expect(BRICK_SCORES[1]).toBe(10);
      expect(BRICK_SCORES[2]).toBe(20);
      expect(BRICK_SCORES[3]).toBe(30);
    });

    it('should have scores that scale with durability', () => {
      expect(BRICK_SCORES[2]).toBe(BRICK_SCORES[1] * 2);
      expect(BRICK_SCORES[3]).toBe(BRICK_SCORES[1] * 3);
    });
  });
});

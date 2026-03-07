/**
 * Tests for Level definitions
 */

import {
  LEVELS,
  calculateBrickPositions,
  createBricksForLevel,
  getLevelConfig,
  getTotalLevels,
  isValidLevel,
  LevelPattern,
} from './levels';
import { DEFAULT_BRICK_CONFIG } from './Brick';

describe('Level System', () => {
  describe('Level Configuration', () => {
    it('should have 3 levels', () => {
      expect(getTotalLevels()).toBe(3);
      expect(LEVELS.length).toBe(3);
    });

    it('should have level 1 named Classic', () => {
      const config = getLevelConfig(1);
      expect(config.name).toBe('Classic');
      expect(config.levelNumber).toBe(1);
    });

    it('should have level 2 named Pyramid', () => {
      const config = getLevelConfig(2);
      expect(config.name).toBe('Pyramid');
      expect(config.levelNumber).toBe(2);
    });

    it('should have level 3 named Challenge', () => {
      const config = getLevelConfig(3);
      expect(config.name).toBe('Challenge');
      expect(config.levelNumber).toBe(3);
    });

    it('should throw error for invalid level', () => {
      expect(() => getLevelConfig(0)).toThrow();
      expect(() => getLevelConfig(4)).toThrow();
      expect(() => getLevelConfig(99)).toThrow();
    });
  });

  describe('Level Validation', () => {
    it('should validate level numbers correctly', () => {
      expect(isValidLevel(1)).toBe(true);
      expect(isValidLevel(2)).toBe(true);
      expect(isValidLevel(3)).toBe(true);
      expect(isValidLevel(0)).toBe(false);
      expect(isValidLevel(4)).toBe(false);
      expect(isValidLevel(-1)).toBe(false);
    });
  });

  describe('Level 1: Classic Pattern', () => {
    it('should have 6 rows', () => {
      const config = getLevelConfig(1);
      expect(config.pattern.rows).toBe(6);
      expect(config.pattern.grid.length).toBe(6);
    });

    it('should have 10 columns', () => {
      const config = getLevelConfig(1);
      expect(config.pattern.cols).toBe(10);
      config.pattern.grid.forEach(row => {
        expect(row.length).toBe(10);
      });
    });

    it('should have no empty spaces (all bricks)', () => {
      const config = getLevelConfig(1);
      config.pattern.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBeGreaterThan(0);
        });
      });
    });

    it('should generate 60 brick positions', () => {
      const config = getLevelConfig(1);
      const positions = calculateBrickPositions(800, 600, config.pattern);
      expect(positions.length).toBe(60);
    });
  });

  describe('Level 2: Pyramid Pattern', () => {
    it('should have 7 rows', () => {
      const config = getLevelConfig(2);
      expect(config.pattern.rows).toBe(7);
      expect(config.pattern.grid.length).toBe(7);
    });

    it('should have 11 columns', () => {
      const config = getLevelConfig(2);
      expect(config.pattern.cols).toBe(11);
      config.pattern.grid.forEach(row => {
        expect(row.length).toBe(11);
      });
    });

    it('should have pyramid shape (increasing brick count)', () => {
      const config = getLevelConfig(2);
      let previousCount = 0;
      
      config.pattern.grid.forEach(row => {
        const brickCount = row.filter(d => d > 0).length;
        expect(brickCount).toBeGreaterThanOrEqual(previousCount);
        previousCount = brickCount;
      });
    });

    it('should have fewer bricks than level 1', () => {
      const level1Config = getLevelConfig(1);
      const level2Config = getLevelConfig(2);
      
      const level1Positions = calculateBrickPositions(800, 600, level1Config.pattern);
      const level2Positions = calculateBrickPositions(800, 600, level2Config.pattern);
      
      expect(level2Positions.length).toBeLessThan(level1Positions.length);
    });
  });

  describe('Level 3: Challenge Pattern', () => {
    it('should have 8 rows', () => {
      const config = getLevelConfig(3);
      expect(config.pattern.rows).toBe(8);
      expect(config.pattern.grid.length).toBe(8);
    });

    it('should have 10 columns', () => {
      const config = getLevelConfig(3);
      expect(config.pattern.cols).toBe(10);
      config.pattern.grid.forEach(row => {
        expect(row.length).toBe(10);
      });
    });

    it('should have gaps (0 values)', () => {
      const config = getLevelConfig(3);
      let hasGaps = false;
      
      config.pattern.grid.forEach(row => {
        if (row.includes(0)) {
          hasGaps = true;
        }
      });
      
      expect(hasGaps).toBe(true);
    });

    it('should have 3-hit bricks', () => {
      const config = getLevelConfig(3);
      let has3HitBricks = false;
      
      config.pattern.grid.forEach(row => {
        if (row.includes(3)) {
          has3HitBricks = true;
        }
      });
      
      expect(has3HitBricks).toBe(true);
    });

    it('should use custom brick config with smaller width', () => {
      const config = getLevelConfig(3);
      expect(config.brickConfig).toBeDefined();
      expect(config.brickConfig?.width).toBe(55);
    });
  });

  describe('Brick Position Calculation', () => {
    it('should center bricks horizontally', () => {
      const config = getLevelConfig(1);
      const canvasWidth = 800;
      const positions = calculateBrickPositions(canvasWidth, 600, config.pattern);
      
      // First brick should be centered
      const totalWidth = 10 * DEFAULT_BRICK_CONFIG.width + 9 * DEFAULT_BRICK_CONFIG.padding;
      const expectedStartX = (canvasWidth - totalWidth) / 2;
      
      expect(positions[0].x).toBe(expectedStartX);
    });

    it('should start bricks at correct Y position', () => {
      const config = getLevelConfig(1);
      const positions = calculateBrickPositions(800, 600, config.pattern);
      
      // First row should start at y = 60
      const firstRowPositions = positions.filter((_, index) => index < 10);
      firstRowPositions.forEach(pos => {
        expect(pos.y).toBe(60);
      });
    });

    it('should increment Y position for each row', () => {
      const config = getLevelConfig(1);
      const positions = calculateBrickPositions(800, 600, config.pattern);
      
      // Row height + padding
      const rowHeight = DEFAULT_BRICK_CONFIG.height + DEFAULT_BRICK_CONFIG.padding;
      
      // Check first brick of each row
      expect(positions[0].y).toBe(60); // Row 0
      expect(positions[10].y).toBe(60 + rowHeight); // Row 1
      expect(positions[20].y).toBe(60 + rowHeight * 2); // Row 2
    });

    it('should handle empty cells (0 durability) correctly', () => {
      const pattern: LevelPattern = {
        rows: 2,
        cols: 3,
        grid: [
          [1, 0, 1],
          [0, 2, 0],
        ],
      };
      
      const positions = calculateBrickPositions(800, 600, pattern);
      
      // Should only have 2 positions (skipping 0s)
      expect(positions.length).toBe(2);
      
      // Both should be durability 1 and 2
      expect(positions[0].durability).toBe(1);
      expect(positions[1].durability).toBe(2);
    });
  });

  describe('Create Bricks For Level', () => {
    it('should create bricks for level 1', () => {
      const bricks = createBricksForLevel(1, 800, 600);
      expect(bricks.length).toBe(60);
    });

    it('should create bricks for level 2', () => {
      const bricks = createBricksForLevel(2, 800, 600);
      // Should have fewer than level 1 due to pyramid shape
      expect(bricks.length).toBeGreaterThan(0);
      expect(bricks.length).toBeLessThan(60);
    });

    it('should create bricks for level 3', () => {
      const bricks = createBricksForLevel(3, 800, 600);
      // Should have gaps, so fewer than 80 (8x10)
      expect(bricks.length).toBeGreaterThan(0);
      expect(bricks.length).toBeLessThan(80);
    });

    it('should throw error for invalid level', () => {
      expect(() => createBricksForLevel(0, 800, 600)).toThrow();
      expect(() => createBricksForLevel(99, 800, 600)).toThrow();
    });

    it('should create active bricks', () => {
      const bricks = createBricksForLevel(1, 800, 600);
      
      bricks.forEach(brick => {
        expect(brick.isActive()).toBe(true);
      });
    });
  });

  describe('Level Patterns', () => {
    it('should only use valid durability values (0, 1, 2, 3)', () => {
      LEVELS.forEach(level => {
        level.pattern.grid.forEach(row => {
          row.forEach(cell => {
            expect([0, 1, 2, 3]).toContain(cell);
          });
        });
      });
    });

    it('should have consistent column counts in each row', () => {
      LEVELS.forEach(level => {
        const expectedCols = level.pattern.cols;
        level.pattern.grid.forEach(row => {
          expect(row.length).toBe(expectedCols);
        });
      });
    });

    it('should have row count matching grid length', () => {
      LEVELS.forEach(level => {
        expect(level.pattern.grid.length).toBe(level.pattern.rows);
      });
    });
  });

  describe('Brick Durability Distribution', () => {
    it('level 1 should have mostly 1-hit and 2-hit bricks', () => {
      const config = getLevelConfig(1);
      let has1Hit = false;
      let has2Hit = false;
      
      config.pattern.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === 1) has1Hit = true;
          if (cell === 2) has2Hit = true;
        });
      });
      
      expect(has1Hit).toBe(true);
      expect(has2Hit).toBe(true);
    });

    it('level 3 should have all durability levels', () => {
      const config = getLevelConfig(3);
      let has1Hit = false;
      let has2Hit = false;
      let has3Hit = false;
      
      config.pattern.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === 1) has1Hit = true;
          if (cell === 2) has2Hit = true;
          if (cell === 3) has3Hit = true;
        });
      });
      
      expect(has1Hit).toBe(true);
      expect(has2Hit).toBe(true);
      expect(has3Hit).toBe(true);
    });
  });
});

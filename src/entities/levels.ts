/**
 * Level definitions for the brick breaker game
 * Contains patterns and brick arrangements for each level
 */

import Brick, { BrickDurability, BrickConfig, DEFAULT_BRICK_CONFIG } from './Brick';

export interface LevelPattern {
  /** Grid position (row, col) to durability mapping */
  grid: (BrickDurability | 0)[][];
  /** Number of rows in the pattern */
  rows: number;
  /** Number of columns in the pattern */
  cols: number;
}

export interface LevelConfig {
  /** Level number (1-indexed) */
  levelNumber: number;
  /** Level name */
  name: string;
  /** Brick pattern for this level */
  pattern: LevelPattern;
  /** Brick configuration (optional overrides) */
  brickConfig?: Partial<BrickConfig>;
  /** Starting Y position for bricks */
  startY: number;
}

// Calculate brick positions based on canvas width
export function calculateBrickPositions(
  canvasWidth: number,
  canvasHeight: number,
  pattern: LevelPattern,
  brickConfig: BrickConfig = DEFAULT_BRICK_CONFIG
): Array<{ x: number; y: number; durability: BrickDurability }> {
  const { grid, cols } = pattern;
  const totalBrickWidth = cols * brickConfig.width + (cols - 1) * brickConfig.padding;
  const startX = (canvasWidth - totalBrickWidth) / 2;

  const positions: Array<{ x: number; y: number; durability: BrickDurability }> = [];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const durability = grid[row][col];
      if (durability > 0) {
        positions.push({
          x: startX + col * (brickConfig.width + brickConfig.padding),
          y: 60 + row * (brickConfig.height + brickConfig.padding), // Start 60px from top
          durability: durability as BrickDurability,
        });
      }
    }
  }

  return positions;
}

// Level 1: Classic (6 rows x 10 columns rectangular)
// Pattern: alternating durability rows
const LEVEL1_PATTERN: LevelPattern = {
  rows: 6,
  cols: 10,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 0: All 1-hit (green)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 1: All 1-hit (green)
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],  // Row 2: All 2-hit (orange)
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],  // Row 3: All 2-hit (orange)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 4: All 1-hit (green)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 5: All 1-hit (green)
  ],
};

// Level 2: Pyramid shape
// Creates a triangular/pyramid pattern
const LEVEL2_PATTERN: LevelPattern = {
  rows: 7,
  cols: 11,
  grid: [
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],  // Row 0: Single 2-hit at center
    [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],  // Row 1: 3 bricks
    [0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0],  // Row 2: 5 bricks
    [0, 0, 1, 1, 1, 2, 1, 1, 1, 0, 0],  // Row 3: 7 bricks
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 4: 9 bricks
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 5: 11 bricks
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],  // Row 6: Full row of 2-hit
  ],
};

// Level 3: Complex pattern with gaps and 3-hit bricks
// More challenging arrangement with mixed durabilities
const LEVEL3_PATTERN: LevelPattern = {
  rows: 8,
  cols: 10,
  grid: [
    [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],  // Row 0: Gaps with 3-hit bricks
    [0, 2, 2, 2, 0, 0, 2, 2, 2, 0],  // Row 1: Groups of 2-hit with gaps
    [2, 2, 0, 2, 2, 2, 2, 0, 2, 2],  // Row 2: Scattered 2-hit
    [1, 1, 2, 2, 1, 1, 2, 2, 1, 1],  // Row 3: Alternating 1 and 2 hit
    [1, 1, 1, 3, 1, 1, 3, 1, 1, 1],  // Row 4: Mostly 1-hit with some 3-hit
    [0, 1, 1, 1, 3, 3, 1, 1, 1, 0],  // Row 5: Center 3-hit with 1-hit around
    [0, 0, 2, 2, 2, 2, 2, 2, 0, 0],  // Row 6: Center block of 2-hit
    [0, 0, 0, 3, 3, 3, 3, 0, 0, 0],  // Row 7: Center 4x 3-hit bricks
  ],
};

// Level configurations
export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Classic',
    pattern: LEVEL1_PATTERN,
    startY: 60,
  },
  {
    levelNumber: 2,
    name: 'Pyramid',
    pattern: LEVEL2_PATTERN,
    startY: 60,
  },
  {
    levelNumber: 3,
    name: 'Challenge',
    pattern: LEVEL3_PATTERN,
    startY: 60,
    brickConfig: {
      ...DEFAULT_BRICK_CONFIG,
      // Slightly smaller bricks for level 3 to fit pattern
      width: 55,
    },
  },
];

/**
 * Create bricks for a specific level
 */
export function createBricksForLevel(
  levelNumber: number,
  canvasWidth: number,
  canvasHeight: number
): Brick[] {
  const levelConfig = LEVELS.find(l => l.levelNumber === levelNumber);
  
  if (!levelConfig) {
    throw new Error(`Level ${levelNumber} not found`);
  }

  const brickConfig = { ...DEFAULT_BRICK_CONFIG, ...levelConfig.brickConfig };
  const positions = calculateBrickPositions(
    canvasWidth,
    canvasHeight,
    levelConfig.pattern,
    brickConfig
  );

  return positions.map(pos => 
    new Brick(pos.x, pos.y, pos.durability, brickConfig)
  );
}

/**
 * Get level configuration by number
 */
export function getLevelConfig(levelNumber: number): LevelConfig {
  const config = LEVELS.find(l => l.levelNumber === levelNumber);
  if (!config) {
    throw new Error(`Level ${levelNumber} not found`);
  }
  return config;
}

/**
 * Get total number of levels
 */
export function getTotalLevels(): number {
  return LEVELS.length;
}

/**
 * Check if a level number is valid
 */
export function isValidLevel(levelNumber: number): boolean {
  return levelNumber >= 1 && levelNumber <= LEVELS.length;
}

const LevelsModule = {
  LEVELS,
  calculateBrickPositions,
  createBricksForLevel,
  getLevelConfig,
  getTotalLevels,
  isValidLevel,
};

export default LevelsModule;

/**
 * Level configurations for Brick Breaker
 */

/** Grid cell value: 0 = empty, 1-3 = brick durability */
export type GridCell = 0 | 1 | 2 | 3;

/** Level pattern definition */
export interface LevelPattern {
  rows: number;
  cols: number;
  grid: GridCell[][];
}

/** Level configuration */
export interface LevelConfig {
  levelNumber: number;
  name: string;
  pattern: LevelPattern;
}

/** Level 1: Classic - Simple rows */
const level1Pattern: LevelPattern = {
  rows: 5,
  cols: 10,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  ],
};

/** Level 2: Pyramid - Centered triangle shape */
const level2Pattern: LevelPattern = {
  rows: 7,
  cols: 11,
  grid: [
    [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 2, 3, 0, 0, 0, 0],
    [0, 0, 0, 3, 2, 1, 2, 3, 0, 0, 0],
    [0, 0, 3, 2, 1, 1, 1, 2, 3, 0, 0],
    [0, 3, 2, 1, 1, 1, 1, 1, 2, 3, 0],
    [3, 2, 1, 1, 1, 1, 1, 1, 1, 2, 3],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  ],
};

/** Level 3: Diamond - Hourglass/diamond pattern */
const level3Pattern: LevelPattern = {
  rows: 8,
  cols: 12,
  grid: [
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
    [0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0],
    [0, 1, 2, 3, 2, 2, 2, 2, 3, 2, 1, 0],
    [0, 1, 2, 3, 2, 2, 2, 2, 3, 2, 1, 0],
    [0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  ],
};

/** All game levels */
export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Classic',
    pattern: level1Pattern,
  },
  {
    levelNumber: 2,
    name: 'Pyramid',
    pattern: level2Pattern,
  },
  {
    levelNumber: 3,
    name: 'Diamond',
    pattern: level3Pattern,
  },
];

/** Get level by number */
export function getLevel(levelNumber: number): LevelConfig | undefined {
  return LEVELS.find(l => l.levelNumber === levelNumber);
}

/** Get total brick count for a level */
export function getBrickCount(level: LevelConfig): number {
  return level.pattern.grid.flat().filter(cell => cell > 0).length;
}

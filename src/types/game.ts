export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';

export interface Position {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  active: boolean;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  level: 1 | 2 | 3;
  active: boolean;
}

export type PowerUpType = 'wide' | 'multiball' | 'laser';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
  width: number;
  height: number;
  dy: number;
}

export interface Laser {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  combo: number;
  comboMultiplier: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  comboBonus: number;
  levelBonus: number;
  livesBonus: number;
  total: number;
}

export interface HighScore {
  score: number;
  date: string;
  level: number;
}

// Color constants for consistent theming
export const COLORS = {
  BG_DARKER: '#050508',
  NEON_CYAN: '#00f5ff',
  NEON_PINK: '#ff00a0',
  NEON_GREEN: '#39ff14',
  NEON_RED: '#ff073a',
  NEON_ORANGE: '#ff9e00',
  NEON_PURPLE: '#bc13fe',
} as const;

export const BRICK_COLORS = {
  1: COLORS.NEON_GREEN,
  2: COLORS.NEON_ORANGE,
  3: COLORS.NEON_RED,
} as const;

export const POWERUP_COLORS = {
  wide: COLORS.NEON_CYAN,
  multiball: COLORS.NEON_PURPLE,
  laser: COLORS.NEON_RED,
} as const;

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 12,
  PADDLE_WIDTH_WIDE: 160,
  BALL_RADIUS: 6,
  BALL_SPEED_BASE: 5,
  BALL_SPEED_MAX: 12,
  BRICK_WIDTH: 60,
  BRICK_HEIGHT: 20,
  BRICK_GAP: 8,
  BRICK_ROWS: 5,
  BRICK_COLS: 10,
  POWERUP_CHANCE: 0.15,
  POWERUP_FALL_SPEED: 2,
  LASER_SPEED: 8,
  LASER_WIDTH: 4,
  LASER_HEIGHT: 12,
  MAX_LIVES: 3,
  PADDLE_Y_OFFSET: 40,
  // Scoring constants
  BASE_POINTS_PER_BRICK: 10,
  COMBO_MULTIPLIER_INCREMENT: 0.5,
  COMBO_BASE_MULTIPLIER: 1,
  LEVEL_COMPLETION_BONUS: 1000,
  REMAINING_LIFE_BONUS: 500,
} as const;

export const LEVEL_PATTERNS: number[][][] = [
  // Level 1: Basic full pattern
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  ],
  // Level 2: Mixed levels
  [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
  ],
  // Level 3: Hard pattern with level 3 bricks
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],
  ],
];

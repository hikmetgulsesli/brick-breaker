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
}

export interface HighScore {
  score: number;
  date: string;
  level: number;
}

export const BRICK_COLORS = {
  1: '#39ff14',
  2: '#ff9e00',
  3: '#ff073a',
} as const;

export const POWERUP_COLORS = {
  wide: '#00f5ff',
  multiball: '#bc13fe',
  laser: '#ff073a',
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

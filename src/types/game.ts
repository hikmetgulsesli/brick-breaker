export interface HighScore {
  score: number;
  level: number;
  date: string;
}

export interface Score {
  id: string;
  score: number;
  date: string;
}

export interface HighScoresState {
  scores: Score[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  active: boolean;
  type?: 'shatter' | 'sparkle' | 'trail';
}

// Game configuration constants
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  MAX_LIVES: 3,
  PADDLE_WIDTH: 100,
  PADDLE_WIDTH_WIDE: 160,
  PADDLE_HEIGHT: 15,
  PADDLE_Y_OFFSET: 40,
  BALL_RADIUS: 6,
  BALL_SPEED: 5,
  BALL_SPEED_BASE: 4,
  BALL_SPEED_MAX: 8,
  BRICK_ROWS: 5,
  BRICK_COLS: 10,
  BRICK_WIDTH: 60,
  BRICK_HEIGHT: 20,
  BRICK_PADDING: 10,
  BRICK_GAP: 4,
  POWERUP_SIZE: 20,
  POWERUP_CHANCE: 0.7,
  POWERUP_SPEED: 2,
  POWERUP_FALL_SPEED: 2,
  LASER_WIDTH: 4,
  LASER_HEIGHT: 12,
  LASER_SPEED: 10,
  WIDE_DURATION: 10000,
  LASER_DURATION: 15000,
  MAX_PARTICLES: 100,
  PARTICLE_LIFETIME: 30,
} as const;

// Color definitions
export const COLORS = {
  BG_DARKER: '#050510',
  BG_DARK: '#0a0a1a',
  NEON_BLUE: '#00f5ff',
  NEON_CYAN: '#00f5ff',
  NEON_PINK: '#ff00ff',
  NEON_GREEN: '#00ff9d',
  NEON_YELLOW: '#ffff00',
  NEON_RED: '#ff0040',
  NEON_ORANGE: '#ff8000',
  NEON_PURPLE: '#8000ff',
  WHITE: '#ffffff',
} as const;

// Brick colors by level
export const BRICK_COLORS: string[] = [
  COLORS.NEON_GREEN,    // Level 0 - easiest
  COLORS.NEON_YELLOW,   // Level 1
  COLORS.NEON_ORANGE,   // Level 2
  COLORS.NEON_RED,      // Level 3
  COLORS.NEON_PURPLE,   // Level 4 - hardest
];

// Brick scores by level
export const BRICK_SCORES: Record<number, number> = {
  0: 10,
  1: 20,
  2: 30,
  3: 50,
  4: 100,
};

// Power-up colors
export const POWERUP_COLORS: Record<PowerUpType, string> = {
  wide: COLORS.NEON_BLUE,
  multiball: COLORS.NEON_PINK,
  laser: COLORS.NEON_RED,
};

// Level patterns (0 = empty, 1-5 = brick levels)
export const LEVEL_PATTERNS: number[][][] = [
  // Level 1 - Simple rows
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  // Level 2 - Mixed difficulty
  [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 1, 0, 0, 0, 0, 1, 1, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  // Level 3 - Hard pattern
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
    [3, 2, 1, 1, 0, 0, 1, 1, 2, 3],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
];

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

export interface Ball {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  dx: number;
  dy: number;
  radius: number;
  active?: boolean;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  powerUpState: 'none' | 'wide' | 'laser';
  powerUpEndTime: number | null;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points?: number;
  destroyed?: boolean;
  level?: number;
  durability?: number;
  scoreValue?: number;
  active?: boolean;
}

export type PowerUpType = 'wide' | 'multiball' | 'laser';

export interface PowerUp {
  x: number;
  y: number;
  dx?: number;
  dy: number;
  width: number;
  height: number;
  duration?: number;
  type: PowerUpType;
  active: boolean;
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

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Ball extends Position, Velocity {
  radius: number;
  active: boolean;
}

export type PowerUpState = 'none' | 'wide' | 'laser';

export interface Paddle extends Position {
  width: number;
  height: number;
  powerUpState: PowerUpState;
  powerUpEndTime: number | null;
}

export interface Brick extends Position {
  width: number;
  height: number;
  level: 1 | 2 | 3;
  durability: number;
  color: string;
  scoreValue: number;
  active: boolean;
}

export type PowerUpType = 'wide' | 'multiball' | 'laser';

export interface PowerUp extends Position {
  type: PowerUpType;
  active: boolean;
  width: number;
  height: number;
  dy: number;
  duration: number;
}

export interface Laser extends Position {
  width: number;
  height: number;
  active: boolean;
  speed: number;
}

export interface Particle extends Position {
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

export interface GameStats {
  score: number;
  lives: number;
  level: number;
}

// High Score types for US-017
export interface Score {
  id: string;
  score: number;
  date: string;
}

export interface HighScoresState {
  scores: Score[];
}

export interface ScoreEntry {
  score: number;
  date: string;
  level: number;
  playerName?: string;
}

export interface HighScore {
  score: number;
  date: string;
  level: number;
}

export interface Level {
  id: number;
  name: string;
  brickLayout: number[][];
  rows: number;
  cols: number;
  speedMultiplier: number;
}

export type GameScreen = 'menu' | 'game' | 'high-scores' | 'game-over';

export interface GameConfig {
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  PADDLE_WIDTH: number;
  PADDLE_HEIGHT: number;
  PADDLE_WIDTH_WIDE: number;
  PADDLE_Y_OFFSET: number;
  PADDLE_SPEED: number;
  BALL_RADIUS: number;
  BALL_SPEED_BASE: number;
  BALL_SPEED_MAX: number;
  BRICK_WIDTH: number;
  BRICK_HEIGHT: number;
  BRICK_GAP: number;
  BRICK_ROWS: number;
  BRICK_COLS: number;
  POWERUP_CHANCE: number;
  POWERUP_FALL_SPEED: number;
  WIDE_DURATION: number;
  LASER_DURATION: number;
  LASER_SPEED: number;
  LASER_WIDTH: number;
  LASER_HEIGHT: number;
  MAX_LIVES: number;
  FPS: number;
  MAX_PARTICLES: number;
  PARTICLE_LIFETIME: number;
  // Nested accessors for compatibility
  canvas: { width: number; height: number };
  paddle: { width: number; height: number; wideWidth: number; yOffset: number; speed: number };
  ball: { radius: number; baseSpeed: number; maxSpeed: number };
  particle: { maxCount: number; lifetime: number };
  brick: { width: number; height: number; gap: number; rows: number; cols: number };
  powerUp: { chance: number; fallSpeed: number; wideDuration: number; laserDuration: number };
  laser: { speed: number; width: number; height: number };
  game: { maxLives: number; fps: number };
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
  wide: '#00f5ff',
  multiball: '#ff9e00',
  laser: '#ff073a',
} as const;

export const BRICK_SCORES = {
  1: 10,
  2: 20,
  3: 50,
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
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
  ],
];

// Game configuration constants
export const GAME_CONFIG: GameConfig = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 16,
  PADDLE_WIDTH_WIDE: 150,
  PADDLE_Y_OFFSET: 40,
  PADDLE_SPEED: 8,
  BALL_RADIUS: 8,
  BALL_SPEED_BASE: 5,
  BALL_SPEED_MAX: 12,
  BRICK_WIDTH: 70,
  BRICK_HEIGHT: 24,
  BRICK_GAP: 4,
  BRICK_ROWS: 5,
  BRICK_COLS: 10,
  POWERUP_CHANCE: 0.15,
  POWERUP_FALL_SPEED: 2,
  WIDE_DURATION: 10000,
  LASER_DURATION: 8000,
  LASER_SPEED: 10,
  LASER_WIDTH: 4,
  LASER_HEIGHT: 16,
  MAX_LIVES: 3,
  FPS: 60,
  MAX_PARTICLES: 100,
  PARTICLE_LIFETIME: 1000,
  // Nested accessors for compatibility with existing code
  canvas: { width: 800, height: 600 },
  paddle: { width: 100, height: 16, wideWidth: 150, yOffset: 40, speed: 8 },
  ball: { radius: 8, baseSpeed: 5, maxSpeed: 12 },
  particle: { maxCount: 100, lifetime: 1000 },
  brick: { width: 70, height: 24, gap: 4, rows: 5, cols: 10 },
  powerUp: { chance: 0.15, fallSpeed: 2, wideDuration: 10000, laserDuration: 8000 },
  laser: { speed: 10, width: 4, height: 16 },
  game: { maxLives: 3, fps: 60 },
} as const;

// Level configurations
export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Level 1',
    brickLayout: [
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.0,
  },
  {
    id: 2,
    name: 'Level 2',
    brickLayout: [
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.2,
  },
  {
    id: 3,
    name: 'Level 3',
    brickLayout: [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 0, 0, 1, 1, 0, 0, 1, 2],
      [2, 1, 0, 0, 1, 1, 0, 0, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.4,
  },
];

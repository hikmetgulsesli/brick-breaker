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

export const BRICK_SCORES = {
  1: 10,
  2: 20,
  3: 50,
} as const;

export const POWERUP_COLORS = {
  wide: '#00f5ff',
  multiball: '#ff9e00',
  laser: '#ff073a',
} as const;

export const GAME_CONFIG: GameConfig = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 12,
  PADDLE_WIDTH_WIDE: 160,
  PADDLE_Y_OFFSET: 40,
  PADDLE_SPEED: 8,
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
  WIDE_DURATION: 10000,
  LASER_DURATION: 8000,
  LASER_SPEED: 8,
  LASER_WIDTH: 4,
  LASER_HEIGHT: 12,
  MAX_LIVES: 3,
  FPS: 60,
  MAX_PARTICLES: 200,
  PARTICLE_LIFETIME: 600,
  // Nested accessors for compatibility with US-002 code
  get canvas() { return { width: this.CANVAS_WIDTH, height: this.CANVAS_HEIGHT }; },
  get paddle() { return { width: this.PADDLE_WIDTH, height: this.PADDLE_HEIGHT, wideWidth: this.PADDLE_WIDTH_WIDE, yOffset: this.PADDLE_Y_OFFSET, speed: this.PADDLE_SPEED }; },
  get ball() { return { radius: this.BALL_RADIUS, baseSpeed: this.BALL_SPEED_BASE, maxSpeed: this.BALL_SPEED_MAX }; },
  get brick() { return { width: this.BRICK_WIDTH, height: this.BRICK_HEIGHT, gap: this.BRICK_GAP, rows: this.BRICK_ROWS, cols: this.BRICK_COLS }; },
  get powerUp() { return { chance: this.POWERUP_CHANCE, fallSpeed: this.POWERUP_FALL_SPEED, wideDuration: this.WIDE_DURATION, laserDuration: this.LASER_DURATION }; },
  get laser() { return { speed: this.LASER_SPEED, width: this.LASER_WIDTH, height: this.LASER_HEIGHT }; },
  get game() { return { maxLives: this.MAX_LIVES, fps: this.FPS }; },
  get particle() { return { maxCount: this.MAX_PARTICLES, lifetime: this.PARTICLE_LIFETIME }; },
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

export const INITIAL_BALL: Ball = {
  x: GAME_CONFIG.CANVAS_WIDTH / 2,
  y: GAME_CONFIG.CANVAS_HEIGHT / 2,
  dx: 4,
  dy: -4,
  radius: GAME_CONFIG.BALL_RADIUS,
  active: true,
};

export const INITIAL_PADDLE: Paddle = {
  x: (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2,
  y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET,
  width: GAME_CONFIG.PADDLE_WIDTH,
  height: GAME_CONFIG.PADDLE_HEIGHT,
  powerUpState: 'none',
  powerUpEndTime: null,
};

export const INITIAL_GAME_STATS: GameStats = {
  score: 0,
  lives: GAME_CONFIG.MAX_LIVES,
  level: 1,
};

export type TypeGuard<T> = (value: unknown) => value is T;

export const isBall = (value: unknown): value is Ball => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'dx' in value &&
    'dy' in value &&
    'radius' in value &&
    'active' in value
  );
};

export const isPaddle = (value: unknown): value is Paddle => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'width' in value &&
    'height' in value &&
    'powerUpState' in value
  );
};

export const isBrick = (value: unknown): value is Brick => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'width' in value &&
    'height' in value &&
    'level' in value &&
    'active' in value
  );
};

export const isPowerUp = (value: unknown): value is PowerUp => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'type' in value &&
    'active' in value &&
    'duration' in value
  );
};

export const isGameState = (value: unknown): value is GameState => {
  return (
    typeof value === 'string' &&
    Object.values(GameState).includes(value as GameState)
  );
};

export const isScoreEntry = (value: unknown): value is ScoreEntry => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'score' in value &&
    'date' in value &&
    'level' in value
  );
};

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
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

export interface Level {
  id: number;
  name: string;
  brickLayout: number[][];
  rows: number;
  cols: number;
  speedMultiplier: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  paddle: {
    width: number;
    height: number;
    wideWidth: number;
    yOffset: number;
    speed: number;
  };
  ball: {
    radius: number;
    baseSpeed: number;
    maxSpeed: number;
  };
  brick: {
    width: number;
    height: number;
    gap: number;
    rows: number;
    cols: number;
  };
  powerUp: {
    chance: number;
    fallSpeed: number;
    wideDuration: number;
    laserDuration: number;
  };
  laser: {
    speed: number;
    width: number;
    height: number;
  };
  game: {
    maxLives: number;
    fps: number;
  };
}

export const BRICK_COLORS = {
  1: '#39ff14',
  2: '#ff9e00',
  3: '#ff073a',
} as const;

export const BRICK_SCORES = {
  1: 10,
  2: 20,
  3: 50,
} as const;

export const POWERUP_COLORS = {
  wide: '#00f5ff',
  multiball: '#bc13fe',
  laser: '#ff073a',
} as const;

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  paddle: {
    width: 100,
    height: 12,
    wideWidth: 160,
    yOffset: 40,
    speed: 8,
  },
  ball: {
    radius: 6,
    baseSpeed: 5,
    maxSpeed: 12,
  },
  brick: {
    width: 60,
    height: 20,
    gap: 8,
    rows: 5,
    cols: 10,
  },
  powerUp: {
    chance: 0.15,
    fallSpeed: 2,
    wideDuration: 10000,
    laserDuration: 8000,
  },
  laser: {
    speed: 8,
    width: 4,
    height: 12,
  },
  game: {
    maxLives: 3,
    fps: 60,
  },
} as const;

export const LEVEL_PATTERNS: Level[] = [
  {
    id: 1,
    name: 'Beginner',
    brickLayout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.0,
  },
  {
    id: 2,
    name: 'Intermediate',
    brickLayout: [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.2,
  },
  {
    id: 3,
    name: 'Expert',
    brickLayout: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],
    ],
    rows: 5,
    cols: 10,
    speedMultiplier: 1.5,
  },
];

export const INITIAL_BALL: Ball = {
  x: GAME_CONFIG.canvas.width / 2,
  y: GAME_CONFIG.canvas.height / 2,
  dx: 4,
  dy: -4,
  radius: GAME_CONFIG.ball.radius,
  active: true,
};

export const INITIAL_PADDLE: Paddle = {
  x: (GAME_CONFIG.canvas.width - GAME_CONFIG.paddle.width) / 2,
  y: GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.yOffset,
  width: GAME_CONFIG.paddle.width,
  height: GAME_CONFIG.paddle.height,
  powerUpState: 'none',
  powerUpEndTime: null,
};

export const INITIAL_GAME_STATS: GameStats = {
  score: 0,
  lives: GAME_CONFIG.game.maxLives,
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

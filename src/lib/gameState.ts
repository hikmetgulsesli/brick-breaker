/**
 * Game state types and constants for Brick Breaker
 */

/** Game state enumeration */
export type GameState = 
  | 'MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'VICTORY';

/** Game state metadata for UI display */
export const GAME_STATE_LABELS: Record<GameState, string> = {
  MENU: 'Main Menu',
  PLAYING: 'Playing',
  PAUSED: 'Paused',
  GAME_OVER: 'Game Over',
  VICTORY: 'Victory!',
};

/** Initial lives for the player */
export const INITIAL_LIVES = 3;

/** Maximum lives a player can have */
export const MAX_LIVES = 5;

/** Game configuration constants */
export const GAME_CONFIG = {
  initialLives: INITIAL_LIVES,
  maxLives: MAX_LIVES,
  ballRadius: 8,
  paddleWidth: 100,
  paddleHeight: 15,
  brickWidth: 60,
  brickHeight: 24,
  brickPadding: 4,
} as const;

/** Player life state */
export interface LifeState {
  current: number;
  max: number;
}

/** Score state */
export interface ScoreState {
  current: number;
  highScore: number;
}

/** Level progress state */
export interface LevelState {
  currentLevel: number;
  totalLevels: number;
  bricksDestroyed: number;
  totalBricks: number;
}

/** Complete game state */
export interface GameStateData {
  state: GameState;
  lives: LifeState;
  score: ScoreState;
  level: LevelState;
}

/** Game action types for reducer */
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'GAME_OVER' }
  | { type: 'LEVEL_COMPLETE' }
  | { type: 'VICTORY' }
  | { type: 'LOSE_LIFE' }
  | { type: 'ADD_LIFE' }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'SET_HIGH_SCORE'; payload: number }
  | { type: 'NEXT_LEVEL' }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'UPDATE_BRICK_PROGRESS'; payload: { destroyed: number; total: number } };

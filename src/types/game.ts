export interface HighScore {
  score: number;
  level: number;
  date: string;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
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
  color: string;
  points: number;
  destroyed: boolean;
}

export type PowerUpType = 'wide' | 'multiball' | 'laser';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
}

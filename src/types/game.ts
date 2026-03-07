export interface Score {
  id: string;
  score: number;
  date: string;
}

export interface HighScoresState {
  scores: Score[];
}

export type GameScreen = 'menu' | 'game' | 'high-scores' | 'game-over' | 'victory';

export interface GameState {
  screen: GameScreen;
  score: number;
  level: number;
  lives: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
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
  visible: boolean;
}

export type PowerUpType = 'expand' | 'multi' | 'laser';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
  duration: number;
}

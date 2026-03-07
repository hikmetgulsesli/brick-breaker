export { default as Paddle } from './Paddle';
export type {
  PaddleType,
  PaddleState,
  PaddleConfig,
} from './Paddle';
export { DEFAULT_PADDLE_CONFIG } from './Paddle';

export { default as Ball } from './Ball';
export type {
  BallState,
  BallConfig,
  TrailPoint,
  PaddleCollisionResult,
} from './Ball';
export { DEFAULT_BALL_CONFIG } from './Ball';

export { default as Brick } from './Brick';
export type {
  BrickDurability,
  BrickState,
  BrickConfig,
  BrickHitResult,
} from './Brick';
export {
  BRICK_COLORS,
  BRICK_SCORES,
  DEFAULT_BRICK_CONFIG,
} from './Brick';

export {
  LEVELS,
  calculateBrickPositions,
  createBricksForLevel,
  getLevelConfig,
  getTotalLevels,
  isValidLevel,
} from './levels';
export type {
  LevelPattern,
  LevelConfig,
} from './levels';

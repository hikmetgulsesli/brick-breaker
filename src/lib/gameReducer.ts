/**
 * Game State Reducer for Brick Breaker
 * 
 * Handles all game state transitions immutably.
 * Centralizes state management for lives, score, level progression, and game flow.
 */

import {
  GameStateData,
  GameAction,
  INITIAL_LIVES,
  MAX_LIVES,
} from './gameState';
import { LEVELS } from '../entities/levels';

/** Initial game state factory */
export function createInitialState(): GameStateData {
  const firstLevel = LEVELS[0];
  const totalBricks = firstLevel 
    ? firstLevel.pattern.grid.flat().filter(cell => cell > 0).length
    : 0;

  return {
    state: 'MENU',
    lives: {
      current: INITIAL_LIVES,
      max: MAX_LIVES,
    },
    score: {
      current: 0,
      highScore: 0,
    },
    level: {
      currentLevel: 1,
      totalLevels: LEVELS.length,
      bricksDestroyed: 0,
      totalBricks,
    },
  };
}

/** Reset state for new game */
function resetForNewGame(state: GameStateData): GameStateData {
  const firstLevel = LEVELS[0];
  const totalBricks = firstLevel 
    ? firstLevel.pattern.grid.flat().filter(cell => cell > 0).length
    : 0;

  return {
    ...state,
    state: 'PLAYING',
    lives: {
      current: INITIAL_LIVES,
      max: MAX_LIVES,
    },
    score: {
      ...state.score,
      current: 0,
    },
    level: {
      currentLevel: 1,
      totalLevels: LEVELS.length,
      bricksDestroyed: 0,
      totalBricks,
    },
  };
}

/** Reset state for new level */
function resetForNewLevel(state: GameStateData, levelNumber: number): GameStateData {
  const level = LEVELS.find(l => l.levelNumber === levelNumber);
  const totalBricks = level 
    ? level.pattern.grid.flat().filter(cell => cell > 0).length
    : 0;

  return {
    ...state,
    state: 'PLAYING',
    level: {
      ...state.level,
      currentLevel: levelNumber,
      bricksDestroyed: 0,
      totalBricks,
    },
  };
}

/** Handle life lost */
function handleLoseLife(state: GameStateData): GameStateData {
  const newLives = state.lives.current - 1;
  
  if (newLives <= 0) {
    return {
      ...state,
      lives: {
        ...state.lives,
        current: 0,
      },
      state: 'GAME_OVER',
    };
  }

  return {
    ...state,
    lives: {
      ...state.lives,
      current: newLives,
    },
    state: 'PLAYING',
  };
}

/** Handle level completion */
function handleLevelComplete(state: GameStateData): GameStateData {
  const nextLevel = state.level.currentLevel + 1;
  
  if (nextLevel > LEVELS.length) {
    return {
      ...state,
      state: 'VICTORY',
    };
  }

  return resetForNewLevel(state, nextLevel);
}

/** Game state reducer - pure function for immutable state transitions */
export function gameStateReducer(
  state: GameStateData,
  action: GameAction
): GameStateData {
  switch (action.type) {
    case 'START_GAME':
      return resetForNewGame(state);

    case 'PAUSE_GAME':
      if (state.state !== 'PLAYING') return state;
      return {
        ...state,
        state: 'PAUSED',
      };

    case 'RESUME_GAME':
      if (state.state !== 'PAUSED') return state;
      return {
        ...state,
        state: 'PLAYING',
      };

    case 'RESTART_LEVEL':
      return resetForNewLevel(state, state.level.currentLevel);

    case 'RESTART_GAME':
      return resetForNewGame(state);

    case 'RETURN_TO_MENU':
      return {
        ...createInitialState(),
        score: {
          ...state.score,
          highScore: state.score.highScore,
        },
      };

    case 'GAME_OVER':
      return {
        ...state,
        state: 'GAME_OVER',
      };

    case 'LEVEL_COMPLETE':
      return handleLevelComplete(state);

    case 'VICTORY':
      return {
        ...state,
        state: 'VICTORY',
      };

    case 'LOSE_LIFE':
      return handleLoseLife(state);

    case 'ADD_LIFE':
      if (state.lives.current >= MAX_LIVES) return state;
      return {
        ...state,
        lives: {
          ...state.lives,
          current: state.lives.current + 1,
        },
      };

    case 'ADD_SCORE':
      const newScore = state.score.current + action.payload;
      return {
        ...state,
        score: {
          current: newScore,
          highScore: Math.max(newScore, state.score.highScore),
        },
      };

    case 'SET_HIGH_SCORE':
      return {
        ...state,
        score: {
          ...state.score,
          highScore: action.payload,
        },
      };

    case 'NEXT_LEVEL':
      return handleLevelComplete(state);

    case 'SET_LEVEL':
      return resetForNewLevel(state, action.payload);

    case 'UPDATE_BRICK_PROGRESS':
      const { destroyed, total } = action.payload;
      return {
        ...state,
        level: {
          ...state.level,
          bricksDestroyed: destroyed,
          totalBricks: total,
        },
      };

    default:
      return state;
  }
}

/** Check if ball is out of bounds (below paddle) */
export function isBallOutOfBounds(
  ballY: number,
  ballRadius: number,
  canvasHeight: number
): boolean {
  return ballY - ballRadius > canvasHeight;
}

/** Check if all bricks are destroyed (victory condition for level) */
export function areAllBricksDestroyed(
  bricksDestroyed: number,
  totalBricks: number
): boolean {
  return totalBricks > 0 && bricksDestroyed >= totalBricks;
}

/** Calculate remaining bricks */
export function getRemainingBricks(
  bricksDestroyed: number,
  totalBricks: number
): number {
  return Math.max(0, totalBricks - bricksDestroyed);
}

/** Get star rating based on score and level */
export function calculateStarRating(
  score: number,
  level: number,
  livesRemaining: number
): 1 | 2 | 3 {
  const baseScore = level * 1000;
  const lifeBonus = livesRemaining * 500;
  const total = score + lifeBonus;

  if (total >= baseScore * 2) return 3;
  if (total >= baseScore * 1.5) return 2;
  return 1;
}

/**
 * Tests for Life System and Game State Management
 */

import {
  gameStateReducer,
  createInitialState,
  isBallOutOfBounds,
  areAllBricksDestroyed,
  getRemainingBricks,
  calculateStarRating,
} from '../gameReducer';
import { INITIAL_LIVES, MAX_LIVES } from '../gameState';

describe('Life System', () => {
  describe('Initial Lives', () => {
    it('player starts with 3 lives', () => {
      const state = createInitialState();
      expect(state.lives.current).toBe(3);
      expect(state.lives.max).toBe(MAX_LIVES);
    });

    it('lives are preserved when starting game', () => {
      const initial = createInitialState();
      const playing = gameStateReducer(initial, { type: 'START_GAME' });
      expect(playing.lives.current).toBe(INITIAL_LIVES);
    });
  });

  describe('Lose Life', () => {
    it('decrements lives by 1', () => {
      const initial = createInitialState();
      const playing = gameStateReducer(initial, { type: 'START_GAME' });
      const afterLoss = gameStateReducer(playing, { type: 'LOSE_LIFE' });
      expect(afterLoss.lives.current).toBe(INITIAL_LIVES - 1);
    });

    it('game over when all lives exhausted', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      
      // Lose all lives
      for (let i = 0; i < INITIAL_LIVES; i++) {
        state = gameStateReducer(state, { type: 'LOSE_LIFE' });
      }
      
      expect(state.lives.current).toBe(0);
      expect(state.state).toBe('GAME_OVER');
    });

    it('stays in PLAYING state when lives remain', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'LOSE_LIFE' });
      
      expect(state.lives.current).toBe(INITIAL_LIVES - 1);
      expect(state.state).toBe('PLAYING');
    });
  });

  describe('Add Life', () => {
    it('increments lives by 1', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'LOSE_LIFE' });
      state = gameStateReducer(state, { type: 'ADD_LIFE' });
      
      expect(state.lives.current).toBe(INITIAL_LIVES);
    });

    it('cannot exceed maximum lives', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      
      // Try to add lives beyond max
      for (let i = 0; i < 10; i++) {
        state = gameStateReducer(state, { type: 'ADD_LIFE' });
      }
      
      expect(state.lives.current).toBe(MAX_LIVES);
    });
  });
});

describe('Game State Transitions', () => {
  describe('MENU state', () => {
    it('starts in MENU state', () => {
      const state = createInitialState();
      expect(state.state).toBe('MENU');
    });

    it('transitions to PLAYING on START_GAME', () => {
      const initial = createInitialState();
      const state = gameStateReducer(initial, { type: 'START_GAME' });
      expect(state.state).toBe('PLAYING');
    });
  });

  describe('PLAYING state', () => {
    it('transitions to PAUSED on PAUSE_GAME', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'PAUSE_GAME' });
      expect(state.state).toBe('PAUSED');
    });

    it('transitions to GAME_OVER on GAME_OVER action', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'GAME_OVER' });
      expect(state.state).toBe('GAME_OVER');
    });
  });

  describe('PAUSED state', () => {
    it('transitions to PLAYING on RESUME_GAME', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'PAUSE_GAME' });
      state = gameStateReducer(state, { type: 'RESUME_GAME' });
      expect(state.state).toBe('PLAYING');
    });

    it('stays PAUSED if not PLAYING before', () => {
      const initial = createInitialState();
      const state = gameStateReducer(initial, { type: 'RESUME_GAME' });
      expect(state.state).toBe('MENU');
    });
  });

  describe('GAME_OVER state', () => {
    it('transitions to PLAYING on RESTART_GAME', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'GAME_OVER' });
      state = gameStateReducer(state, { type: 'RESTART_GAME' });
      expect(state.state).toBe('PLAYING');
    });

    it('resets lives on RESTART_GAME', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'LOSE_LIFE' });
      state = gameStateReducer(state, { type: 'LOSE_LIFE' });
      state = gameStateReducer(state, { type: 'GAME_OVER' });
      state = gameStateReducer(state, { type: 'RESTART_GAME' });
      expect(state.lives.current).toBe(INITIAL_LIVES);
    });

    it('transitions to MENU on RETURN_TO_MENU', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'GAME_OVER' });
      state = gameStateReducer(state, { type: 'RETURN_TO_MENU' });
      expect(state.state).toBe('MENU');
    });
  });

  describe('VICTORY state', () => {
    it('can transition to VICTORY', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'VICTORY' });
      expect(state.state).toBe('VICTORY');
    });

    it('transitions to MENU on RETURN_TO_MENU', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'VICTORY' });
      state = gameStateReducer(state, { type: 'RETURN_TO_MENU' });
      expect(state.state).toBe('MENU');
    });
  });
});

describe('Level Progression', () => {
  describe('Level Complete', () => {
    it('advances to next level on LEVEL_COMPLETE', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'LEVEL_COMPLETE' });
      expect(state.level.currentLevel).toBe(2);
      expect(state.state).toBe('PLAYING');
    });

    it('transitions to VICTORY on final level complete', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      
      // Complete all levels
      for (let i = 0; i < 3; i++) {
        state = gameStateReducer(state, { type: 'LEVEL_COMPLETE' });
      }
      
      expect(state.state).toBe('VICTORY');
    });
  });

  describe('SET_LEVEL action', () => {
    it('sets specific level', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'SET_LEVEL', payload: 2 });
      expect(state.level.currentLevel).toBe(2);
    });

    it('resets brick progress on level change', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { 
        type: 'UPDATE_BRICK_PROGRESS', 
        payload: { destroyed: 10, total: 20 } 
      });
      state = gameStateReducer(state, { type: 'SET_LEVEL', payload: 2 });
      expect(state.level.bricksDestroyed).toBe(0);
    });
  });
});

describe('Score System', () => {
  describe('Add Score', () => {
    it('adds points to current score', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 100 });
      expect(state.score.current).toBe(100);
    });

    it('accumulates score', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 100 });
      state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 50 });
      expect(state.score.current).toBe(150);
    });

    it('updates high score when current exceeds it', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 1000 });
      expect(state.score.highScore).toBe(1000);
    });

    it('preserves high score across games', () => {
      const initial = createInitialState();
      let state = gameStateReducer(initial, { type: 'START_GAME' });
      state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 1000 });
      state = gameStateReducer(state, { type: 'RESTART_GAME' });
      expect(state.score.highScore).toBe(1000);
      expect(state.score.current).toBe(0);
    });
  });

  describe('Set High Score', () => {
    it('sets high score directly', () => {
      const initial = createInitialState();
      const state = gameStateReducer(initial, { type: 'SET_HIGH_SCORE', payload: 5000 });
      expect(state.score.highScore).toBe(5000);
    });
  });
});

describe('Helper Functions', () => {
  describe('isBallOutOfBounds', () => {
    it('returns true when ball passes below canvas', () => {
      expect(isBallOutOfBounds(610, 10, 600)).toBe(true);
    });

    it('returns false when ball is within canvas', () => {
      expect(isBallOutOfBounds(500, 10, 600)).toBe(false);
    });

    it('returns false when ball is at bottom edge', () => {
      expect(isBallOutOfBounds(600, 10, 600)).toBe(false);
    });

    it('returns true when ball center is just below', () => {
      expect(isBallOutOfBounds(601, 10, 600)).toBe(true);
    });
  });

  describe('areAllBricksDestroyed', () => {
    it('returns true when all bricks destroyed', () => {
      expect(areAllBricksDestroyed(20, 20)).toBe(true);
    });

    it('returns false when bricks remain', () => {
      expect(areAllBricksDestroyed(15, 20)).toBe(false);
    });

    it('returns false when no bricks defined', () => {
      expect(areAllBricksDestroyed(0, 0)).toBe(false);
    });
  });

  describe('getRemainingBricks', () => {
    it('returns correct remaining count', () => {
      expect(getRemainingBricks(5, 20)).toBe(15);
    });

    it('never returns negative', () => {
      expect(getRemainingBricks(25, 20)).toBe(0);
    });
  });

  describe('calculateStarRating', () => {
    it('returns 3 stars for high performance', () => {
      expect(calculateStarRating(5000, 1, 3)).toBe(3);
    });

    it('returns 2 stars for medium performance', () => {
      expect(calculateStarRating(2000, 1, 2)).toBe(2);
    });

    it('returns 1 star for low performance', () => {
      expect(calculateStarRating(500, 1, 1)).toBe(1);
    });
  });
});

describe('Immutable State', () => {
  it('does not mutate original state', () => {
    const initial = createInitialState();
    const originalLives = initial.lives;
    const originalScore = initial.score;
    const originalLevel = initial.level;

    let state = gameStateReducer(initial, { type: 'START_GAME' });
    state = gameStateReducer(state, { type: 'ADD_SCORE', payload: 100 });
    state = gameStateReducer(state, { type: 'LOSE_LIFE' });

    // Verify original state is unchanged
    expect(initial.lives).toBe(originalLives);
    expect(initial.score).toBe(originalScore);
    expect(initial.level).toBe(originalLevel);
    // Verify new state has changes
    expect(state.lives.current).toBe(INITIAL_LIVES - 1);
    expect(state.score.current).toBe(100);
  });

  it('creates new state objects for each transition', () => {
    const initial = createInitialState();
    const state1 = gameStateReducer(initial, { type: 'START_GAME' });
    const state2 = gameStateReducer(state1, { type: 'ADD_SCORE', payload: 100 });

    expect(state1).not.toBe(initial);
    expect(state2).not.toBe(state1);
    expect(state2).not.toBe(initial);
  });
});

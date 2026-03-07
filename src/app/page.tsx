/**
 * Brick Breaker Game
 *
 * Main game page integrating:
 * - Main Menu
 * - Game HUD with life system
 * - Game Canvas with physics
 * - Game Overlays (Pause, Game Over, Victory)
 * - Game state management
 */

'use client';

import { useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { HUD, GameOverlay, MainMenu, GameCanvas } from '../components';
import { GameStateData, GameAction } from '../lib/gameState';
import { gameStateReducer, createInitialState } from '../lib/gameReducer';

/** Load high score from localStorage */
function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('brick-breaker-highscore');
  return saved ? parseInt(saved, 10) || 0 : 0;
}

/** Save high score to localStorage */
function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('brick-breaker-highscore', score.toString());
}

/** Load unlocked levels from localStorage */
function loadUnlockedLevels(): number[] {
  if (typeof window === 'undefined') return [1];
  const saved = localStorage.getItem('brick-breaker-unlocked');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [1];
    }
  }
  return [1];
}

/** Save unlocked levels to localStorage */
function saveUnlockedLevels(levels: number[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('brick-breaker-unlocked', JSON.stringify(levels));
}

export default function BrickBreakerPage() {
  // Initialize game state with high score from localStorage
  const [gameState, dispatch] = useReducer(
    (state: GameStateData, action: GameAction) => {
      return gameStateReducer(state, action);
    },
    null,
    () => {
      const initial = createInitialState();
      const highScore = loadHighScore();
      return {
        ...initial,
        score: {
          ...initial.score,
          highScore,
        },
      };
    }
  );

  // Track previous high score for useEffect comparison
  const prevHighScoreRef = useRef<number>(gameState.score.highScore);

  // Persist high score when it changes (side effect in useEffect, not reducer)
  useEffect(() => {
    if (gameState.score.highScore !== prevHighScoreRef.current) {
      saveHighScore(gameState.score.highScore);
      prevHighScoreRef.current = gameState.score.highScore;
    }
  }, [gameState.score.highScore]);

  // Compute unlocked levels using useMemo for initial load
  const unlockedLevels = useMemo(() => loadUnlockedLevels(), []);

  // Track unlocked levels in state for useEffect to save
  const effectiveUnlockedLevels = useMemo(() => {
    const currentLevel = gameState.level.currentLevel;
    if (!unlockedLevels.includes(currentLevel)) {
      return [...unlockedLevels, currentLevel].sort((a, b) => a - b);
    }
    return unlockedLevels;
  }, [gameState.level.currentLevel, unlockedLevels]);

  // Save unlocked levels to localStorage when they change (side effect in useEffect)
  useEffect(() => {
    const currentLevel = gameState.level.currentLevel;
    if (!unlockedLevels.includes(currentLevel)) {
      const newUnlocked = [...unlockedLevels, currentLevel].sort((a, b) => a - b);
      saveUnlockedLevels(newUnlocked);
    }
  }, [gameState.level.currentLevel, unlockedLevels]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'p':
        case 'P':
          if (gameState.state === 'PLAYING') {
            dispatch({ type: 'PAUSE_GAME' });
          } else if (gameState.state === 'PAUSED') {
            dispatch({ type: 'RESUME_GAME' });
          }
          break;
        case 'Escape':
          if (gameState.state === 'PLAYING' || gameState.state === 'PAUSED') {
            dispatch({ type: 'RETURN_TO_MENU' });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.state]);

  // Game action handlers
  const handleStartGame = useCallback((levelNumber: number) => {
    dispatch({ type: 'SET_LEVEL', payload: levelNumber });
  }, []);

  const handleResume = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);

  const handleRestartLevel = useCallback(() => {
    dispatch({ type: 'RESTART_LEVEL' });
  }, []);

  const handleReturnToMenu = useCallback(() => {
    dispatch({ type: 'RETURN_TO_MENU' });
  }, []);

  const handleLifeLost = useCallback(() => {
    dispatch({ type: 'LOSE_LIFE' });
  }, []);

  const handleScoreAdd = useCallback((points: number) => {
    dispatch({ type: 'ADD_SCORE', payload: points });
  }, []);

  const handleLevelComplete = useCallback(() => {
    dispatch({ type: 'LEVEL_COMPLETE' });
  }, []);

  const handleProgressUpdate = useCallback((destroyed: number, total: number) => {
    dispatch({ type: 'UPDATE_BRICK_PROGRESS', payload: { destroyed, total } });
  }, []);

  // Show main menu
  if (gameState.state === 'MENU') {
    return (
      <MainMenu
        highScore={gameState.score.highScore}
        unlockedLevels={effectiveUnlockedLevels}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0a0a14 0%, #141420 50%, #0a0a14 100%)',
      }}
    >
      {/* HUD - Always visible during gameplay */}
      <HUD
        lives={gameState.lives}
        score={gameState.score}
        level={gameState.level}
        activePowerUp={null}
      />

      {/* Game Canvas */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <GameCanvas
          levelNumber={gameState.level.currentLevel}
          onLifeLost={handleLifeLost}
          onScoreAdd={handleScoreAdd}
          onLevelComplete={handleLevelComplete}
          onProgressUpdate={handleProgressUpdate}
          isPaused={gameState.state === 'PAUSED'}
        />
      </div>

      {/* Game Overlays */}
      <GameOverlay
        gameState={gameState.state}
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
        onResume={handleResume}
        onRestart={gameState.state === 'PAUSED' ? handleRestartLevel : handleRestart}
        onReturnToMenu={handleReturnToMenu}
      />
    </main>
  );
}

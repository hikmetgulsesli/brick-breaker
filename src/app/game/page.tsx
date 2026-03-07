'use client';

import { useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { useGameRenderer } from '@/hooks/useGameRenderer';
import { PauseOverlay } from '@/components/PauseOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { HUD } from '@/components/HUD';
import { GAME_CONFIG, GameState } from '@/types/game';
import { useGameContext } from '@/contexts/GameContext';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelParam = searchParams.get('level');
  const startLevel = levelParam ? parseInt(levelParam, 10) : 1;
  const validLevel = startLevel >= 1 && startLevel <= 3 ? startLevel : 1;

  const { setLastGameScore, setLastGameLevel } = useGameContext();

  const {
    gameState,
    stats,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
    canvasRef,
    startGame,
    togglePause,
    returnToMenu,
    updatePaddlePosition,
    shootLaser,
  } = useGame();

  const initRef = useRef(false);

  useGameRenderer({
    canvasRef,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
  });

  // Start game on mount with the selected level - use ref to prevent re-triggering
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      startGame(validLevel);
    }
  }, [startGame, validLevel]);
  
  // Track game end for state preservation
  const lastGameState = useRef(gameState);
  useEffect(() => {
    const prevState = lastGameState.current;
    lastGameState.current = gameState;
    // Only update when transitioning TO game over or victory
    if ((gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && 
        prevState !== GameState.GAME_OVER && prevState !== GameState.VICTORY) {
      setLastGameScore(stats.score);
      setLastGameLevel(stats.level);
    }
  }, [gameState, stats.score, stats.level, setLastGameScore, setLastGameLevel]);
  
  // Handle mouse/touch movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updatePaddlePosition(e.clientX);
  }, [updatePaddlePosition]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updatePaddlePosition(e.touches[0].clientX);
    }
  }, [updatePaddlePosition]);
  
  const handleClick = useCallback(() => {
    if (gameState === GameState.PLAYING && activePowerUp === 'laser') {
      shootLaser();
    }
  }, [gameState, activePowerUp, shootLaser]);
  
  // Handle navigation
  const handleReturnToMenu = useCallback(() => {
    returnToMenu();
    router.push('/');
  }, [returnToMenu, router]);
  
  const handleRestart = useCallback(() => {
    startGame(validLevel);
  }, [startGame, validLevel]);
  
  const handleNextLevel = useCallback(() => {
    if (validLevel < 3) {
      router.push(`/game?level=${validLevel + 1}`);
    } else {
      router.push('/');
    }
  }, [validLevel, router]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'p':
        case 'P':
          if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
            togglePause();
          }
          break;
        case ' ':
          if (gameState === GameState.PLAYING && activePowerUp === 'laser') {
            e.preventDefault();
            shootLaser();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, togglePause, activePowerUp, shootLaser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-dark)' }}>
      <div className="game-container">
        {/* HUD */}
        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
          <HUD 
            score={stats.score}
            lives={stats.lives}
            level={stats.level}
            activePowerUp={activePowerUp}
          />
        )}
        
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="game-canvas"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={handleClick}
        />
        
        {/* Overlays */}
        {gameState === GameState.PAUSED && (
          <PauseOverlay 
            onResume={togglePause}
            onRestart={handleRestart}
            onMenu={handleReturnToMenu}
          />
        )}
        
        {gameState === GameState.GAME_OVER && (
          <GameOverOverlay 
            score={stats.score}
            level={stats.level}
            onRestart={handleRestart}
            onMenu={handleReturnToMenu}
          />
        )}
        
        {gameState === GameState.VICTORY && (
          <VictoryOverlay 
            score={stats.score}
            lives={stats.lives}
            onRestart={handleNextLevel}
            onMenu={handleReturnToMenu}
            isLastLevel={validLevel === 3}
          />
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>Mouse/Touch: Move paddle | Click/Space: Shoot lasers | ESC/P: Pause</p>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--neon-cyan)' }}>
            Loading Game...
          </h2>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}

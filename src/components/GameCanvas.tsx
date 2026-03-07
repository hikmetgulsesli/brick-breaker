'use client';

import { useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameRenderer } from '@/hooks/useGameRenderer';
import { MainMenu } from '@/components/MainMenu';
import { PauseOverlay } from '@/components/PauseOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { HUD } from '@/components/HUD';
import { GAME_CONFIG } from '@/types/game';

export const GameCanvas = () => {
  const {
    gameState,
    stats,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
    highScores,
    canvasRef,
    startGame,
    togglePause,
    returnToMenu,
    updatePaddlePosition,
    shootLaser,
  } = useGame();
  
  useGameRenderer({
    canvasRef,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
  });
  
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
    if (gameState === 'playing' && activePowerUp === 'laser') {
      shootLaser();
    }
  }, [gameState, activePowerUp, shootLaser]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'p':
        case 'P':
          if (gameState === 'playing' || gameState === 'paused') {
            togglePause();
          }
          break;
        case ' ':
          if (gameState === 'playing' && activePowerUp === 'laser') {
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
        {(gameState === 'playing' || gameState === 'paused') && (
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
        
        {/* Screens */}
        {gameState === 'menu' && (
          <MainMenu onStart={startGame} highScores={highScores} />
        )}
        
        {gameState === 'paused' && (
          <PauseOverlay 
            onResume={togglePause}
            onRestart={() => startGame(stats.level)}
            onMenu={returnToMenu}
          />
        )}
        
        {gameState === 'gameOver' && (
          <GameOverOverlay 
            score={stats.score}
            level={stats.level}
            onRestart={() => startGame(1)}
            onMenu={returnToMenu}
          />
        )}
        
        {gameState === 'victory' && (
          <VictoryOverlay 
            score={stats.score}
            onRestart={() => startGame(1)}
            onMenu={returnToMenu}
          />
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>Mouse/Touch: Move paddle | Click/Space: Shoot lasers | ESC/P: Pause</p>
      </div>
    </div>
  );
};

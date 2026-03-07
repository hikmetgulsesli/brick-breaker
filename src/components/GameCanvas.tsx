'use client';

import { useEffect, useCallback, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameRenderer } from '@/hooks/useGameRenderer';
import { MainMenu } from '@/components/MainMenu';
import { PauseOverlay } from '@/components/PauseOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { HUD } from '@/components/HUD';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
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
    isMuted,
    highScores,
    canvasRef,
    startGame,
    togglePause,
    returnToMenu,
    updatePaddlePosition,
    shootLaser,
    toggleMute,
  } = useGame();
  
  const [isTouching, setIsTouching] = useState(false);
  
  useGameRenderer({
    canvasRef,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
  });
  
  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (gameState === 'playing' || gameState === 'paused') {
      updatePaddlePosition(e.clientX);
    }
  }, [gameState, updatePaddlePosition]);
  
  // Handle touch start - iOS Safari optimization
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setIsTouching(true);
    updatePaddlePosition(touch.clientX);
  }, [gameState, updatePaddlePosition]);
  
  // Handle touch move - iOS Safari optimization
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    if (!isTouching) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    updatePaddlePosition(touch.clientX);
  }, [gameState, isTouching, updatePaddlePosition]);
  
  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
  }, []);
  
  // Handle click/tap to shoot lasers
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
            e.preventDefault();
            togglePause();
          }
          break;
        case ' ':
          if (gameState === 'playing' && activePowerUp === 'laser') {
            e.preventDefault();
            shootLaser();
          }
          break;
        case 'm':
        case 'M':
          // Quick mute toggle
          toggleMute();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, togglePause, activePowerUp, shootLaser, toggleMute]);
  
  // iOS Safari: Prevent default touch behaviors that interfere with game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const preventDefault = (e: TouchEvent) => {
      // Only prevent default during gameplay
      if (gameState === 'playing' || gameState === 'paused') {
        // Allow scrolling if touching outside the canvas
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        if (touch) {
          const isInsideCanvas = 
            touch.clientX >= rect.left && 
            touch.clientX <= rect.right && 
            touch.clientY >= rect.top && 
            touch.clientY <= rect.bottom;
          
          if (isInsideCanvas) {
            e.preventDefault();
          }
        }
      }
    };
    
    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', preventDefault);
      canvas.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, [canvasRef, gameState]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-dark)' }}>
      <ServiceWorkerRegistration />
      
      <div className="game-container">
        {/* HUD */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <HUD 
            score={stats.score}
            lives={stats.lives}
            level={stats.level}
            activePowerUp={activePowerUp}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}
        
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="game-canvas"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          // iOS Safari touch events
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          // Accessibility
          role="img"
          aria-label="Game canvas - Use mouse, touch, or keyboard to play"
          tabIndex={gameState === 'playing' || gameState === 'paused' ? 0 : -1}
        />
        
        {/* Screens */}
        {gameState === 'menu' && (
          <MainMenu 
            onStart={startGame} 
            highScores={highScores} 
          />
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
            lives={stats.lives}
            onRestart={() => startGame(1)}
            onMenu={returnToMenu}
          />
        )}
      </div>
      
      {/* Instructions */}
      <div 
        className="mt-4 text-center text-sm max-w-md" 
        style={{ color: 'var(--text-muted)' }}
        aria-live="polite"
      >
        <p>
          <span className="hidden sm:inline">Mouse/Touch: Move paddle | </span>
          <span className="sm:hidden">Touch &amp; drag: Move paddle | </span>
          Click/Space: Shoot lasers | ESC/P: Pause | M: Mute
        </p>
      </div>
      
      {/* Accessibility Settings */}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 100 }}>
        <AccessibilitySettings />
      </div>
    </div>
  );
};

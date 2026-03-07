/**
 * Game Overlay Component
 * 
 * Displays overlays for different game states:
 * - Pause Menu
 * - Game Over Screen
 * - Victory Screen
 * 
 * All with retro neon aesthetic matching the HUD.
 */

'use client';

import { GameState, ScoreState, LevelState } from '../lib/gameState';

interface GameOverlayProps {
  gameState: GameState;
  score: ScoreState;
  level: LevelState;
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

/** Button Component with Neon Glow */
function NeonButton({ 
  onClick, 
  children, 
  variant = 'primary',
  className = ''
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
}) {
  const getColors = () => {
    switch (variant) {
      case 'primary': return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)' };
      case 'secondary': return { bg: '#888', glow: 'rgba(136, 136, 136, 0.5)' };
      case 'danger': return { bg: '#ff3864', glow: 'rgba(255, 56, 100, 0.5)' };
      case 'success': return { bg: '#00ff41', glow: 'rgba(0, 255, 65, 0.5)' };
      default: return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)' };
    }
  };

  const colors = getColors();

  return (
    <>
      <style jsx>{`
        .neon-button {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
          border: 2px solid ${colors.bg};
          background: transparent;
          color: ${colors.bg};
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          min-width: 180px;
        }

        .neon-button:hover {
          background: ${colors.bg};
          color: #000;
          box-shadow: 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow};
          transform: translateY(-2px);
        }

        .neon-button:active {
          transform: translateY(0);
        }
      `}</style>
      <button 
        className={`neon-button ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    </>
  );
}

/** Star Rating Component */
function StarRating({ stars }: { stars: 1 | 2 | 3 }) {
  return (
    <>
      <style jsx>{`
        .star-rating {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin: 16px 0;
        }

        .star {
          font-size: 32px;
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
          animation: starPulse 1s ease-in-out infinite alternate;
        }

        .star:nth-child(2) { animation-delay: 0.1s; }
        .star:nth-child(3) { animation-delay: 0.2s; }

        @keyframes starPulse {
          from {
            transform: scale(1);
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
          }
          to {
            transform: scale(1.2);
            text-shadow: 0 0 20px rgba(255, 215, 0, 1);
          }
        }
      `}</style>
      <div className="star-rating">
        {[1, 2, 3].map(i => (
          <span 
            key={i} 
            className="star"
            style={{ opacity: i <= stars ? 1 : 0.2 }}
          >
            ★
          </span>
        ))}
      </div>
    </>
  );
}

/** Pause Overlay */
function PauseOverlay({ onResume, onRestart, onReturnToMenu }: {
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
}) {
  return (
    <>
      <style jsx>{`
        .pause-title {
          font-size: 48px;
          font-weight: bold;
          color: #ff9f1c;
          text-align: center;
          margin-bottom: 32px;
          text-shadow: 0 0 20px rgba(255, 159, 28, 0.8);
          letter-spacing: 8px;
          animation: pulseText 2s ease-in-out infinite alternate;
        }

        @keyframes pulseText {
          from { text-shadow: 0 0 20px rgba(255, 159, 28, 0.8); }
          to { text-shadow: 0 0 40px rgba(255, 159, 28, 1), 0 0 60px rgba(255, 159, 28, 0.5); }
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
      `}</style>
      <h2 className="pause-title">PAUSED</h2>
      <div className="button-group">
        <NeonButton onClick={onResume} variant="success">Resume</NeonButton>
        <NeonButton onClick={onRestart} variant="primary">Restart Level</NeonButton>
        <NeonButton onClick={onReturnToMenu} variant="secondary">Main Menu</NeonButton>
      </div>
    </>
  );
}

/** Game Over Overlay */
function GameOverOverlay({ score, onRestart, onReturnToMenu }: {
  score: ScoreState;
  onRestart: () => void;
  onReturnToMenu: () => void;
}) {
  return (
    <>
      <style jsx>{`
        .game-over-title {
          font-size: 48px;
          font-weight: bold;
          color: #ff3864;
          text-align: center;
          margin-bottom: 24px;
          text-shadow: 0 0 20px rgba(255, 56, 100, 0.8);
          letter-spacing: 4px;
        }

        .final-score {
          text-align: center;
          margin-bottom: 32px;
        }

        .final-score-label {
          font-size: 14px;
          color: #888;
          letter-spacing: 4px;
          margin-bottom: 8px;
        }

        .final-score-value {
          font-size: 36px;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .high-score-display {
          font-size: 14px;
          color: #ffd700;
          margin-top: 8px;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
      `}</style>
      <h2 className="game-over-title">GAME OVER</h2>
      <div className="final-score">
        <div className="final-score-label">FINAL SCORE</div>
        <div className="final-score-value">{score.current.toLocaleString()}</div>
        <div className="high-score-display">HIGH SCORE: {score.highScore.toLocaleString()}</div>
      </div>
      <div className="button-group">
        <NeonButton onClick={onRestart} variant="primary">Try Again</NeonButton>
        <NeonButton onClick={onReturnToMenu} variant="secondary">Main Menu</NeonButton>
      </div>
    </>
  );
}

/** Victory Overlay */
function VictoryOverlay({ score, level, onRestart, onReturnToMenu }: {
  score: ScoreState;
  level: LevelState;
  onRestart: () => void;
  onReturnToMenu: () => void;
}) {
  // Calculate stars based on performance
  const calculateStars = (): 1 | 2 | 3 => {
    const baseScore = level.currentLevel * 1000;
    if (score.current >= baseScore * 2) return 3;
    if (score.current >= baseScore * 1.5) return 2;
    return 1;
  };

  return (
    <>
      <style jsx>{`
        .victory-title {
          font-size: 48px;
          font-weight: bold;
          color: #ffd700;
          text-align: center;
          margin-bottom: 24px;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          letter-spacing: 4px;
          animation: victoryGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes victoryGlow {
          from { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
          to { text-shadow: 0 0 40px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.5); }
        }

        .victory-subtitle {
          text-align: center;
          color: #888;
          font-size: 16px;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }

        .final-score {
          text-align: center;
          margin-bottom: 16px;
        }

        .final-score-value {
          font-size: 32px;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          margin-top: 24px;
        }
      `}</style>
      <h2 className="victory-title">VICTORY!</h2>
      <div className="victory-subtitle">ALL LEVELS COMPLETE</div>
      <div className="final-score">
        <div className="final-score-value">{score.current.toLocaleString()}</div>
      </div>
      <StarRating stars={calculateStars()} />
      <div className="button-group">
        <NeonButton onClick={onRestart} variant="success">Play Again</NeonButton>
        <NeonButton onClick={onReturnToMenu} variant="secondary">Main Menu</NeonButton>
      </div>
    </>
  );
}

/** Main Game Overlay Component */
export function GameOverlay({
  gameState,
  score,
  level,
  onResume,
  onRestart,
  onReturnToMenu,
}: GameOverlayProps) {
  if (gameState === 'PLAYING' || gameState === 'MENU') {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .overlay-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          z-index: 100;
        }

        .overlay-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 101;
          background: linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%);
          padding: 48px 64px;
          border-radius: 12px;
          border: 2px solid #333;
          box-shadow: 
            0 0 40px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          min-width: 320px;
        }

        @media (max-width: 480px) {
          .overlay-content {
            padding: 32px 24px;
            min-width: 280px;
          }
        }
      `}</style>
      <div className="overlay-backdrop" />
      <div className="overlay-content">
        {gameState === 'PAUSED' && (
          <PauseOverlay 
            onResume={onResume}
            onRestart={onRestart}
            onReturnToMenu={onReturnToMenu}
          />
        )}
        {gameState === 'GAME_OVER' && (
          <GameOverOverlay 
            score={score}
            onRestart={onRestart}
            onReturnToMenu={onReturnToMenu}
          />
        )}
        {gameState === 'VICTORY' && (
          <VictoryOverlay 
            score={score}
            level={level}
            onRestart={onRestart}
            onReturnToMenu={onReturnToMenu}
          />
        )}
      </div>
    </>
  );
}

export default GameOverlay;

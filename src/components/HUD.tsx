/**
 * Game HUD Component
 * 
 * Displays lives as neon heart icons, score, level progress,
 * and game state information with retro neon aesthetic.
 */

'use client';

import { LifeState, ScoreState, LevelState, GameState } from '../lib/gameState';
import { GAME_STATE_LABELS } from '../lib/gameState';

interface HUDProps {
  gameState: GameState;
  lives: LifeState;
  score: ScoreState;
  level: LevelState;
}

/** Neon Heart Icon Component */
function HeartIcon({ filled, index }: { filled: boolean; index: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? 'url(#heartGradient)' : 'none'}
      stroke={filled ? '#ff3864' : '#444'}
      strokeWidth="2"
      className={`heart-icon ${filled ? 'heart-filled' : 'heart-empty'}`}
      style={{
        filter: filled ? 'drop-shadow(0 0 4px rgba(255, 56, 100, 0.8))' : 'none',
        animation: filled ? `pulse 1.5s ease-in-out ${index * 0.1}s infinite alternate` : 'none',
      }}
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3864" />
          <stop offset="100%" stopColor="#ff6b8a" />
        </linearGradient>
      </defs>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/** Lives Display with Neon Hearts */
function LivesDisplay({ lives }: { lives: LifeState }) {
  const hearts = [];
  for (let i = 0; i < lives.max; i++) {
    hearts.push(
      <HeartIcon 
        key={i} 
        filled={i < lives.current} 
        index={i}
      />
    );
  }

  return (
    <div className="lives-display">
      <span className="hud-label">LIVES</span>
      <div className="hearts-container">
        {hearts}
      </div>
    </div>
  );
}

/** Score Display */
function ScoreDisplay({ score }: { score: ScoreState }) {
  return (
    <div className="score-display">
      <div className="score-section">
        <span className="hud-label">SCORE</span>
        <span className="score-value">{score.current.toLocaleString()}</span>
      </div>
      <div className="score-section high-score">
        <span className="hud-label">HIGH</span>
        <span className="score-value">{score.highScore.toLocaleString()}</span>
      </div>
    </div>
  );
}

/** Level Progress Display */
function LevelDisplay({ level }: { level: LevelState }) {
  const progress = level.totalBricks > 0 
    ? Math.round((level.bricksDestroyed / level.totalBricks) * 100)
    : 0;

  return (
    <div className="level-display">
      <div className="level-section">
        <span className="hud-label">LEVEL</span>
        <span className="level-value">{level.currentLevel}</span>
      </div>
      <div className="progress-section">
        <span className="hud-label">PROGRESS</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );
}

/** Game State Badge */
function StateBadge({ state }: { state: GameState }) {
  const getStateColor = (s: GameState): string => {
    switch (s) {
      case 'PLAYING': return '#00ff41';
      case 'PAUSED': return '#ff9f1c';
      case 'GAME_OVER': return '#ff3864';
      case 'VICTORY': return '#ffd700';
      case 'MENU': return '#00d4ff';
      default: return '#888';
    }
  };

  return (
    <div 
      className="state-badge"
      style={{
        color: getStateColor(state),
        textShadow: `0 0 10px ${getStateColor(state)}80`,
      }}
    >
      {GAME_STATE_LABELS[state].toUpperCase()}
    </div>
  );
}

/** Main HUD Component */
export function HUD({ gameState, lives, score, level }: HUDProps) {
  return (
    <>
      <style jsx>{`
        .hud-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: linear-gradient(180deg, rgba(10, 10, 20, 0.95) 0%, rgba(10, 10, 20, 0.8) 100%);
          border-bottom: 2px solid #333;
          font-family: 'Courier New', monospace;
          min-height: 80px;
        }

        .hud-left {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .hud-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .hud-label {
          font-size: 10px;
          font-weight: bold;
          color: #888;
          letter-spacing: 2px;
        }

        /* Lives Display */
        .lives-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hearts-container {
          display: flex;
          gap: 6px;
        }

        .heart-icon {
          transition: all 0.3s ease;
        }

        .heart-filled {
          transform: scale(1);
        }

        .heart-empty {
          opacity: 0.3;
        }

        @keyframes pulse {
          from {
            transform: scale(1);
            filter: drop-shadow(0 0 4px rgba(255, 56, 100, 0.8));
          }
          to {
            transform: scale(1.1);
            filter: drop-shadow(0 0 8px rgba(255, 56, 100, 1));
          }
        }

        /* Score Display */
        .score-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .score-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .score-section.high-score .score-value {
          color: #ffd700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .score-value {
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          min-width: 80px;
          text-align: right;
          font-family: 'Courier New', monospace;
        }

        /* Level Display */
        .level-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 120px;
        }

        .level-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .level-value {
          font-size: 18px;
          font-weight: bold;
          color: #00d4ff;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff41, #00d4ff);
          transition: width 0.3s ease;
          box-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
        }

        .progress-text {
          font-size: 10px;
          color: #888;
          text-align: right;
        }

        /* State Badge */
        .state-badge {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 3px;
          padding: 8px 16px;
          border: 2px solid currentColor;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hud-container {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 16px;
          }

          .hud-left {
            gap: 16px;
          }

          .score-value {
            font-size: 14px;
            min-width: 60px;
          }

          .level-display {
            min-width: 80px;
          }

          .state-badge {
            font-size: 12px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .hud-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .hud-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <div className="hud-container">
        <div className="hud-left">
          <LivesDisplay lives={lives} />
          <ScoreDisplay score={score} />
          <LevelDisplay level={level} />
        </div>
        <div className="hud-right">
          <StateBadge state={gameState} />
        </div>
      </div>
    </>
  );
}

export default HUD;

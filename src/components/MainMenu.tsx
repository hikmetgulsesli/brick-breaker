/**
 * Main Menu Component
 * 
 * Displays the main menu with game title, start button,
 * level selector, and high score display.
 */

'use client';

import { useState, useMemo } from 'react';
import { LEVELS, LevelConfig } from '../entities/levels';
import { getBrickCount } from '../entities/levels';

interface MainMenuProps {
  highScore: number;
  unlockedLevels: number[];
  onStartGame: (levelNumber: number) => void;
}

/** Button Component with Neon Glow */
function NeonButton({ 
  onClick, 
  children, 
  variant = 'primary',
  disabled = false
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
}) {
  const getColors = () => {
    if (disabled) return { bg: '#444', glow: 'transparent' };
    switch (variant) {
      case 'primary': return { bg: '#00ff41', glow: 'rgba(0, 255, 65, 0.5)' };
      case 'secondary': return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)' };
      case 'danger': return { bg: '#ff3864', glow: 'rgba(255, 56, 100, 0.5)' };
      case 'success': return { bg: '#ffd700', glow: 'rgba(255, 215, 0, 0.5)' };
      default: return { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.5)' };
    }
  };

  const colors = getColors();

  return (
    <>
      <style jsx>{`
        .neon-button {
          padding: 16px 40px;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: 2px solid ${colors.bg};
          background: ${disabled ? '#222' : 'transparent'};
          color: ${disabled ? '#666' : colors.bg};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          border-radius: 4px;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          min-width: 220px;
        }

        .neon-button:not(:disabled):hover {
          background: ${colors.bg};
          color: #000;
          box-shadow: 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow};
          transform: translateY(-2px);
        }

        .neon-button:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>
      <button 
        className="neon-button"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </>
  );
}

/** Level Card Component */
function LevelCard({ 
  level, 
  isUnlocked, 
  isSelected, 
  onSelect 
}: { 
  level: LevelConfig;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const brickCount = useMemo(() => getBrickCount(level), [level]);
  
  // Generate a simple preview of the brick pattern
  const renderPreview = () => {
    const { grid, rows, cols } = level.pattern;
    const cellSize = 8;
    
    return (
      <svg 
        width={cols * cellSize} 
        height={rows * cellSize}
        className="level-preview-svg"
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (cell === 0) return null;
            const colors = ['#00ff41', '#ff9f1c', '#ff3864'];
            return (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * cellSize}
                y={rowIndex * cellSize}
                width={cellSize - 1}
                height={cellSize - 1}
                fill={colors[cell - 1]}
                opacity={isUnlocked ? 1 : 0.3}
              />
            );
          })
        )}
      </svg>
    );
  };

  return (
    <>
      <style jsx>{`
        .level-card {
          background: linear-gradient(135deg, rgba(30, 30, 40, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%);
          border: 2px solid ${isSelected ? '#00ff41' : isUnlocked ? '#444' : '#222'};
          border-radius: 8px;
          padding: 16px;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          transition: all 0.3s ease;
          opacity: ${isUnlocked ? 1 : 0.5};
          min-width: 140px;
          text-align: center;
        }

        .level-card:not(.locked):hover {
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          transform: translateY(-4px);
        }

        .level-card.selected {
          border-color: #00ff41;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
        }

        .level-number {
          font-size: 24px;
          font-weight: bold;
          color: ${isUnlocked ? '#fff' : '#666'};
          margin-bottom: 4px;
          text-shadow: ${isSelected ? '0 0 10px rgba(0, 255, 65, 0.8)' : 'none'};
        }

        .level-name {
          font-size: 12px;
          color: #888;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .level-preview {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
          height: 64px;
          align-items: center;
        }

        .level-preview-svg {
          max-width: 100%;
          max-height: 100%;
        }

        .level-stats {
          font-size: 10px;
          color: #666;
          letter-spacing: 1px;
        }

        .lock-icon {
          font-size: 24px;
          color: #444;
        }
      `}</style>
      <div 
        className={`level-card ${isSelected ? 'selected' : ''} ${isUnlocked ? '' : 'locked'}`}
        onClick={isUnlocked ? onSelect : undefined}
      >
        <div className="level-number">{level.levelNumber}</div>
        <div className="level-name">{level.name}</div>
        <div className="level-preview">
          {isUnlocked ? renderPreview() : <span className="lock-icon">🔒</span>}
        </div>
        <div className="level-stats">{brickCount} BRICKS</div>
      </div>
    </>
  );
}

/** Main Menu Component */
export function MainMenu({ highScore, unlockedLevels, onStartGame }: MainMenuProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);

  const handleStart = () => {
    onStartGame(selectedLevel);
  };

  return (
    <>
      <style jsx>{`
        .main-menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a14 0%, #141420 50%, #0a0a14 100%);
          padding: 24px;
          font-family: 'Courier New', monospace;
        }

        .game-title {
          font-size: 64px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 8px;
          background: linear-gradient(180deg, #fff 0%, #ccc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
        }

        .game-subtitle {
          font-size: 16px;
          color: #00d4ff;
          letter-spacing: 8px;
          margin-bottom: 48px;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        .high-score-display {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 12px 24px;
          border-radius: 4px;
          margin-bottom: 48px;
          text-align: center;
        }

        .high-score-label {
          font-size: 10px;
          color: #888;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }

        .high-score-value {
          font-size: 24px;
          font-weight: bold;
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        .level-selector {
          margin-bottom: 48px;
        }

        .level-selector-title {
          font-size: 14px;
          color: #888;
          letter-spacing: 2px;
          text-align: center;
          margin-bottom: 16px;
        }

        .level-grid {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .start-button-container {
          margin-bottom: 32px;
        }

        .controls-hint {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 48px;
        }

        .controls-hint p {
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .game-title {
            font-size: 40px;
          }

          .game-subtitle {
            font-size: 12px;
            letter-spacing: 4px;
          }

          .level-grid {
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .game-title {
            font-size: 32px;
          }

          .level-grid {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="main-menu">
        <h1 className="game-title">BRICK BREAKER</h1>
        <div className="game-subtitle">RETRO EDITION</div>

        <div className="high-score-display">
          <div className="high-score-label">HIGH SCORE</div>
          <div className="high-score-value">{highScore.toLocaleString()}</div>
        </div>

        <div className="level-selector">
          <div className="level-selector-title">SELECT LEVEL</div>
          <div className="level-grid">
            {LEVELS.map(level => (
              <LevelCard
                key={level.levelNumber}
                level={level}
                isUnlocked={unlockedLevels.includes(level.levelNumber)}
                isSelected={selectedLevel === level.levelNumber}
                onSelect={() => setSelectedLevel(level.levelNumber)}
              />
            ))}
          </div>
        </div>

        <div className="start-button-container">
          <NeonButton onClick={handleStart} variant="primary">
            Start Game
          </NeonButton>
        </div>

        <div className="controls-hint">
          <p>MOUSE / TOUCH to control paddle</p>
          <p>P to pause • ESC for menu</p>
        </div>
      </div>
    </>
  );
}

export default MainMenu;

'use client';

import { LifeState, ScoreState, LevelState } from '@/lib/gameState';

interface HUDProps {
  score: ScoreState;
  lives: LifeState;
  level: LevelState;
  activePowerUp: string | null;
  powerUpTimeRemaining?: number | null;
}

export const HUD = ({ score, lives, level, activePowerUp, powerUpTimeRemaining }: HUDProps) => {
  const getPowerUpLabel = (type: string | null) => {
    switch (type) {
      case 'wide': return 'WIDE';
      case 'multiball': return 'MULTI';
      case 'laser': return 'LASER';
      default: return null;
    }
  };

  const powerUpLabel = getPowerUpLabel(activePowerUp);
  const formattedTime = powerUpTimeRemaining ? Math.ceil(powerUpTimeRemaining / 1000) : null;

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">Score</span>
        <span className="hud-value">{score.current.toLocaleString()}</span>
      </div>

      <div className="hud-item">
        <span className="hud-label">Level</span>
        <span className="hud-value">{level.currentLevel}</span>
      </div>

      {powerUpLabel && (
        <div className="hud-item">
          <span className="hud-label">Power</span>
          <span className="hud-value" style={{
            color: activePowerUp === 'wide' ? 'var(--neon-cyan)' :
                   activePowerUp === 'multiball' ? 'var(--neon-purple)' :
                   'var(--neon-red)'
          }}>
            {powerUpLabel}{formattedTime !== null && activePowerUp !== 'multiball' ? ` ${formattedTime}s` : ''}
          </span>
        </div>
      )}

      <div className="hud-item">
        <span className="hud-label">Lives</span>
        <div className="lives-container">
          {[...Array(lives.max)].map((_, i) => (
            <div
              key={i}
              className={`life-icon ${i >= lives.current ? 'lost' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

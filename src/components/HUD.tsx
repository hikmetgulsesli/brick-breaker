'use client';

import { MuteToggleButton } from './MuteToggleButton';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  activePowerUp: string | null;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const HUD = ({ score, lives, level, activePowerUp, isMuted = false, onToggleMute }: HUDProps) => {
  const getPowerUpLabel = (type: string | null) => {
    switch (type) {
      case 'wide': return 'WIDE';
      case 'multiball': return 'MULTI';
      case 'laser': return 'LASER';
      default: return null;
    }
  };
  
  const powerUpLabel = getPowerUpLabel(activePowerUp);
  
  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">Score</span>
        <span className="hud-value">{score.toLocaleString()}</span>
      </div>
      
      <div className="hud-item">
        <span className="hud-label">Level</span>
        <span className="hud-value">{level}</span>
      </div>
      
      {onToggleMute && (
        <div className="hud-item">
          <MuteToggleButton 
            isMuted={isMuted} 
            onToggle={onToggleMute} 
            size="sm"
          />
        </div>
      )}
      
      {powerUpLabel && (
        <div className="hud-item">
          <span className="hud-label">Power</span>
          <span className="hud-value" style={{ 
            color: activePowerUp === 'wide' ? 'var(--neon-cyan)' : 
                   activePowerUp === 'multiball' ? 'var(--neon-purple)' : 
                   'var(--neon-red)'
          }}>
            {powerUpLabel}
          </span>
        </div>
      )}
      
      <div className="hud-item">
        <span className="hud-label">Lives</span>
        <div className="lives-container">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`life-icon ${i >= lives ? 'lost' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

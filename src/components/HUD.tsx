'use client';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  activePowerUp: string | null;
  onPauseClick?: () => void;
}

export const HUD = ({ score, lives, level, activePowerUp, onPauseClick }: HUDProps) => {
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
      
      {onPauseClick && (
        <div className="hud-item">
          <button
            onClick={onPauseClick}
            className="pause-button"
            aria-label="Pause game"
            title="Pause (ESC)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

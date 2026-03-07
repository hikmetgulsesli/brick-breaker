'use client';

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
    <div 
      className="hud"
      role="status"
      aria-label="Game status"
      aria-live="polite"
    >
      <div className="hud-item">
        <span className="hud-label">Score</span>
        <span 
          className="hud-value"
          aria-label={`Score: ${score.toLocaleString()}`}
        >
          {score.toLocaleString()}
        </span>
      </div>
      
      <div className="hud-item">
        <span className="hud-label">Level</span>
        <span 
          className="hud-value"
          aria-label={`Level: ${level}`}
        >
          {level}
        </span>
      </div>
      
      {onToggleMute && (
        <div className="hud-item">
          <button
            onClick={onToggleMute}
            className="p-1 rounded border border-[var(--border-subtle)] hover:border-[var(--neon-cyan)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neon-cyan)]"
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-pressed={isMuted}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-cyan)' }} aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
        </div>
      )}
      
      {powerUpLabel && (
        <div className="hud-item">
          <span className="hud-label">Power</span>
          <span 
            className="hud-value" 
            style={{ 
              color: activePowerUp === 'wide' ? 'var(--neon-cyan)' : 
                     activePowerUp === 'multiball' ? 'var(--neon-purple)' : 
                     'var(--neon-red)'
            }}
            aria-label={`Active power-up: ${powerUpLabel}`}
          >
            {powerUpLabel}
          </span>
        </div>
      )}
      
      <div className="hud-item">
        <span className="hud-label">Lives</span>
        <div 
          className="lives-container"
          role="img"
          aria-label={`${lives} lives remaining out of 3`}
        >
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`life-icon ${i >= lives ? 'lost' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

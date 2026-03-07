'use client';

interface GameOverOverlayProps {
  score: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverOverlay = ({ score, level, onRestart, onMenu }: GameOverOverlayProps) => {
  return (
    <div className="screen-overlay animate-fade-in">
      <h2 className="screen-title" style={{ 
        background: 'linear-gradient(90deg, var(--neon-red), var(--neon-orange))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Game Over
      </h2>
      
      <div className="score-display">{score.toLocaleString()}</div>
      
      <p className="screen-subtitle">Level {level} completed</p>
      
      <div className="menu-buttons">
        <button 
          className="menu-button menu-button-primary"
          onClick={onRestart}
        >
          Try Again
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onMenu}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};

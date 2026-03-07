'use client';

interface VictoryOverlayProps {
  score: number;
  lives: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const VictoryOverlay = ({ score, lives, level, onRestart, onMenu }: VictoryOverlayProps) => {
  // Calculate stars based on score
  const stars = score > 5000 ? 3 : score > 3000 ? 2 : 1;
  
  return (
    <div className="screen-overlay animate-fade-in">
      <h2 className="screen-title" style={{ 
        background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Victory!
      </h2>
      
      <div className="star-rating">
        {[1, 2, 3].map(star => (
          <svg
            key={star}
            className={`star ${star <= stars ? 'filled' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      
      <div className="score-display" style={{ color: 'var(--neon-green)' }}>
        {score.toLocaleString()}
      </div>
      
      <p className="screen-subtitle">All levels completed!</p>
      
      <div className="victory-bonus" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        margin: '16px 0',
        padding: '12px 20px',
        background: 'rgba(0, 245, 255, 0.1)',
        borderRadius: '8px',
        border: '1px solid var(--neon-cyan)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Level Reached</span>
          <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{level}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Lives Remaining</span>
          <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{lives}</span>
        </div>
      </div>
      
      <div className="menu-buttons">
        <button 
          className="menu-button menu-button-primary"
          onClick={onRestart}
        >
          Play Again
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

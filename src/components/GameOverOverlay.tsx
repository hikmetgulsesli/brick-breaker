'use client';

import { calculateCumulativeMaxScore, calculateStars } from '@/utils/score';

interface GameOverOverlayProps {
  score: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverOverlay = ({ score, level, onRestart, onMenu }: GameOverOverlayProps) => {
  const maxScore = calculateCumulativeMaxScore(level);
  const stars = calculateStars(score, maxScore);
  
  return (
    <div className="screen-overlay animate-fade-in" data-testid="game-over-overlay">
      <h2 
        className="screen-title" 
        style={{ 
          background: 'linear-gradient(90deg, var(--neon-red), var(--neon-orange))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
        data-testid="game-over-title"
      >
        GAME OVER
      </h2>
      
      {/* Star Rating */}
      <div className="star-rating" data-testid="star-rating">
        {[1, 2, 3].map(star => (
          <svg
            key={star}
            className={`star ${star <= stars ? 'filled' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            data-testid={`star-${star}`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      
      <div className="score-display" data-testid="final-score">
        {score.toLocaleString()}
      </div>
      
      <p className="screen-subtitle" data-testid="level-info">
        Level {level} • Max Possible: {maxScore.toLocaleString()}
      </p>
      
      <div className="menu-buttons">
        <button 
          className="menu-button menu-button-primary"
          onClick={onRestart}
          data-testid="play-again-button"
        >
          PLAY AGAIN
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onMenu}
          data-testid="main-menu-button"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

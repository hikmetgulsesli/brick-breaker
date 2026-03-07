'use client';

import { calculateCumulativeMaxScore, calculateStars, calculateLivesBonus } from '@/utils/score';

interface VictoryOverlayProps {
  score: number;
  lives: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const VictoryOverlay = ({ score, lives, onRestart, onMenu }: VictoryOverlayProps) => {
  const maxScore = calculateCumulativeMaxScore(3); // Victory is for completing all 3 levels
  const livesBonus = calculateLivesBonus(lives);
  const finalScore = score + livesBonus;
  const stars = calculateStars(finalScore, maxScore);
  
  return (
    <div className="screen-overlay animate-fade-in" data-testid="victory-overlay">
      <h2 
        className="screen-title" 
        style={{ 
          background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
        data-testid="victory-title"
      >
        VICTORY!
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
      
      {/* Base Score */}
      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }} data-testid="base-score">
        Base Score: {score.toLocaleString()}
      </div>
      
      {/* Lives Bonus */}
      <div 
        className="text-sm mb-2" 
        style={{ color: 'var(--neon-green)' }} 
        data-testid="lives-bonus"
      >
        Lives Bonus: +{livesBonus.toLocaleString()} ({lives} × 500)
      </div>
      
      {/* Final Score */}
      <div className="score-display" style={{ color: 'var(--neon-green)' }} data-testid="final-score">
        {finalScore.toLocaleString()}
      </div>
      
      <p className="screen-subtitle" data-testid="completion-text">
        All levels completed!
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

'use client';

import { BRICK_SCORES } from '@/types/game';

interface GameOverOverlayProps {
  score: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
}

/**
 * Calculate maximum possible score for a level
 * Based on brick layout patterns
 */
const calculateMaxScore = (level: number): number => {
  const patterns = [
    // Level 1: 30 bricks (all level 1)
    30 * BRICK_SCORES[1],
    // Level 2: 10 level-2 + 14 level-1 + 6 level-2 + 6 level-2 = 22 level-2 + 14 level-1
    22 * BRICK_SCORES[2] + 14 * BRICK_SCORES[1],
    // Level 3: 10 level-3 + 10 level-2 + 10 level-1 + 10 level-2 + 6 level-3 = 16 level-3 + 20 level-2 + 10 level-1
    16 * BRICK_SCORES[3] + 20 * BRICK_SCORES[2] + 10 * BRICK_SCORES[1],
  ];
  
  // Sum max scores for all levels up to current
  let total = 0;
  for (let i = 0; i < level && i < patterns.length; i++) {
    total += patterns[i];
  }
  return total;
};

/**
 * Calculate star rating based on score percentage
 * 1 star: >30%, 2 stars: >60%, 3 stars: >90%
 */
const calculateStars = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  const percentage = score / maxScore;
  if (percentage > 0.9) return 3;
  if (percentage > 0.6) return 2;
  if (percentage > 0.3) return 1;
  return 0;
};

export const GameOverOverlay = ({ score, level, onRestart, onMenu }: GameOverOverlayProps) => {
  const maxScore = calculateMaxScore(level);
  const stars = calculateStars(score, maxScore);
  
  return (
    <div 
      className="screen-overlay animate-fade-in" 
      data-testid="game-over-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Game Over"
    >
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
      <div 
        className="star-rating" 
        data-testid="star-rating"
        role="img"
        aria-label={`${stars} out of 3 stars earned`}
      >
        {[1, 2, 3].map(star => (
          <svg
            key={star}
            className={`star ${star <= stars ? 'filled' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            data-testid={`star-${star}`}
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      
      <div 
        className="score-display" 
        data-testid="final-score"
        aria-label={`Final score: ${score.toLocaleString()}`}
      >
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
          aria-label="Play again from level 1"
        >
          PLAY AGAIN
        </button>
        <button 
          className="menu-button menu-button-secondary"
          onClick={onMenu}
          data-testid="main-menu-button"
          aria-label="Return to main menu"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

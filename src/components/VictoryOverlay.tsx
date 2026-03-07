'use client';

import { BRICK_SCORES } from '@/types/game';

interface VictoryOverlayProps {
  score: number;
  lives: number;
  onRestart: () => void;
  onMenu: () => void;
  isLastLevel?: boolean;
}

/**
 * Calculate maximum possible score for all 3 levels
 * Based on brick layout patterns
 */
const calculateMaxScore = (): number => {
  const patterns = [
    // Level 1: 30 bricks (all level 1)
    30 * BRICK_SCORES[1],
    // Level 2: 22 level-2 + 14 level-1
    22 * BRICK_SCORES[2] + 14 * BRICK_SCORES[1],
    // Level 3: 16 level-3 + 20 level-2 + 10 level-1
    16 * BRICK_SCORES[3] + 20 * BRICK_SCORES[2] + 10 * BRICK_SCORES[1],
  ];
  return patterns.reduce((sum, score) => sum + score, 0);
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

/**
 * Calculate lives bonus
 * 500 points per remaining life
 */
const calculateLivesBonus = (lives: number): number => {
  return lives * 500;
};

export const VictoryOverlay = ({ score, lives, onRestart, onMenu, isLastLevel = true }: VictoryOverlayProps) => {
  const maxScore = calculateMaxScore();
  const livesBonus = calculateLivesBonus(lives);
  const finalScore = score + livesBonus;
  const stars = calculateStars(finalScore, maxScore);
  
  return (
    <div 
      className="screen-overlay animate-fade-in" 
      data-testid="victory-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Victory! All levels completed"
    >
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
      
      {/* Base Score */}
      <div 
        className="text-sm mb-1" 
        style={{ color: 'var(--text-secondary)' }} 
        data-testid="base-score"
        aria-label={`Base score: ${score.toLocaleString()}`}
      >
        Base Score: {score.toLocaleString()}
      </div>
      
      {/* Lives Bonus */}
      <div 
        className="text-sm mb-2" 
        style={{ color: 'var(--neon-green)' }} 
        data-testid="lives-bonus"
        aria-label={`Lives bonus: ${livesBonus.toLocaleString()} points`}
      >
        Lives Bonus: +{livesBonus.toLocaleString()} ({lives} × 500)
      </div>
      
      {/* Final Score */}
      <div 
        className="score-display" 
        style={{ color: 'var(--neon-green)' }} 
        data-testid="final-score"
        aria-label={`Final score: ${finalScore.toLocaleString()}`}
      >
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

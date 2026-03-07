'use client';

import { memo } from 'react';
import { GAME_CONFIG } from '@/types/game';

interface LifeCounterProps {
  lives: number;
}

export const LifeCounter = memo(({ lives }: LifeCounterProps) => {
  const maxLives = GAME_CONFIG.MAX_LIVES;
  
  return (
    <div className="life-counter-container">
      <span className="life-label">Lives</span>
      <div className="life-hearts">
        {Array.from({ length: maxLives }).map((_, index) => (
          <div
            key={index}
            className={`life-heart ${index < lives ? 'active' : 'lost'}`}
            aria-label={index < lives ? 'Active life' : 'Lost life'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="heart-icon">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
});

LifeCounter.displayName = 'LifeCounter';

'use client';

import { memo } from 'react';

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay = memo(({ score }: ScoreDisplayProps) => {
  return (
    <div className="score-display-container">
      <span className="score-label">Score</span>
      <span className="score-value">{score.toLocaleString().padStart(6, '0')}</span>
    </div>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';

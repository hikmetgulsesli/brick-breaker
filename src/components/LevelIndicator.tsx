'use client';

import { memo } from 'react';

interface LevelIndicatorProps {
  level: number;
}

export const LevelIndicator = memo(({ level }: LevelIndicatorProps) => {
  return (
    <div className="level-indicator-container">
      <span className="level-label">Level</span>
      <span className="level-value">{level}</span>
    </div>
  );
});

LevelIndicator.displayName = 'LevelIndicator';

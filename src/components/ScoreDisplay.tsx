'use client';

import { useRef, useMemo } from 'react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
  comboMultiplier: number;
  className?: string;
}

export const ScoreDisplay = ({ score, combo, comboMultiplier, className = '' }: ScoreDisplayProps) => {
  const prevScoreRef = useRef(score);
  const scoreChanged = score !== prevScoreRef.current;
  
  // Update ref after render
  if (scoreChanged) {
    prevScoreRef.current = score;
  }

  const formatScore = (value: number): string => {
    return value.toLocaleString();
  };

  const getMultiplierColor = (multiplier: number): string => {
    if (multiplier >= 4) return 'var(--neon-red)';
    if (multiplier >= 3) return 'var(--neon-purple)';
    if (multiplier >= 2) return 'var(--neon-orange)';
    return 'var(--neon-green)';
  };

  // Use key from score to force re-render animation
  const animationKey = useMemo(() => `${score}-${combo}`, [score, combo]);

  return (
    <div className={`score-display-container ${className}`}>
      <div 
        key={`score-${animationKey}`}
        className="score-value score-pop"
      >
        {formatScore(score)}
      </div>
      
      {combo > 0 && (
        <div 
          key={`combo-${animationKey}`}
          className="combo-indicator"
        >
          <span className="combo-count">{combo}x</span>
          <span className="combo-multiplier" style={{ color: getMultiplierColor(comboMultiplier) }}>
            {comboMultiplier.toFixed(1)}x
          </span>
        </div>
      )}
    </div>
  );
};

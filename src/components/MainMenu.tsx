'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { HighScore } from '@/types/game';
import { NeonButton } from './NeonButton';
import { ParticleBackground } from './ParticleBackground';

interface MainMenuProps {
  onStart: (level: number) => void;
  highScores: HighScore[];
}

export const MainMenu = ({ onStart, highScores }: MainMenuProps) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showHighScores, setShowHighScores] = useState(false);
  const [focusedButton, setFocusedButton] = useState(0);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Button configurations for keyboard navigation
  const getButtons = useCallback(() => {
    if (showHighScores) {
      return ['back'];
    }
    return ['start', 'level-1', 'level-2', 'level-3', 'highscores'];
  }, [showHighScores]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const buttons = getButtons();
      
      if (e.key === 'Tab') {
        e.preventDefault();
        setFocusedButton(prev => {
          const next = e.shiftKey 
            ? (prev - 1 + buttons.length) % buttons.length 
            : (prev + 1) % buttons.length;
          buttonRefs.current[next]?.focus();
          return next;
        });
      }
      
      if (e.key === 'Enter' && buttonRefs.current[focusedButton]) {
        buttonRefs.current[focusedButton]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedButton, getButtons]);

  // Focus first button on mount
  useEffect(() => {
    startButtonRef.current?.focus();
  }, []);

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setFocusedButton(level);
  };

  const handleStart = () => {
    onStart(selectedLevel);
  };

  if (showHighScores) {
    return (
      <div className="screen-overlay animate-fade-in">
        <ParticleBackground particleCount={20} />
        
        <h2 className="screen-title text-glow-cyan animate-pulse-glow">
          High Scores
        </h2>
        
        <div className="w-full max-w-md animate-slide-in z-10">
          <div className="mb-6 max-h-48 overflow-y-auto bg-bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border-subtle">
            {highScores.length === 0 ? (
              <p className="text-center text-text-secondary py-4">No high scores yet!</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2 px-2 text-sm text-text-secondary">Rank</th>
                    <th className="text-left py-2 px-2 text-sm text-text-secondary">Score</th>
                    <th className="text-left py-2 px-2 text-sm text-text-secondary">Level</th>
                    <th className="text-left py-2 px-2 text-sm text-text-secondary">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((score, index) => (
                    <tr key={index} className="border-b border-border-subtle/50">
                      <td className="py-2 px-2 text-sm text-neon-cyan">#{index + 1}</td>
                      <td className="py-2 px-2 text-sm font-bold">{score.score.toLocaleString()}</td>
                      <td className="py-2 px-2 text-sm">{score.level}</td>
                      <td className="py-2 px-2 text-sm text-text-muted">
                        {new Date(score.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="menu-buttons z-10">
            <NeonButton
              ref={el => { buttonRefs.current[0] = el; }}
              variant="secondary"
              size="lg"
              onClick={() => {
                setShowHighScores(false);
                setFocusedButton(0);
              }}
              aria-label="Back to main menu"
            >
              Back
            </NeonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-overlay animate-fade-in">
      <ParticleBackground particleCount={30} />
      
      <h1 className="screen-title text-glow-cyan animate-pulse-glow z-10">
        Retro Brick Breaker
      </h1>
      
      <p className="screen-subtitle z-10">
        Break all bricks. Save the galaxy.
      </p>
      
      <div className="level-selector z-10" role="group" aria-label="Level selection">
        {[1, 2, 3].map((level, index) => (
          <button
            key={level}
            ref={el => { buttonRefs.current[index + 1] = el; }}
            className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
            onClick={() => handleLevelSelect(level)}
            aria-pressed={selectedLevel === level}
            aria-label={`Select level ${level}`}
            tabIndex={-1}
          >
            {level}
          </button>
        ))}
      </div>
      
      <div className="menu-buttons z-10">
        <NeonButton
          ref={el => { 
            buttonRefs.current[0] = el;
            startButtonRef.current = el;
          }}
          variant="primary"
          size="lg"
          onClick={handleStart}
          aria-label="Start game"
        >
          Start Game
        </NeonButton>
        
        <NeonButton
          ref={el => { buttonRefs.current[4] = el; }}
          variant="secondary"
          size="lg"
          onClick={() => {
            setShowHighScores(true);
            setFocusedButton(0);
          }}
          aria-label="View high scores"
        >
          High Scores
        </NeonButton>
      </div>
      
      <div className="mt-8 text-sm text-center text-text-muted z-10">
        <p>Mouse/Touch to move paddle</p>
        <p className="mt-1">Click to shoot lasers (when active)</p>
        <p className="mt-2 text-xs">Press Tab to navigate, Enter to select</p>
      </div>
    </div>
  );
};

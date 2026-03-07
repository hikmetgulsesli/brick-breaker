'use client';

import { useState } from 'react';
import type { HighScore } from '@/types/game';

interface MainMenuProps {
  onStart: (level: number) => void;
  highScores: HighScore[];
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const MainMenu = ({ onStart, highScores, isMuted = false, onToggleMute }: MainMenuProps) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showHighScores, setShowHighScores] = useState(false);
  
  return (
    <div className="screen-overlay animate-fade-in">
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--neon-cyan)] transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-cyan)' }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>
      <h1 className="screen-title">Retro Brick Breaker</h1>
      <p className="screen-subtitle">Break all bricks. Save the galaxy.</p>
      
      {showHighScores ? (
        <div className="w-full max-w-md animate-slide-in">
          <h2 className="text-xl font-bold mb-4 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)' }}>
            High Scores
          </h2>
          <div className="mb-6 max-h-48 overflow-y-auto">
            {highScores.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No high scores yet!</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Rank</th>
                    <th className="text-left py-2 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Score</th>
                    <th className="text-left py-2 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Level</th>
                    <th className="text-left py-2 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((score, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 px-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>#{index + 1}</td>
                      <td className="py-2 px-2 text-sm font-bold">{score.score.toLocaleString()}</td>
                      <td className="py-2 px-2 text-sm">{score.level}</td>
                      <td className="py-2 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(score.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="menu-buttons">
            <button 
              className="menu-button menu-button-secondary"
              onClick={() => setShowHighScores(false)}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="level-selector">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
          
          <div className="menu-buttons">
            <button 
              className="menu-button menu-button-primary"
              onClick={() => onStart(selectedLevel)}
            >
              Start Game
            </button>
            <button 
              className="menu-button menu-button-secondary"
              onClick={() => setShowHighScores(true)}
            >
              High Scores
            </button>
          </div>
          
          <div className="mt-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            <p>Mouse/Touch to move paddle</p>
            <p className="mt-1">Click to shoot lasers (when active)</p>
          </div>
        </>
      )}
    </div>
  );
};

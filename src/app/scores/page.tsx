'use client';

import Link from 'next/link';
import { useSyncExternalStore, useCallback } from 'react';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeonButton } from '@/components/NeonButton';
import type { HighScore } from '@/types/game';

const useLocalStorage = (key: string, initialValue: HighScore[]): HighScore[] => {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as HighScore[];
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  }, [key, initialValue]);

  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const subscribe = useCallback((callback: () => void) => {
    const handleStorage = () => callback();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default function ScoresPage() {
  const highScores = useLocalStorage('brickBreakerHighScores', []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">
        <h1 className="screen-title mb-4">High Scores</h1>
        <p className="screen-subtitle mb-8">Top 10 galaxy defenders</p>
        
        <div className="w-full mb-8 max-h-80 overflow-y-auto bg-opacity-50 rounded-lg p-4" style={{ background: 'var(--bg-card)' }}>
          {highScores.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No high scores yet! Play a game to set a record.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Rank</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Score</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Level</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((score, index) => (
                  <tr key={score.date} className="border-b border-gray-800 last:border-0">
                    <td className="py-3 px-2 text-sm font-bold" style={{ color: index < 3 ? 'var(--neon-cyan)' : 'var(--text-secondary)' }}>
                      #{index + 1}
                      {index === 0 && ' 🥇'}
                      {index === 1 && ' 🥈'}
                      {index === 2 && ' 🥉'}
                    </td>
                    <td className="py-3 px-2 text-sm font-bold" style={{ color: 'var(--neon-green)' }}>
                      {score.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-sm">{score.level}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <nav className="menu-buttons">
          <Link href="/" className="w-full">
            <NeonButton variant="primary" className="w-full">
              Back to Menu
            </NeonButton>
          </Link>
          
          <Link href="/levels" className="w-full">
            <NeonButton variant="secondary" className="w-full">
              Play Again
            </NeonButton>
          </Link>
        </nav>
      </div>
    </main>
  );
}

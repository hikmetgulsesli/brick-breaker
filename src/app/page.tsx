'use client';

import { useState, useSyncExternalStore } from 'react';
import { MainMenu } from '@/components/MainMenu';
import type { HighScore } from '@/types/game';

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): T {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return JSON.stringify(initialValue);
    return localStorage.getItem(key) ?? JSON.stringify(initialValue);
  };

  const subscribe = (callback: () => void) => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) callback();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  };

  const getServerSnapshot = () => JSON.stringify(initialValue);

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  try {
    return JSON.parse(stored) as T;
  } catch {
    return initialValue;
  }
}

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu');
  const highScores = useLocalStorage<HighScore[]>('brick-breaker-highscores', []);

  const handleStartGame = (level: number) => {
    console.log('Starting game at level:', level);
    setGameState('playing');
  };

  return (
    <main className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-bg-darker rounded-xl overflow-hidden border border-border-subtle">
        {/* Game border glow effect */}
        <div className="absolute inset-0 rounded-xl pointer-events-none" 
          style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(255, 0, 160, 0.1), rgba(188, 19, 254, 0.1))',
            padding: '2px',
          }} 
        />
        
        {gameState === 'menu' && (
          <MainMenu 
            onStart={handleStartGame}
            highScores={highScores}
          />
        )}
        
        {gameState === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl text-neon-cyan mb-4">Game Started!</h2>
              <button 
                onClick={() => setGameState('menu')}
                className="neon-button neon-button-cyan neon-button-md"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

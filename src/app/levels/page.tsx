'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeonButton } from '@/components/NeonButton';
import { useGameContext } from '@/contexts/GameContext';

export default function LevelsPage() {
  const router = useRouter();
  const { selectedLevel, setSelectedLevel } = useGameContext();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const handleStartGame = () => {
    router.push(`/game?level=${selectedLevel}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
        <h1 className="screen-title mb-4">Select Level</h1>
        <p className="screen-subtitle mb-8">Choose your challenge</p>
        
        <div className="level-selector mb-8">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
              onClick={() => setSelectedLevel(level)}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
              aria-label={`Select level ${level}`}
              aria-pressed={selectedLevel === level}
            >
              {level}
            </button>
          ))}
        </div>
        
        <div className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {hoveredLevel === 1 && (
            <p>Level 1: Beginner - Standard brick pattern</p>
          )}
          {hoveredLevel === 2 && (
            <p>Level 2: Intermediate - Mixed brick levels</p>
          )}
          {hoveredLevel === 3 && (
            <p>Level 3: Expert - Hard pattern with tough bricks</p>
          )}
          {!hoveredLevel && (
            <p>Hover over a level for details</p>
          )}
        </div>
        
        <nav className="menu-buttons">
          <NeonButton 
            variant="primary" 
            className="w-full"
            onClick={handleStartGame}
          >
            Play Level {selectedLevel}
          </NeonButton>
          
          <Link href="/" className="w-full">
            <NeonButton variant="secondary" className="w-full">
              Back to Menu
            </NeonButton>
          </Link>
        </nav>
      </div>
    </main>
  );
}
